# Nasazení na Railway - Podrobný Návod

Toto je podrobný návod pro nasazení aplikace Reality Follow-up AI na platformu Railway bez nutnosti GitHubu.

## Krok 1: Příprava

1. **Stáhněte a rozbalte aplikaci**
   ```bash
   unzip reality-followup-ai-standalone.zip
   cd reality-followup-ai-standalone
   ```

2. **Vytvořte .env soubor**
   ```bash
   cp .env.example .env
   ```

3. **Vyplňte potřebné API klíče v .env souboru:**

   - `GEMINI_API_KEY`: Získejte z https://ai.google.dev/ (doporučeno pro bezplatné použití)
   - `OPENAI_API_KEY`: Získejte z https://platform.openai.com/api-keys (placené)
   - `RESEND_API_KEY`: Získejte z https://resend.com/
   - `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET`: Získejte z https://console.cloud.google.com/
   - `JWT_SECRET`: Vygenerujte náhodný řetězec (minimálně 32 znaků)

## Krok 2: Instalace Railway CLI

```bash
# Na macOS/Linux
curl -fsSL https://railway.app/install.sh | bash

# Na Windows (PowerShell)
iwr https://railway.app/install.ps1 -useb | iex
```

## Krok 3: Přihlášení do Railway

```bash
railway login
```

Otevře se vám prohlížeč pro přihlášení. Přihlaste se nebo si vytvořte nový účet.

## Krok 4: Nasazení aplikace

```bash
# Přejděte do složky aplikace
cd reality-followup-ai-standalone

# Nahrajte aplikaci na Railway
railway up --new --name reality-followup-ai
```

Railway automaticky detekuje `Dockerfile` a nasadí aplikaci. Proces může trvat několik minut.

## Krok 5: Přidání MySQL databáze

1. **Otevřete Railway dashboard**
   - Odkaz se zobrazí v terminálu po `railway up`
   - Nebo přejděte na https://railway.app/dashboard

2. **Přidejte MySQL databázi**
   - V dashboardu klikněte na `+ New`
   - Vyberte `Database` > `MySQL`
   - Railway automaticky vytvoří databázi a nastaví proměnné prostředí

## Krok 6: Nastavení proměnných prostředí

1. **V Railway dashboardu přejděte do nastavení vaší aplikace**
2. **Klikněte na `Variables`**
3. **Přidejte následující proměnné:**

   ```
   NODE_ENV=production
   PORT=3000
   
   # AI API (Google Gemini / OpenAI)
   # Prioritizes GEMINI_API_KEY if both are set.
   GEMINI_API_KEY=your-google-gemini-api-key-here
   OPENAI_API_KEY=sk-your-openai-api-key-here
   
   # Resend
   RESEND_API_KEY=re_your_key_here
   
   # Google OAuth (Free Tier)
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_REDIRECT_URI=https://your-railway-domain.railway.app/api/oauth/google/callback
   
   # Security
   JWT_SECRET=your-random-secret-min-32-chars
   SCHEDULER_SECRET=your-scheduler-secret
   
   # Branding
   VITE_APP_TITLE=Reality Follow-up AI
   VITE_APP_LOGO=/logo.png
   ```

4. **MySQL proměnné se nastaví automaticky**
   - Railway automaticky přidá `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`
   - Také přidejte `DATABASE_URL` s hodnotou: `mysql://${MYSQLUSER}:${MYSQLPASSWORD}@${MYSQLHOST}:${MYSQLPORT}/${MYSQLDATABASE}`

## Krok 7: Spuštění databázových migrací

1. **V Railway dashboardu přejděte na `Deployments`**
2. **Klikněte na poslední deployment**
3. **Otevřete terminál v Railway (CLI)**
   ```bash
   railway run pnpm drizzle-kit migrate
   ```

   Nebo upravte `package.json` tak, aby migrace běžely automaticky:
   ```json
   "scripts": {
     "start": "pnpm drizzle-kit migrate && node dist/index.js",
     ...
   }
   ```

## Krok 8: Nastavení Google OAuth

1. **Přejděte na https://console.cloud.google.com/**
2. **Vytvořte nový projekt** (nebo vyberte existující)
3. **Povolte Google Calendar API:**
   - V menu `APIs & Services` > `Enabled APIs & Services`
   - Klikněte na `+ ENABLE APIS AND SERVICES`
   - Vyhledejte `Google Calendar API` a povolte ji

4. **Vytvořte OAuth 2.0 přihlašovací údaje:**
   - V `APIs & Services` > `Credentials`
   - Klikněte na `+ CREATE CREDENTIALS`
   - Vyberte `OAuth client ID`
   - Vyberte `Web application`
   - Do `Authorized redirect URIs` přidejte: `https://your-railway-domain.railway.app/api/oauth/google/callback`
   - Klikněte na `CREATE`
   - Zkopírujte `Client ID` a `Client Secret` do Railway proměnných

## Krok 9: Ověření funkčnosti

1. **Otevřete aplikaci**
   - Railway vám vygeneruje URL (např. `https://reality-followup-ai-abc123.railway.app`)
   - Otevřete ji v prohlížeči

2. **Testujte přihlášení**
   - Zkuste se přihlásit pomocí e-mailu a hesla
   - Nebo zkuste Google OAuth

3. **Testujte AI generování**
   - Vytvořte nový lead
   - Zkuste vygenerovat odpověď

4. **Testujte e-maily**
   - Zkuste odeslat e-mail
   - Zkontrolujte, zda byl doručen

## Řešení problémů

### Aplikace se nenačítá
- Zkontrolujte logy v Railway dashboardu
- Ujistěte se, že `OPENAI_API_KEY` a `DATABASE_URL` jsou správně nastaveny

### "OPENAI_API_KEY is not configured"
- Ujistěte se, že jste nastavili `OPENAI_API_KEY` v Railway Variables
- Zkontrolujte, že klíč je platný

### "Database connection failed"
- Ujistěte se, že MySQL databáze je spuštěna
- Zkontrolujte `DATABASE_URL` v Railway Variables

### Google OAuth nefunguje
- Ujistěte se, že `GOOGLE_REDIRECT_URI` v Railway Variables odpovídá URL vaší aplikace
- Zkontrolujte, že jste přidali tuto URL do Google Cloud Console

## Další kroky

- Nakonfigurujte vlastní doménu v Railway
- Nastavte automatické zálohování databáze
- Monitorujte logy aplikace

## Podpora

Pokud narazíte na problémy, kontaktujte Railway support nebo se obraťte na vývojáře aplikace.
