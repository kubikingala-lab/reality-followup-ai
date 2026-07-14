# Instalace Reality Follow-up AI na VPS

Kompletní návod pro nasazení aplikace na vlastní server s licenčním systémem.

---

## KROK 1: Příprava serveru

### 1.1 Požadavky
- Linux server (Ubuntu 20.04+ nebo CentOS 8+)
- Minimálně 2GB RAM
- 20GB volného místa
- SSH přístup
- Doména (volitelně, ale doporučeno)

### 1.2 Přihlášení na server
```bash
ssh root@vas-server-ip
```

### 1.3 Aktualizace systému
```bash
apt update && apt upgrade -y
```

---

## KROK 2: Instalace Docker a Docker Compose

### 2.1 Instalace Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2.2 Instalace Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### 2.3 Ověření instalace
```bash
docker --version
docker-compose --version
```

---

## KROK 3: Příprava aplikace

### 3.1 Stažení a rozbalení
```bash
cd /opt
wget https://your-domain.com/reality-followup-ai-final.zip
unzip reality-followup-ai-final.zip
cd reality-followup-ai
```

### 3.2 Vytvoření .env souboru
```bash
cp env.example.txt .env
nano .env
```

Vyplňte tyto hodnoty:
```env
# Databáze
DATABASE_URL=mysql://root:heslo123@db:3306/reality_followup

# OAuth
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Resend (e-maily)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret
GOOGLE_CALENDAR_REDIRECT_URI=https://vas-domena.cz/api/oauth/google/callback

# Licence
LICENSE_SECRET=super-tajny-klic-zmenit-na-vlastni

# Ostatní
JWT_SECRET=generate-random-string
NODE_ENV=production
```

### 3.3 Generování tajných klíčů
```bash
# Generuj náhodný JWT_SECRET
openssl rand -base64 32

# Generuj náhodný LICENSE_SECRET
openssl rand -base64 32
```

---

## KROK 4: Spuštění aplikace

### 4.1 Spuštění Docker kontejnerů
```bash
docker-compose up -d
```

### 4.2 Ověření, že běží
```bash
docker-compose ps
```

Měli byste vidět:
- `reality-followup-ai-app` - běží
- `reality-followup-ai-db` - běží

### 4.3 Čekání na inicializaci
```bash
# Počkejte 30 sekund, aby se databáze inicializovala
sleep 30

# Zkontrolujte logy
docker-compose logs app
```

---

## KROK 5: Nastavení domény (volitelně)

### 5.1 Instalace Nginx
```bash
apt install nginx -y
```

### 5.2 Vytvoření Nginx konfigurace
```bash
nano /etc/nginx/sites-available/reality-followup
```

Vložte:
```nginx
server {
    listen 80;
    server_name vas-domena.cz;

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

### 5.3 Aktivace konfigurace
```bash
ln -s /etc/nginx/sites-available/reality-followup /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 5.4 SSL certifikát (Let's Encrypt)
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d vas-domena.cz
```

---

## KROK 6: Přístup k aplikaci

### 6.1 Přístup přes IP adresu
```
http://vas-server-ip:3000
```

### 6.2 Přístup přes doménu (pokud jste nastavili)
```
https://vas-domena.cz
```

### 6.3 Přihlášení
- Klikněte na "Přihlásit se"
- Přihlaste se přes Manus OAuth

---

## KROK 7: Aktivace licence

### 7.1 Generování licence pro zákazníka
Na vašem počítači spusťte:

```bash
node -e "
const crypto = require('crypto');
const SECRET = 'super-tajny-klic-zmenit-na-vlastni'; // stejný jako v .env

const data = {
  customerId: 'cust_001',
  customerName: 'Jan Novák',
  customerEmail: 'jan@example.com',
  expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 rok
  features: ['all']
};

const payload = JSON.stringify(data);
const hash = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
const encoded = Buffer.from(payload).toString('base64');
const licenseKey = \`\${encoded}.\${hash}\`;

console.log('Licenční klíč:');
console.log(licenseKey);
"
```

### 7.2 Zaslání licence zákazníkovi
Pošlete mu licenční klíč a návod:

```
Váš licenční klíč:
[VLOŽTE KLÍČ ZDE]

Jak jej aktivovat:
1. Přihlaste se do aplikace
2. Jděte do Nastavení
3. Vložte licenční klíč
4. Klikněte "Aktivovat"
```

---

## KROK 8: Údržba

### 8.1 Zobrazení logů
```bash
docker-compose logs -f app
```

### 8.2 Zastavení aplikace
```bash
docker-compose down
```

### 8.3 Restart aplikace
```bash
docker-compose restart app
```

### 8.4 Aktualizace aplikace
```bash
cd /opt/reality-followup-ai
docker-compose pull
docker-compose up -d
```

### 8.5 Zálohování databáze
```bash
docker-compose exec db mysqldump -u root -p reality_followup > backup.sql
```

---

## KROK 9: Řešení problémů

### Aplikace se nespouští
```bash
docker-compose logs app
```

### Databáze se nespouští
```bash
docker-compose logs db
```

### Port 3000 je obsazený
```bash
# Změňte port v docker-compose.yml
# Změňte "3000:3000" na "8080:3000"
```

### Licence není platná
1. Zkontrolujte, že je `LICENSE_SECRET` stejný na serveru a při generování
2. Zkontrolujte, že licence není vypršela
3. Zkontrolujte, že je klíč správně zkopírován (bez mezer)

---

## KROK 10: Bezpečnost

### 10.1 Firewall
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 10.2 SSH klíč
```bash
# Generuj SSH klíč na svém počítači
ssh-keygen -t rsa -b 4096

# Zkopíruj veřejný klíč na server
ssh-copy-id -i ~/.ssh/id_rsa.pub root@vas-server-ip
```

### 10.3 Heslo k databázi
Změňte výchozí heslo v `.env`:
```env
DATABASE_URL=mysql://root:SILNE_HESLO@db:3306/reality_followup
```

---

## KROK 11: Monitorování

### 11.1 Kontrola zdraví serveru
```bash
docker-compose ps
docker stats
```

### 11.2 Automatické restartování
Docker Compose automaticky restartuje kontejnery, pokud se zhroutí.

### 11.3 Logy
```bash
# Poslední 100 řádků
docker-compose logs -n 100 app

# Sledování v reálném čase
docker-compose logs -f app
```

---

## Kontakt a Podpora

Máte-li problémy s instalací, kontaktujte:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]

---

## Přílohy

### docker-compose.yml
Soubor je již zahrnut v ZIP balíčku.

### .env.example
Soubor je již zahrnut v ZIP balíčku jako `env.example.txt`.

### Licenční klíč
Generujte jej pomocí skriptu v KROKU 7.
