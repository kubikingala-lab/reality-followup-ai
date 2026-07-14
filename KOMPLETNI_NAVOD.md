# Kompletní Návod: Stažení, Nasazení a Spuštění

Tento návod vás provede všemi kroky od stažení ZIP souboru až po spuštění aplikace na serveru.

---

## ČÁST 1: STAŽENÍ ZIP SOUBORU

### Kde stáhnout?
ZIP soubor je v `/home/ubuntu/Downloads/` na vašem počítači.

**Soubor:** `reality-followup-ai-with-licensing.zip` (313 KB)

### Jak stáhnout?
1. Otevřete průzkumník souborů
2. Jděte do `C:\Users\[VašeJméno]\Downloads\` (Windows) nebo `~/Downloads` (Mac/Linux)
3. Najděte `reality-followup-ai-with-licensing.zip`
4. Zkopírujte si jej na bezpečné místo

---

## ČÁST 2: PŘÍPRAVA SERVERU

### Krok 1: Pronajmutí VPS serveru

Doporučené VPS poskytovatele:
- **DigitalOcean** - https://digitalocean.com (nejjednoduší)
- **Hetzner** - https://hetzner.com (nejlevnější)
- **Linode** - https://linode.com (spolehlivý)
- **AWS** - https://aws.amazon.com (pokročilý)

**Minimální požadavky:**
- OS: Ubuntu 20.04 LTS nebo CentOS 8+
- RAM: 2GB
- Disk: 20GB
- CPU: 1 vCore

**Cena:** 100-200 Kč/měsíc

### Krok 2: Přihlášení na server

Po pronajmutí serveru dostanete:
- IP adresu (např. 123.45.67.89)
- Uživatelské jméno (obvykle `root`)
- Heslo (nebo SSH klíč)

Přihlášení přes SSH:
```bash
ssh root@123.45.67.89
```

Zadejte heslo, když se zeptá.

---

## ČÁST 3: INSTALACE DOCKER

### Krok 1: Aktualizace systému
```bash
apt update && apt upgrade -y
```

### Krok 2: Instalace Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### Krok 3: Instalace Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Krok 4: Ověření instalace
```bash
docker --version
docker-compose --version
```

Měli byste vidět verze obou nástrojů.

---

## ČÁST 4: NAHRÁNÍ ZIP NA SERVER

### Krok 1: Nahrání ZIP souboru
Na svém počítači spusťte:

```bash
scp reality-followup-ai-with-licensing.zip root@123.45.67.89:/opt/
```

Nahraďte `123.45.67.89` vaší IP adresou.

### Krok 2: Rozbalení ZIP
Na serveru spusťte:

```bash
cd /opt
unzip reality-followup-ai-with-licensing.zip
cd reality-followup-ai
```

---

## ČÁST 5: NASTAVENÍ APLIKACE

### Krok 1: Vytvoření .env souboru
```bash
cp env.example.txt .env
nano .env
```

### Krok 2: Vyplnění .env souboru

Otevřete `.env` a vyplňte tyto hodnoty:

```env
# Databáze (ponechte výchozí)
DATABASE_URL=mysql://root:heslo123@db:3306/reality_followup

# OAuth (získejte z https://manus.im)
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Resend (e-maily) - https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Google Calendar - https://console.cloud.google.com
GOOGLE_CALENDAR_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_REDIRECT_URI=https://vas-domena.cz/api/oauth/google/callback

# Licence - generujte pomocí: openssl rand -base64 32
LICENSE_SECRET=super-tajny-klic-zmenit-na-vlastni

# JWT - generujte pomocí: openssl rand -base64 32
JWT_SECRET=generate-random-string

