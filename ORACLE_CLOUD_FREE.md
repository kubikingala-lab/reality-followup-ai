# Nasazení na Oracle Cloud (FREE TIER)

Kompletní návod pro nasazení Reality Follow-up AI na Oracle Cloud bez poplatků.

---

## KROK 1: REGISTRACE NA ORACLE CLOUD

### 1.1 Jděte na Oracle Cloud
- https://www.oracle.com/cloud/free/

### 1.2 Klikněte "Start for free"
- Vyplňte e-mail
- Vytvořte heslo
- Vyplňte údaje (jméno, adresa, atd.)

### 1.3 Ověření
- Potvrzovací e-mail
- Telefonní ověření (SMS)

### 1.4 Přihlášení
- Přihlaste se do Oracle Cloud Console
- https://www.oracle.com/cloud/sign-in/

---

## KROK 2: VYTVOŘENÍ COMPUTE INSTANCE

### 2.1 Jděte na Compute
V levé nabídce: **Compute** → **Instances**

### 2.2 Klikněte "Create Instance"

### 2.3 Nastavení Instance

**Name:** `reality-followup-ai`

**Image:**
- Klikněte "Change Image"
- Vyberte **Ubuntu 22.04** (free tier)

**Shape:**
- Vyberte **Ampere (ARM)** - je free
- Vyberte **VM.Standard.A1.Flex**
- CPU: 2 OCPU
- RAM: 12 GB (je free)

**Networking:**
- Vyberte existující VCN nebo vytvořte novou
- Subnet: Default

**SSH Key:**
- Klikněte "Generate SSH key pair"
- Stáhněte si private key (uložte si jej!)

### 2.4 Klikněte "Create"

Čekejte 2-3 minuty, až se instance spustí.

---

## KROK 3: PŘIHLÁŠENÍ NA INSTANCI

### 3.1 Najděte IP adresu
V Console: **Compute** → **Instances** → Vaše instance
- Zkopírujte **Public IP Address**

### 3.2 Přihlášení přes SSH

**Na Windows (PowerShell):**
```powershell
# Změňte cestu na váš private key
ssh -i "C:\Users\VaseJmeno\Downloads\ssh-key.key" ubuntu@IP_ADRESA
```

**Na Mac/Linux:**
```bash
chmod 600 ~/Downloads/ssh-key.key
ssh -i ~/Downloads/ssh-key.key ubuntu@IP_ADRESA
```

Nahraďte `IP_ADRESA` vaší IP adresou.

---

## KROK 4: INSTALACE DOCKER

### 4.1 Aktualizace systému
```bash
sudo apt update && sudo apt upgrade -y
```

### 4.2 Instalace Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 4.3 Přidání uživatele do docker skupiny
```bash
sudo usermod -aG docker ubuntu
exit
```

Přihlaste se znovu (aby se změny projevily).

### 4.4 Instalace Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 4.5 Ověření
```bash
docker --version
docker-compose --version
```

---

## KROK 5: NAHRÁNÍ APLIKACE

### 5.1 Stažení ZIP na instanci

Na instanci spusťte:
```bash
cd /opt
sudo mkdir -p reality-followup-ai
cd reality-followup-ai
```

### 5.2 Nahrání ZIP (z vašeho počítače)

Z vašeho počítače spusťte:
```bash
scp -i "cesta/k/ssh-key.key" reality-followup-ai-final-complete.zip ubuntu@IP_ADRESA:/opt/reality-followup-ai/
```

Nahraďte `IP_ADRESA` vaší IP adresou.

### 5.3 Rozbalení na instanci

Na instanci:
```bash
cd /opt/reality-followup-ai
unzip reality-followup-ai-final-complete.zip
ls -la
```

---

## KROK 6: NASTAVENÍ APLIKACE

### 6.1 Vytvoření .env souboru
```bash
cp env.example.txt .env
nano .env
```

### 6.2 Vyplnění .env

Vyplňte tyto hodnoty (ostatní ponechte výchozí):

```env
# Databáze (ponechte výchozí)
DATABASE_URL=mysql://root:heslo123@db:3306/reality_followup

# OAuth (získejte z https://manus.im)
VITE_APP_ID=your_app_id_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# Licence - generujte pomocí: openssl rand -base64 32
LICENSE_SECRET=super-tajny-klic-zmenit-na-vlastni

# JWT - generujte pomocí: openssl rand -base64 32
JWT_SECRET=generate-random-string

# Ostatní (ponechte výchozí)
NODE_ENV=production
```

