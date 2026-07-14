# Reality Follow-up AI - Standalone Version

**Verze bez závislosti na Manus platformě**

Tato verze aplikace Reality Follow-up AI je zcela nezávislá na Manus platformě a používá standardní služby jako OpenAI a Resend pro svou funkčnost.

## Klíčové změny

### 1. Autentizace
- **Původně:** Manus OAuth
- **Nyní:** Jednoduché přihlášení (e-mail/heslo) + Google OAuth
- Soubory: `server/_core/auth-standalone.ts`, `server/_core/oauth-standalone.ts`

### 2. AI Generování
- **Původně:** Manus Forge AI
- **Nyní:** OpenAI API (GPT-4o-mini)
- Soubory: `server/_core/llm-standalone.ts`

### 3. Plánovač Follow-upů
- **Původně:** Manus Heartbeat
- **Nyní:** Interní Node.js scheduler
- Soubory: `server/_core/scheduler-standalone.ts`

### 4. E-maily
- **Zůstává:** Resend API (bez změn)

### 5. Google Kalendář
- **Zůstává:** Google Calendar API (bez změn)

## Požadavky

- Node.js 18+
- Docker a Docker Compose (pro lokální vývoj)
- MySQL 8.0+

## Instalace a spuštění

### 1. Příprava prostředí

```bash
# Rozbalte aplikaci
unzip reality-followup-ai-standalone.zip
cd reality-followup-ai-standalone

# Zkopírujte .env soubor
cp .env.example .env

# Vyplňte potřebné hodnoty v .env souboru
# - OPENAI_API_KEY (z OpenAI)
# - RESEND_API_KEY (z Resend)
# - GOOGLE_CLIENT_ID a GOOGLE_CLIENT_SECRET (z Google Cloud Console)
# - JWT_SECRET (libovolný bezpečný řetězec)
```

### 2. Lokální spuštění s Docker Compose

```bash
# Spusťte Docker Compose
docker-compose up --build

# Aplikace bude dostupná na http://localhost:3000
```

### 3. Nasazení na Railway

```bash
# Nainstalujte Railway CLI
curl -fsSL https://railway.app/install.sh | bash

# Přihlaste se do Railway
railway login

# Nahrajte aplikaci
railway up --new --name reality-followup-ai

# V Railway dashboardu:
# 1. Přidejte MySQL databázi
# 2. Nastavte proměnné prostředí (z .env souboru)
# 3. Spusťte databázové migrace
```

## Konfigurace API klíčů

### AI API (Google Gemini / OpenAI)

**Doporučeno pro bezplatné použití: Google Gemini**

1.  **Google Gemini API (Free Tier):**
    *   Přejděte na [https://ai.google.dev/](https://ai.google.dev/)
    *   Vytvořte si účet a vygenerujte API klíč.
    *   Nastavte ho do `GEMINI_API_KEY` v `.env` souboru.
    *   *Poznámka:* Gemini nabízí bezplatný tarif s určitými omezeními. Pro více informací viz [Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing).

2.  **OpenAI API (Placené):**
    *   Přejděte na [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
    *   Vytvořte nový API klíč.
    *   Nastavte ho do `OPENAI_API_KEY` v `.env` souboru.
    *   *Poznámka:* OpenAI API nemá bezplatný tarif. Pro použití je nutné mít zaplacený účet. Pokud nastavíte `GEMINI_API_KEY`, bude preferován před `OPENAI_API_KEY`.


### Resend Email Service (Free Tier)

1.  Zaregistrujte se na [https://resend.com/](https://resend.com/)
2.  Ověřte vaši doménu (Resend Free Tier umožňuje jednu doménu).
3.  Vytvořte API klíč.
4.  Nastavte ho do `RESEND_API_KEY` v `.env` souboru.
    *   *Poznámka:* Resend nabízí bezplatný tarif s 10 000 e-maily měsíčně a jednou doménou, což je pro začátek dostačující [Resend Pricing](https://resend.com/pricing).


### Google OAuth (Free Tier)

1.  Přejděte na [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  Vytvořte nový projekt.
3.  Povolte `Google Calendar API`.
4.  Vytvořte `OAuth 2.0 Client ID` (typ `Web application`).
5.  Nastavte `GOOGLE_CLIENT_ID` a `GOOGLE_CLIENT_SECRET` v `.env` souboru.
    *   *Poznámka:* Používání Google Calendar API je obecně zdarma v rámci Google Cloud Free Tier, ale je nutné nastavit fakturační účet (i když nebudou účtovány poplatky za základní použití).

## Struktura projektu

```
reality-followup-ai-standalone/
├── client/                    # React frontend
├── server/
│   ├── _core/
│   │   ├── auth-standalone.ts    # Nový auth systém
│   │   ├── oauth-standalone.ts   # Nové OAuth routes
│   │   ├── llm-standalone.ts     # OpenAI integration
│   │   ├── scheduler-standalone.ts # Plánovač follow-upů
│   │   └── ...
│   ├── services/
│   │   └── aiLead.ts          # Aktualizován pro OpenAI
│   └── ...
├── drizzle/                   # Databázové schéma
├── docker-compose.yml         # Docker konfigurace
├── .env.example               # Šablona proměnných prostředí
└── ...
```

## Funkčnost

- ✅ Správa leadů (vytváření, úpravy, mazání)
- ✅ AI generování odpovědí na e-maily
- ✅ Odesílání e-mailů přes Resend
- ✅ Integrace s Google Kalendářem
- ✅ Automatické follow-upy (plánovač)
- ✅ Přihlášení přes e-mail/heslo nebo Google
- ✅ Responzivní UI

## Řešení problémů

### "OPENAI_API_KEY is not configured"
- Ujistěte se, že jste nastavili `OPENAI_API_KEY` v `.env` souboru
- Zkontrolujte, že klíč je platný na https://platform.openai.com/api-keys

### "Failed to connect to database"
- Ujistěte se, že MySQL je spuštěn (pokud používáte Docker Compose: `docker-compose up db`)
- Zkontrolujte `DATABASE_URL` v `.env` souboru

### "Google OAuth callback failed"
- Ujistěte se, že `GOOGLE_REDIRECT_URI` v `.env` odpovídá URL vaší aplikace
- Zkontrolujte, že jste přidali tuto URL do Google Cloud Console

## Podpora

Pro otázky nebo problémy kontaktujte vývojáře aplikace.

## Licence

Viz LICENSE soubor.