# Ostatní
NODE_ENV=production
```

### Krok 3: Uložení souboru
V `nano` editoru:
- Stiskněte `Ctrl+X`
- Napište `Y` (ano)
- Stiskněte `Enter`

---

## ČÁST 6: SPUŠTĚNÍ APLIKACE

### Krok 1: Spuštění Docker kontejnerů
```bash
docker-compose up -d
```

Čekejte 30 sekund, aby se databáze inicializovala.

### Krok 2: Ověření, že běží
```bash
docker-compose ps
```

Měli byste vidět:
```
NAME                        STATUS
reality-followup-ai-app     Up 2 minutes
reality-followup-ai-db      Up 2 minutes
```

### Krok 3: Kontrola logů
```bash
docker-compose logs app
```

Měli byste vidět:
```
Server running on http://localhost:3000/
```

---

## ČÁST 7: PŘÍSTUP K APLIKACI

### Přístup přes IP adresu
Otevřete v prohlížeči:
```
http://123.45.67.89:3000
```

Nahraďte `123.45.67.89` vaší IP adresou.

### Přístup přes doménu (volitelně)

Pokud máte doménu (např. `reality-crm.vase-realitka.cz`):

1. Nastavte DNS záznam na IP adresu serveru
2. Nainstalujte Nginx:
```bash
apt install nginx -y
```

3. Vytvořte konfiguraci:
```bash
nano /etc/nginx/sites-available/reality-followup
```

4. Vložte:
```nginx
server {
    listen 80;
    server_name reality-crm.vase-realitka.cz;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. Aktivujte:
```bash
ln -s /etc/nginx/sites-available/reality-followup /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

6. Nainstalujte SSL:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d reality-crm.vase-realitka.cz
```

---

## ČÁST 8: GENEROVÁNÍ LICENCÍ

### Krok 1: Generování demo licence
```bash
node generate-license.js --demo
```

Výstup:
```
=== DEMO LICENCE ===
Platnost: 30 dní

Licenční klíč:
eyJjdXN0b21lcklkIjoiZGVtbyIsImN1c3RvbWVyTmFtZSI6IkRlbW8gQWNjb3VudCIs...
```

### Krok 2: Generování licence pro zákazníka
```bash
node generate-license.js cust_001 "Jan Novák" "jan@example.com" 365
```

Výstup:
```
=== NOVÁ LICENCE ===
Zákazník: Jan Novák
E-mail: jan@example.com
Platnost: 365 dní

Licenční klíč:
eyJjdXN0b21lcklkIjoiY3VzdF8wMDEiLCJjdXN0b21lck5hbWUiOiJKYW4gTm92w6FrIiwi...
```

### Krok 3: Zaslání licence zákazníkovi
Pošlete e-mail:

```
Vážený pane Nováku,

Vaše aplikace Reality Follow-up AI je připravena!

Přístup:
- URL: https://reality-crm.vase-realitka.cz
- Uživatelské jméno: jan.novak
- Heslo: [vygenerované heslo]

Licenční klíč:
[VLOŽTE KLÍČ ZDE]

Jak aktivovat:
1. Přihlaste se do aplikace
2. Jděte do Nastavení
3. Vložte licenční klíč
4. Klikněte "Aktivovat"

Máte-li otázky, kontaktujte nás.

S pozdravem,
[Váš tým]
```

---

## ČÁST 9: ÚDRŽBA SERVERU

### Zobrazení logů
```bash
docker-compose logs -f app
```

### Zastavení aplikace
```bash
docker-compose down
```

### Restart aplikace
```bash
docker-compose restart app
```

### Aktualizace aplikace
```bash
cd /opt/reality-followup-ai
docker-compose pull
docker-compose up -d
```

### Zálohování databáze
```bash
docker-compose exec db mysqldump -u root -p reality_followup > backup.sql
```

---

## ČÁST 10: ŘEŠENÍ PROBLÉMŮ

### Aplikace se nespouští
```bash
docker-compose logs app
```

Podívejte se na chyby v logech.

### Databáze se nespouští
```bash
docker-compose logs db
```

### Port 3000 je obsazený
Změňte v `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Změňte z 3000 na 8080
```

Pak restartujte:
```bash
docker-compose restart
```

### Licence není platná
1. Zkontrolujte, že `LICENSE_SECRET` v `.env` je stejný jako při generování
2. Zkontrolujte, že licence není vypršela
3. Zkontrolujte, že je klíč správně zkopírován (bez mezer)

---

## ČÁST 11: BEZPEČNOST

### Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### SSH klíč (místo hesla)
Na svém počítači:
```bash
ssh-keygen -t rsa -b 4096
ssh-copy-id -i ~/.ssh/id_rsa.pub root@123.45.67.89
```

### Silné heslo k databázi
Změňte v `.env`:
```env
DATABASE_URL=mysql://root:SILNE_HESLO@db:3306/reality_followup
```

---

## SHRNUTÍ

Nyní máte:
✅ Aplikaci spuštěnou na serveru
✅ Přístup přes IP nebo doménu
✅ Licenční systém pro zákazníky
✅ Možnost generovat licence

Příští kroky:
1. Přidejte prvního zákazníka
2. Vygenerujte mu licenci
3. Pošlete mu přístupové údaje
4. Pomůžete mu s nastavením Resend a Google Calendar

---

## Kontakt

Máte-li otázky, kontaktujte nás:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
