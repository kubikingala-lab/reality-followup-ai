# Nasazení na Fly.io (FREE)

Kompletní návod pro nasazení Reality Follow-up AI na Fly.io bez GitHubu.

---

## KROK 1: REGISTRACE NA FLY.IO

### 1.1 Jděte na Fly.io
- https://fly.io

### 1.2 Klikněte "Sign Up"
- Vyplňte e-mail
- Vytvořte heslo
- Ověřte e-mail

### 1.3 Přihlášení
- Přihlaste se do Fly.io Dashboard

---

## KROK 2: INSTALACE FLY CLI

### 2.1 Na vašem počítači

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Mac (Homebrew):**
```bash
brew install flyctl
```

**Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

### 2.2 Ověření instalace
```bash
flyctl version
```

---

## KROK 3: PŘIHLÁŠENÍ DO FLY.IO

### 3.1 Přihlášení přes CLI
```bash
flyctl auth login
```

Otevře se prohlížeč, přihlaste se a potvrzujte.

---

## KROK 4: PŘÍPRAVA APLIKACE

### 4.1 Rozbalení ZIP souboru
```bash
unzip reality-followup-ai-ready-to-deploy.zip
cd reality-followup-ai
```

### 4.2 Kontrola Dockerfile
Soubor `Dockerfile` by měl existovat. Pokud ne, vytvořte ho:

```dockerfile
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

# Spuštění
EXPOSE 3000
CMD ["node", "dist/server/index.js"]
```

### 4.3 Vytvoření .env souboru
```bash
cp env.example.txt .env
```

Vyplňte tyto hodnoty:
```env
DATABASE_URL=postgresql://user:password@localhost/reality_followup
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
LICENSE_SECRET=super-tajny-klic
JWT_SECRET=generate-random-string
NODE_ENV=production
```

---

## KROK 5: INICIALIZACE FLY.IO APLIKACE

### 5.1 Spuštění flyctl launch
```bash
flyctl launch
```

### 5.2 Odpovědi na otázky

**App name:**
```
? App Name (leave blank to use an auto-generated name)
reality-followup-ai
```

**Region:**
```
? Region (leave blank to use an auto-generated region)
ams (Amsterdam - nejblíže Česku)
```

**Postgres database:**
```
? Would you like to set up a Postgres database now?
y
```

**Database name:**
```
? Postgres cluster name (leave blank to use an auto-generated name)
reality-followup-ai-db
```

**VM size:**
```
? Select VM size: shared-cpu-1x 256MB
```

### 5.3 Potvrzení
```
? Would you like to deploy now?
y
```

Čekejte 2-3 minuty, až se aplikace nasadí.

---

## KROK 6: KONTROLA NASAZENÍ

### 6.1 Zobrazení statusu
```bash
flyctl status
```

Měli byste vidět:
```
App
  Name     = reality-followup-ai
  Owner    = personal
  Version  = 1
  Status   = running
  Hostname = reality-followup-ai.fly.dev
```

### 6.2 Zobrazení logů
```bash
flyctl logs
```

Měli byste vidět:
```
Server running on http://localhost:3000/
```

---

## KROK 7: PŘÍSTUP K APLIKACI

### 7.1 Otevření v prohlížeči
```
https://reality-followup-ai.fly.dev
```

Nahraďte `reality-followup-ai` vaším app name.

### 7.2 Přihlášení
- Klikněte "Přihlásit se"
- Přihlaste se přes Manus OAuth

---

## KROK 8: NASTAVENÍ VLASTNÍ DOMÉNY (VOLITELNĚ)

### 8.1 Přidání domény
```bash
flyctl certs create vas-domena.cz
```

### 8.2 Nastavení DNS
V poskytovateli domény nastavte:
- **Type:** CNAME
- **Name:** @ (nebo www)
- **Value:** reality-followup-ai.fly.dev

Čekejte 5-10 minut, až se DNS propaguje.

### 8.3 Ověření
```bash
flyctl certs show
```

---

## KROK 9: GENEROVÁNÍ LICENCÍ

### 9.1 Na vašem počítači

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

## KROK 10: ÚDRŽBA

### Zobrazení logů
```bash
flyctl logs
```

### Restart aplikace
```bash
flyctl restart
```

### Aktualizace aplikace
```bash
# Po změnách v kódu
git add .
git commit -m "Update"
flyctl deploy
```

### Zobrazení metriky
```bash
flyctl metrics
```

---

## KROK 11: ŘEŠENÍ PROBLÉMŮ

### Aplikace se nespouští
```bash
flyctl logs
```

Podívejte se na chyby v logech.

### Databáze se nespouští
```bash
flyctl postgres connect
```

### Změna proměnných prostředí
```bash
flyctl secrets set DATABASE_URL=postgresql://...
```

### Smazání aplikace
```bash
flyctl destroy
```

---

## SHRNUTÍ

Nyní máte:
✅ Aplikaci spuštěnou na Fly.io (FREE)
✅ Vlastní doménu (volitelně)
✅ Licenční systém
✅ Připraveno k prodeji

---

## LIMITY FLY.IO FREE

- **3 shared VMs** (stačí na aplikaci + databázi)
- **3 GB disk** na VM
- **160 GB/měsíc** data transfer
- **Bez poplatků** (opravdu FREE)

---

## PŘÍKAZY CHEAT SHEET

```bash
# Inicializace
flyctl launch

# Deploy
flyctl deploy

# Logy
flyctl logs

# Status
flyctl status

# Restart
flyctl restart

# SSH na VM
flyctl ssh console

# Secrets
flyctl secrets set KEY=value
flyctl secrets list

# Domény
flyctl certs create domena.cz
flyctl certs show

# Destroy
flyctl destroy
```

---

## Kontakt

Máte-li otázky, kontaktujte nás:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
