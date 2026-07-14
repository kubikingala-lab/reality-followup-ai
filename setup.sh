#!/bin/bash

# ============================================================================
# Reality Follow-up AI - Automatizovaný Setup Skript
# ============================================================================
# Tento skript automaticky nainstaluje a spustí aplikaci na Oracle Cloud
# Použití: bash setup.sh
# ============================================================================

set -e  # Zastavit na chybě

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkce pro tisk
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# ============================================================================
# KROK 1: KONTROLA SYSTÉMU
# ============================================================================
print_header "KROK 1: Kontrola systému"

if [ "$EUID" -ne 0 ]; then 
    print_error "Tento skript musí být spuštěn jako root (sudo bash setup.sh)"
    exit 1
fi

print_success "Běžíte jako root"

# Kontrola OS
if ! grep -q "Ubuntu\|Debian" /etc/os-release; then
    print_error "Tento skript podporuje pouze Ubuntu/Debian"
    exit 1
fi

print_success "OS je kompatibilní"

# ============================================================================
# KROK 2: AKTUALIZACE SYSTÉMU
# ============================================================================
print_header "KROK 2: Aktualizace systému"

apt update -qq
apt upgrade -y -qq

print_success "Systém aktualizován"

# ============================================================================
# KROK 3: INSTALACE DOCKER
# ============================================================================
print_header "KROK 3: Instalace Docker"

if command -v docker &> /dev/null; then
    print_success "Docker je již nainstalován"
else
    print_warning "Instaluji Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_success "Docker nainstalován"
fi

# ============================================================================
# KROK 4: INSTALACE DOCKER COMPOSE
# ============================================================================
print_header "KROK 4: Instalace Docker Compose"

if command -v docker-compose &> /dev/null; then
    print_success "Docker Compose je již nainstalován"
else
    print_warning "Instaluji Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose nainstalován"
fi

# ============================================================================
# KROK 5: PŘÍPRAVA ADRESÁŘE
# ============================================================================
print_header "KROK 5: Příprava adresáře"

if [ ! -d "/opt/reality-followup-ai" ]; then
    mkdir -p /opt/reality-followup-ai
    print_success "Adresář /opt/reality-followup-ai vytvořen"
else
    print_success "Adresář /opt/reality-followup-ai již existuje"
fi

cd /opt/reality-followup-ai

# ============================================================================
# KROK 6: KONTROLA .env SOUBORU
# ============================================================================
print_header "KROK 6: Nastavení .env souboru"

if [ ! -f ".env" ]; then
    if [ -f "env.example.txt" ]; then
        cp env.example.txt .env
        print_success ".env soubor vytvořen z šablony"
    else
        print_error "env.example.txt nenalezen!"
        exit 1
    fi
else
    print_success ".env soubor již existuje"
fi

# Generování tajných klíčů, pokud nejsou nastaveny
if ! grep -q "LICENSE_SECRET=" .env || grep "LICENSE_SECRET=default" .env; then
    LICENSE_SECRET=$(openssl rand -base64 32)
    sed -i "s/LICENSE_SECRET=.*/LICENSE_SECRET=$LICENSE_SECRET/" .env
    print_success "LICENSE_SECRET vygenerován"
fi

if ! grep -q "JWT_SECRET=" .env || grep "JWT_SECRET=default" .env; then
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    print_success "JWT_SECRET vygenerován"
fi

# ============================================================================
# KROK 7: SPUŠTĚNÍ DOCKER KONTEJNERŮ
# ============================================================================
print_header "KROK 7: Spuštění Docker kontejnerů"

print_warning "Spouštím Docker kontejnery..."
docker-compose up -d

print_success "Docker kontejnery spuštěny"

# ============================================================================
# KROK 8: ČEKÁNÍ NA INICIALIZACI
# ============================================================================
print_header "KROK 8: Čekání na inicializaci databáze"

print_warning "Čekám 30 sekund, aby se databáze inicializovala..."
sleep 30

# Kontrola, zda běží
if docker-compose ps | grep -q "reality-followup-ai-app.*Up"; then
    print_success "Aplikace běží"