### 6.3 Uložení souboru
- Stiskněte `Ctrl+X`
- Napište `Y`
- Stiskněte `Enter`

---

## KROK 7: SPUŠTĚNÍ APLIKACE

### 7.1 Spuštění Docker kontejnerů
```bash
sudo docker-compose up -d
```

### 7.2 Čekání na inicializaci
```bash
sleep 30
```

### 7.3 Ověření
```bash
sudo docker-compose ps
```

Měli byste vidět:
```
NAME                        STATUS
reality-followup-ai-app     Up 2 minutes
reality-followup-ai-db      Up 2 minutes
```

### 7.4 Kontrola logů
```bash
sudo docker-compose logs app
```

Měli byste vidět:
```
Server running on http://localhost:3000/
```

---

## KROK 8: PŘÍSTUP K APLIKACI

### 8.1 Otevření v prohlížeči
```
http://IP_ADRESA:3000
```

Nahraďte `IP_ADRESA` vaší IP adresou z Oracle Cloud.

### 8.2 Přihlášení
- Klikněte "Přihlásit se"
- Přihlaste se přes Manus OAuth

---

## KROK 9: NASTAVENÍ FIREWALL (DŮLEŽITÉ!)

### 9.1 Otevření portu 3000

V Oracle Cloud Console:
1. Jděte na **Networking** → **Virtual Cloud Networks**
2. Vyberte vaši VCN
3. Jděte na **Security Lists**
4. Klikněte na default security list
5. Klikněte **Add Ingress Rule**

Vyplňte:
- **Source CIDR:** 0.0.0.0/0 (všichni)
- **Destination Port Range:** 3000
- **Protocol:** TCP

6. Klikněte **Add Ingress Rule**

Nyní by měl být port 3000 přístupný.

---

## KROK 10: GENEROVÁNÍ LICENCÍ

### 10.1 Na instanci spusťte

**Demo licence:**
```bash
node generate-license.js --demo
```

**Licence pro zákazníka:**
```bash
node generate-license.js cust_001 "Jan Novák" "jan@example.com" 365
```

Zkopírujte licenční klíč a pošlete zákazníkovi.

---

## KROK 11: ÚDRŽBA

### Zobrazení logů
```bash
sudo docker-compose logs -f app
```

### Zastavení aplikace
```bash
sudo docker-compose down
```

### Restart aplikace
```bash
sudo docker-compose restart app
```

### Aktualizace aplikace
```bash
cd /opt/reality-followup-ai
sudo docker-compose pull
sudo docker-compose up -d
```

---

## KROK 12: PŘIPOJENÍ DOMÉNY (VOLITELNĚ)

Pokud máte doménu, můžete ji připojit:

### 12.1 Nainstalujte Nginx
```bash
sudo apt install nginx -y
```

### 12.2 Vytvořte konfiguraci
```bash
sudo nano /etc/nginx/sites-available/reality-followup
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

### 12.3 Aktivujte
```bash
sudo ln -s /etc/nginx/sites-available/reality-followup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 12.4 SSL certifikát
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d vas-domena.cz
```

---

## KROK 13: ŘEŠENÍ PROBLÉMŮ

### Aplikace se nespouští
```bash
sudo docker-compose logs app
```

### Databáze se nespouští
```bash
sudo docker-compose logs db
```

### Nemůžu se připojit na SSH
1. Zkontrolujte, že máte správný private key
2. Zkontrolujte, že máte správnou IP adresu
3. Zkontrolujte firewall v Oracle Cloud

### Port 3000 není přístupný
1. Zkontrolujte, že aplikace běží: `sudo docker-compose ps`
2. Zkontrolujte firewall v Oracle Cloud (KROK 9)
3. Zkontrolujte, že jste otevřeli port 3000

---

## SHRNUTÍ

Nyní máte:
✅ Aplikaci spuštěnou na Oracle Cloud (FREE)
✅ Přístup přes IP:3000
✅ Licenční systém
✅ Možnost připojit doménu

---

## LIMITY ORACLE CLOUD FREE

- **CPU:** 2 OCPU (Ampere)
- **RAM:** 12 GB
- **Disk:** 200 GB
- **Šířka pásma:** 10 TB/měsíc
- **Cena:** $0 (navždy)

**Poznámka:** Pokud se instance nepoužívá 7 dní, Oracle ji může vypnout. Pokud ji chcete udržet aktivní, přidejte ji do "Always Free" skupiny.

---

## Kontakt

Máte-li otázky, kontaktujte nás:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
