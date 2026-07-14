# Nasazení na Render.com (FREE - bez kreditní karty)

Nejjednoduší a nejrychlejší FREE hosting bez poplatků.

---

## KROK 1: Zaregistruj se na Render.com

1. Jdi na https://render.com
2. Klikni **Sign Up**
3. Zaregistruj se přes GitHub nebo e-mail
4. Ověř e-mail

---

## KROK 2: Vytvoř GitHub repository

Render potřebuje GitHub repository pro automatické nasazení.

1. Jdi na https://github.com/new
2. Vytvoř nový repository:
   - **Name:** `reality-crm-cz`
   - **Description:** Reality Follow-up AI CRM
   - **Public** (aby Render mohl přistupovat)
3. Klikni **Create repository**

---

## KROK 3: Nahraj aplikaci na GitHub

Na svém počítači:

```bash
cd cesta-kde-mas-rozbaleny-zip
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TVOJE_USERNAME/reality-crm-cz.git
git push -u origin main
```

Nahraď `TVOJE_USERNAME` svým GitHub uživatelem.

---

## KROK 4: Nasaď na Render.com

1. Jdi na https://dashboard.render.com
2. Klikni **New +** → **Web Service**
3. Vyber **GitHub**
4. Najdi repository `reality-crm-cz`
5. Klikni **Connect**

**Nastavení:**
- **Name:** `reality-crm-cz`
- **Environment:** `Node`
- **Build Command:** `pnpm install && pnpm build`
- **Start Command:** `node dist/server/index.js`
- **Plan:** `Free` (FREE tier)

6. Klikni **Create Web Service**

---

## KROK 5: Čekej na nasazení

Render bude pracovat cca 5-10 minut. Uvidíš:

```
✓ Build succeeded
✓ Deployment succeeded
```

---

## KROK 6: Přístup k aplikaci

Po nasazení uvidíš URL:
```
https://reality-crm-cz.onrender.com
```

Otevři ji v prohlížeči! 🎉

---

## Řešení problémů

### Build selhává
Zkontroluj logy v Render Dashboard:
- Jdi na **Web Service** → **Logs**
- Hledej chyby

### Aplikace se nespouští
```
Error: Cannot find module 'node_modules/...'
```

Řešení:
1. Jdi do nastavení Web Service
2. Klikni **Environment**
3. Přidej:
   ```
   NODE_ENV=production
   ```

### Databáze se nepřipojuje
Render FREE tier nemá databázi. Musíš použít:
- **MongoDB Atlas** (FREE tier)
- **Supabase** (FREE PostgreSQL)

---

## Příští kroky

1. **Přidej vlastní doménu** - Render umožňuje vlastní domény
2. **Nastavení e-mailů** - Resend webhook pro příchozí e-maily
3. **Google Calendar** - Automatické schůzky

---

## Užitečné příkazy

**Restartovat aplikaci:**
- V Render Dashboard: Web Service → **Manual Deploy**

**Zobrazit logy:**
- V Render Dashboard: Web Service → **Logs**

---

Hotovo! Aplikace běží na Render.com! 🚀