else
    print_error "Aplikace se nespustila!"
    docker-compose logs app
    exit 1
fi

if docker-compose ps | grep -q "reality-followup-ai-db.*Up"; then
    print_success "Databáze běží"
else
    print_error "Databáze se nespustila!"
    docker-compose logs db
    exit 1
fi

# ============================================================================
# KROK 9: NASTAVENÍ FIREWALL
# ============================================================================
print_header "KROK 9: Nastavení firewall"

if command -v ufw &> /dev/null; then
    print_warning "Povoluju porty v UFW..."
    ufw allow 22/tcp -q
    ufw allow 80/tcp -q
    ufw allow 443/tcp -q
    ufw allow 3000/tcp -q
    ufw --force enable -q
    print_success "Firewall nakonfigurován"
else
    print_warning "UFW není nainstalován, přeskakuji firewall"
fi

# ============================================================================
# KROK 10: INFORMACE O PŘÍSTUPU
# ============================================================================
print_header "KROK 10: Informace o přístupu"

# Získání IP adresy
IP_ADDRESS=$(hostname -I | awk '{print $1}')

echo -e "${GREEN}Aplikace je nyní spuštěna!${NC}\n"
echo -e "Přístup k aplikaci:"
echo -e "  URL: ${BLUE}http://$IP_ADDRESS:3000${NC}"
echo -e "  Přihlášení: Klikněte 'Přihlásit se' → Manus OAuth\n"

echo -e "Generování licencí:"
echo -e "  Demo licence (30 dní):"
echo -e "    ${BLUE}cd /opt/reality-followup-ai${NC}"
echo -e "    ${BLUE}node generate-license.js --demo${NC}\n"

echo -e "  Licence pro zákazníka (1 rok):"
echo -e "    ${BLUE}node generate-license.js cust_001 'Jan Novák' 'jan@example.com' 365${NC}\n"

echo -e "Užitečné příkazy:"
echo -e "  Zobrazit logy: ${BLUE}cd /opt/reality-followup-ai && docker-compose logs -f app${NC}"
echo -e "  Zastavit aplikaci: ${BLUE}cd /opt/reality-followup-ai && docker-compose down${NC}"
echo -e "  Restartovat aplikaci: ${BLUE}cd /opt/reality-followup-ai && docker-compose restart${NC}\n"

echo -e "Dokumentace:"
echo -e "  Kompletní návod: ${BLUE}cat /opt/reality-followup-ai/KOMPLETNI_NAVOD.md${NC}"
echo -e "  Oracle Cloud návod: ${BLUE}cat /opt/reality-followup-ai/ORACLE_CLOUD_FREE.md${NC}"
echo -e "  Prodejní návod: ${BLUE}cat /opt/reality-followup-ai/PRODEJNI_NAVOD.md${NC}\n"

print_success "Setup dokončen! 🎉"

# ============================================================================
# KROK 11: GENEROVÁNÍ DEMO LICENCE
# ============================================================================
print_header "KROK 11: Generování demo licence"

cd /opt/reality-followup-ai

echo -e "Generuji demo licenci...\n"
DEMO_LICENSE=$(node generate-license.js --demo 2>&1 | grep -A 5 "Licenční klíč:" | tail -1)

echo -e "${GREEN}Demo licence:${NC}"
echo -e "$DEMO_LICENSE\n"

# ============================================================================
# FINÁLNÍ ZPRÁVA
# ============================================================================
print_header "Instalace dokončena!"

echo -e "Vaše aplikace je nyní připravena k použití!\n"

echo -e "Příští kroky:"
echo -e "1. Otevřete v prohlížeči: ${BLUE}http://$IP_ADDRESS:3000${NC}"
echo -e "2. Přihlaste se přes Manus OAuth"
echo -e "3. Vygenerujte licenci pro prvního zákazníka"
echo -e "4. Pošlete mu přístupové údaje\n"

echo -e "Máte-li otázky, podívejte se na dokumentaci v /opt/reality-followup-ai/\n"

print_success "Vše je hotovo! Vítejte v Reality Follow-up AI! 🚀"
