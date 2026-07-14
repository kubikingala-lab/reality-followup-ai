# Nasazení na Fly.io - Windows (ONE-CLICK)

Nejjednoduší způsob, jak nasadit aplikaci na Fly.io z Windows.

---

## KROK 1: Stažení aplikace

1. Stáhni ZIP soubor: `reality-followup-ai-ready-to-deploy.zip`
2. Rozbal jej na svém počítači (např. `C:\reality-followup-ai`)

---

## KROK 2: Otevření PowerShell

1. Stiskni `Windows + R`
2. Napiš: `powershell`
3. Stiskni `Enter`

---

## KROK 3: Navigace do adresáře

V PowerShell napiš:
```powershell
cd C:\reality-followup-ai
```

Nahraď cestu, kde máš rozbalený ZIP.

---

## KROK 4: Spuštění skriptu

V PowerShell napiš:
```powershell
powershell -ExecutionPolicy Bypass -File deploy-flyio.ps1
```

---

## KROK 5: Přihlášení

1. Skript otevře Fly.io login v prohlížeči
2. Přihlaste se svým e-mailem (kubik.ingala@gmail.com)
3. Zadejte heslo
4. Potvrzujte v prohlížeči

---

## KROK 6: Čekání na nasazení

Skript bude pracovat cca 5-10 minut. Čekej prosím...

Uvidíš zprávy:
```
✓ Fly CLI nainstalován
✓ Přihlášení úspěšné
✓ Nasazení úspěšné!
```

---

## KROK 7: Přístup k aplikaci

Po dokončení uvidíš:
```
Přístup k aplikaci:
  URL: https://reality-crm-cz.fly.dev
```

Otevři tuto URL v prohlížeči!

---

## KROK 8: Přihlášení do aplikace

1. Klikni "Přihlásit se"
2. Přihlaste se přes Manus OAuth
3. Hotovo! 🎉

---

## Řešení problémů

### PowerShell se odmítá spustit
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Pak zkus znovu:
```powershell
powershell -ExecutionPolicy Bypass -File deploy-flyio.ps1
```

### Fly CLI se nenainstaluje
1. Jdi na https://fly.io/docs/hands-on/install/
2. Stáhni Fly CLI pro Windows
3. Nainstaluj jej ručně

### Nasazení selhalo
1. Zkontroluj internet
2. Zkontroluj, že máš dostatek místa na disku
3. Zkus znovu

### Aplikace se nespouští
```powershell
flyctl logs
```

Uvidíš chyby v logech.

---

## Příkazy pro údržbu

**Zobrazení logů:**
```powershell
flyctl logs
```

**Restart aplikace:**
```powershell
flyctl restart
```

**Status aplikace:**
```powershell
flyctl status
```

**Smazání aplikace:**
```powershell
flyctl destroy
```

---

## Generování licencí

Po nasazení si můžeš vygenerovat licence pro zákazníky.

Na svém počítači (v adresáři aplikace):

**Demo licence (30 dní):**
```powershell
node generate-license.js --demo
```

**Licence pro zákazníka (1 rok):**
```powershell
node generate-license.js cust_001 "Jan Novák" "jan@example.com" 365
```

Zkopíruj licenční klíč a pošli zákazníkovi.

---

## Shrnutí

Nyní máš:
✅ Aplikaci spuštěnou na Fly.io (FREE)
✅ Vlastní doménu (reality-crm-cz.fly.dev)
✅ Licenční systém
✅ Připraveno k prodeji

Aplikace běží 24/7 bez poplatků! 🚀

---

## Kontakt

Máte-li otázky, kontaktujte nás:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
