#!/bin/bash

# ============================================================================
# Reality Follow-up AI - Automatická instalace na Linux VPS
# ============================================================================
# Použití: bash install-vps.sh
# ============================================================================

set -e

# Barvy pro výstup
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funkce pro tisk zpráv
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

if [[ $EUID -ne 0 ]]; then
   print_error "Tento skript musí být spuštěn jako root (sudo bash install-vps.sh)"
   exit 1
fi

print_success "Běží jako root"

# Detekce OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    print_error "Nepodporovaný operační systém"
    exit 1
fi

print_success "OS: $OS"

# ============================================================================
# KROK 2: AKTUALIZACE SYSTÉMU
# ============================================================================
print_header "KROK 2: Aktualizace systému"

if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get update -y
    apt-get upgrade -y
    print_success "Systém aktualizován"
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum update -y
    print_success "Systém aktualizován"
else
    print_warning "Automatická aktualizace není podporována pro $OS"
fi

# ============================================================================
# KROK 3: INSTALACE DOCKER
# ============================================================================
print_header "KROK 3: Instalace Docker"

if command -v docker &> /dev/null; then
    print_success "Docker je již nainstalován"
else
    print_warning "Instaluji Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    bash get-docker.sh
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

APP_DIR="/opt/reality-crm"
mkdir -p $APP_DIR
cd $APP_DIR

print_success "Adresář vytvořen: $APP_DIR"

# ============================================================================
# KROK 6: STAŽENÍ APLIKACE
# ============================================================================
print_header "KROK 6: Stažení aplikace"

print_warning "Prosím, nahrajte ZIP soubor do $APP_DIR"
print_warning "Příkaz: scp reality-followup-ai.zip root@TVOJE_IP:/opt/reality-crm/"
print_warning "Pak stiskněte Enter..."
read

if [ ! -f "reality-followup-ai.zip" ]; then
    print_error "ZIP soubor nenalezen!"
    exit 1
fi

unzip -q reality-followup-ai.zip
rm reality-followup-ai.zip

print_success "Aplikace rozbalena"

# ============================================================================
# KROK 7: VYTVOŘENÍ DOCKER IMAGE
# ============================================================================
print_header "KROK 7: Vytvoření Docker image"

# Kontrola Dockerfile
if [ ! -f "Dockerfile" ]; then
    print_warning "Dockerfile nenalezen, vytvářím..."
    cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Instalace pnpm
RUN npm install -g pnpm

# Kopírování souborů
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Instalace závislostí
RUN pnpm install --frozen-lockfile

# Kopírování zbytku aplikace
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["node", "dist/server/index.ts"]
EOF
    print_success "Dockerfile vytvořen"
fi

# Build image
print_warning "Vytvářím Docker image (trvá cca 5-10 minut)..."
docker build -t reality-crm:latest .
print_success "Docker image vytvořen"

# ============================================================================
# KROK 8: SPUŠTĚNÍ APLIKACE
# ============================================================================
print_header "KROK 8: Spuštění aplikace"

# Kontrola docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    print_warning "docker-compose.yml nenalezen, vytvářím..."
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    image: reality-crm:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DATABASE_URL: "postgresql://postgres:postgres@localhost/reality_followup"
      VITE_APP_ID: "manus-app-id"
      OAUTH_SERVER_URL: "https://api.manus.im"
      VITE_OAUTH_PORTAL_URL: "https://portal.manus.im"
      JWT_SECRET: "change-me-to-random-secret"
      LICENSE_SECRET: "change-me-to-random-secret"
    restart: always
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: reality_followup
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always

volumes:
  postgres_data:
EOF
    print_success "docker-compose.yml vytvořen"
fi

# Spuštění kontejnerů
print_warning "Spouštím aplikaci..."
docker-compose up -d
print_success "Aplikace spuštěna"

# ============================================================================
# KROK 9: NASTAVENÍ FIREWALLU
# ============================================================================
print_header "KROK 9: Nastavení firewallu"

if command -v ufw &> /dev/null; then
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    print_success "Firewall nakonfigurován"
else
    print_warning "UFW není nainstalován"
fi

# ============================================================================
# KROK 10: FINÁLNÍ ZPRÁVA
# ============================================================================
print_header "Instalace dokončena!"

echo -e "${GREEN}Aplikace běží na:${NC}"
echo -e "${BLUE}  http://TVOJE_IP:3000${NC}"
echo ""
echo -e "${GREEN}Užitečné příkazy:${NC}"
echo -e "${BLUE}  Zobrazit logy: docker-compose logs -f${NC}"
echo -e "${BLUE}  Restart: docker-compose restart${NC}"
echo -e "${BLUE}  Stop: docker-compose down${NC}"
echo ""
echo -e "${YELLOW}Příští kroky:${NC}"
echo -e "  1. Nastavit SSL certifikát (Let's Encrypt)"
echo -e "  2. Nastavit vlastní doménu"
echo -e "  3. Nakonfigurovat Resend webhook"
echo -e "  4. Nakonfigurovat Google Calendar"
echo ""
print_success "Vše je hotovo! 🚀"
