# Integrace Google Calendar - Automatické Vytváření Schůzek

Tato dokumentace popisuje, jak nastavit Google Calendar integraci, aby se automaticky vytvářely schůzky pro nové leady.

---

## Jak to funguje

1. Zákazník pošle e-mail s poptávkou
2. Webhook přijme e-mail a vytvoří nový lead
3. Aplikace automaticky vytvoří schůzku v Google Calendar
4. Schůzka je naplánována na příští den v 10:00
5. Zákazník dostane pozvánku na schůzku

---

## 1. PŘÍPRAVA - Google Cloud Project

### 1.1 Vytvoření projektu
1. Jděte na https://console.cloud.google.com
2. Klikněte na **Select a Project** (horní levý roh)
3. Klikněte na **NEW PROJECT**
4. Vyplňte:
   - **Project name:** `Reality Follow-up AI`
   - **Location:** `Czech Republic` (volitelně)
5. Klikněte na **CREATE**

### 1.2 Povolení Google Calendar API
1. V levé nabídce klikněte na **APIs & Services** → **Library**
2. Vyhledejte `Google Calendar API`
3. Klikněte na **Google Calendar API**
4. Klikněte na **ENABLE**

---

## 2. KROK 1: Vytvoření OAuth 2.0 Credentials

### 2.1 Jděte na Credentials
1. V levé nabídce klikněte na **APIs & Services** → **Credentials**
2. Klikněte na **+ CREATE CREDENTIALS**
3. Vyberte **OAuth client ID**

### 2.2 Konfigurace OAuth Consent Screen
Pokud se zobrazí, vyplňte:
- **User Type:** `External`
- **App name:** `Reality Follow-up AI`
- **User support email:** Váš e-mail
- **Developer contact:** Váš e-mail

Klikněte na **SAVE AND CONTINUE**

### 2.3 Vytvoření OAuth Credentials
1. Vyberte **Application type:** `Web application`
2. Vyplňte:
   - **Name:** `Reality Follow-up AI`
   - **Authorized redirect URIs:** 
     ```
     https://vas-domena.cz/api/oauth/google/callback
     http://localhost:3000/api/oauth/google/callback
     ```
3. Klikněte na **CREATE**

### 2.4 Stažení Credentials
1. Klikněte na nově vytvořené credentials
2. Klikněte na **DOWNLOAD JSON**
3. Uložte soubor jako `google-credentials.json`

---

## 3. KROK 2: Nastavení v Aplikaci

### 3.1 Přidání Credentials do .env
Otevřete `.env` soubor a přidejte:

```env
GOOGLE_CALENDAR_CLIENT_ID=your_client_id_here
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALENDAR_REDIRECT_URI=https://vas-domena.cz/api/oauth/google/callback
```

Nahraďte `your_client_id_here` a `your_client_secret_here` hodnotami z `google-credentials.json`.

### 3.2 Aktivace Google Calendar v Nastavení
1. Přihlaste se do Reality Follow-up AI
2. Jděte do **Nastavení**
3. Klikněte na **Připojit Google Calendar**
4. Autorizujte aplikaci
5. Vyberte kalendář, do kterého se mají přidávat schůzky

---

## 4. AUTOMATICKÉ VYTVÁŘENÍ SCHŮZEK

Jakmile je Google Calendar připojený, aplikace automaticky:

1. **Přijme nový lead** z e-mailu
2. **Vytvoří schůzku** v Google Calendar
3. **Naplánuje na příští den v 10:00**
4. **Přidá zákazníka jako účastníka**
5. **Pošle mu pozvánku**

### Příklad schůzky

```
Název: Schůzka: Jan Novák
Čas: Zítřejší den, 10:00 - 11:00
Místo: Online / Domluvit se
Popis: Realitní poptávka: Hledám byt 2+1 v Praze 5
Účastníci: jan.novak@example.com
Připomínky: 24 hodin před, 30 minut před
```

---

## 5. RUČNÍ VYTVOŘENÍ SCHŮZKY

Pokud chcete vytvořit schůzku ručně:

1. Jděte do detailu leadu
2. Klikněte na **Vytvořit schůzku v Google Calendar**
3. Aplikace vytvoří schůzku a zobrazí odkaz

---

## 6. SPRÁVA SCHŮZEK

### 6.1 Úprava schůzky
1. Otevřete Google Calendar
2. Klikněte na schůzku
3. Klikněte na **Edit**
4. Upravte čas, místo, popis
5. Klikněte na **Save**

### 6.2 Zrušení schůzky
1. Otevřete Google Calendar
2. Klikněte na schůzku
3. Klikněte na **Delete**
4. Potvrďte zrušení

---

## 7. ŘEŠENÍ PROBLÉMŮ

### Schůzka se nevytváří
**Příčina:** Google Calendar není připojený

**Řešení:**
1. Jděte do Nastavení
2. Klikněte na **Připojit Google Calendar**
3. Autorizujte aplikaci

### Chyba: "Access denied"
**Příčina:** Aplikace nemá oprávnění

**Řešení:**
1. Jděte na https://myaccount.google.com/permissions
2. Najděte `Reality Follow-up AI`
3. Klikněte na **Remove access**
4. Znovu autorizujte aplikaci

### Schůzka se vytváří v špatném kalendáři
**Příčina:** Vybrán špatný kalendář

**Řešení:**
1. Jděte do Nastavení
2. Změňte vybraný kalendář
3. Uložte

---

## 8. BEZPEČNOST

- ✅ OAuth 2.0 autentifikace
- ✅ Tokeny se ukládají bezpečně
- ✅ Aplikace má přístup pouze k vašemu kalendáři
- ✅ Můžete kdykoli zrušit přístup

---

## 9. PŘÍKLAD TOKU

```
Zákazník pošle e-mail
    ↓
Webhook přijme e-mail
    ↓
Vytvoří se nový lead
    ↓
Aplikace se připojí k Google Calendar
    ↓
Vytvoří schůzku na příští den v 10:00
    ↓
Zákazník dostane pozvánku
    ↓
Makléř vidí schůzku v Google Calendar
    ↓
Makléř se připraví na schůzku
    ↓
Schůzka se uskuteční
    ↓
Lead se označí jako "Domluvená schůzka"
```

---

## 10. POKROČILÉ NASTAVENÍ

### Změna času schůzky
V `server/services/googleCalendar.ts` změňte:

```typescript
// Změňte z 10:00 na 14:00
tomorrow.setHours(14, 0, 0, 0);
```

### Změna trvání schůzky
```typescript
// Změňte z 1 hodiny na 2 hodiny
const endTime = new Date(tomorrow);
endTime.setHours(12, 0, 0, 0); // 2 hodiny
```

### Přidání připomínek
```typescript
reminders: {
  useDefault: false,
  overrides: [
    { method: "email", minutes: 24 * 60 }, // 24 hodin před
    { method: "popup", minutes: 30 }, // 30 minut před
  ],
}
```

---

## 11. DALŠÍ KROKY

1. ✅ Webhook je nastaven
2. ✅ Google Calendar je připojený
3. ⏭️ Nastavte SMS notifikace
4. ⏭️ Optimalizujte AI prompty

---

## Kontakt a Podpora

Máte-li problémy, kontaktujte:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
- **Google Support:** https://support.google.com/calendar
