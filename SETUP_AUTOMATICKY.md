# Automatická Instalace - Reality Follow-up AI

Nejjednodušší způsob, jak spustit aplikaci na Oracle Cloud (nebo jakémkoliv Linux serveru).

---

## KROK 1: Registrace na Oracle Cloud

1. Jděte na https://www.oracle.com/cloud/free/
2. Klikněte "Start for free"
3. Vyplňte údaje a ověřte se
4. Přihlaste se do Oracle Cloud Console

---

## KROK 2: Vytvoření Compute Instance

1. V Console jděte na **Compute** → **Instances**
2. Klikněte **Create Instance**
3. Nastavte:
   - **Name:** `reality-followup-ai`
   - **Image:** Ubuntu 22.04
   - **Shape:** VM.Standard.A1.Flex (2 OCPU, 12 GB RAM)
   - **SSH Key:** Stáhněte si private key
4. Klikněte **Create**

Čekejte 2-3 minuty, až se instance spustí.

---

## KROK 3: Přihlášení na Server

Na vašem počítači spusťte:

**Windows (PowerShell):**
```powershell
ssh -i "C:\Users\VaseJmeno\Downloads\ssh-key.key" ubuntu@IP_ADRESA
```

**Mac/Linux:**
```bash
ssh -i ~/Downloads/ssh-key.key ubuntu@IP_ADRESA
```

Nahraďte `IP_ADRESA` vaší IP adresou z Oracle Cloud.

---

## KROK 4: Stažení ZIP na Server

Na serveru spusťte:

```bash
cd /opt
sudo mkdir -p reality-followup-ai
cd reality-followup-ai
```

Z vašeho počítače spusťte:

```bash
scp -i "cesta/k/ssh-key.key" reality-followup-ai-oracle-free.zip ubuntu@IP_ADRESA:/opt/reality-followup-ai/
```

Na serveru:

```bash
unzip reality-followup-ai-oracle-free.zip
```

---

## KROK 5: Spuštění Setup Skriptu

**Na serveru spusťte:**

```bash
sudo bash setup.sh
```

To je vše! Skript udělá:
✅ Instalaci Docker
✅ Instalaci Docker Compose
✅ Spuštění aplikace
✅ Inicializaci databáze
✅ Nastavení firewall
✅ Generování licencí

---

## KROK 6: Přístup k Aplikaci

Po skončení skriptu uvidíte:

```
Přístup k aplikaci:
  URL: http://123.45.67.89:3000
```

Otevřete tuto URL v prohlížeči.

---

## KROK 7: Přihlášení

1. Klikněte "Přihlásit se"
2. Přihlaste se přes Manus OAuth
3. Hotovo! 🎉

---

## KROK 8: Generování Licencí

Na serveru spusťte:

**Demo licence (30 dní):**
```bash
cd /opt/reality-followup-ai
node generate-license.js --demo
```

**Licence pro zákazníka (1 rok):**
```bash
node generate-license.js cust_001 "Jan Novák" "jan@example.com" 365
```

Zkopírujte licenční klíč a pošlete zákazníkovi.

---

## Užitečné Příkazy

**Zobrazit logy:**
```bash
cd /opt/reality-followup-ai
docker-compose logs -f app
```

**Zastavit aplikaci:**
```bash
cd /opt/reality-followup-ai
docker-compose down
```

**Restartovat aplikaci:**
```bash
cd /opt/reality-followup-ai
docker-compose restart
```

**Aktualizovat aplikaci:**
```bash
cd /opt/reality-followup-ai
docker-compose pull
docker-compose up -d
```

---

## Řešení Problémů

### Setup skript selhal
```bash
# Zkontrolujte logy
docker-compose logs app
docker-compose logs db
```

### Nemůžu se připojit na SSH
1. Zkontrolujte, že máte správný private key
2. Zkontrolujte, že máte správnou IP adresu
3. Zkontrolujte firewall v Oracle Cloud

### Port 3000 není přístupný
1. Zkontrolujte, že aplikace běží: `docker-compose ps`
2. Zkontrolujte firewall v Oracle Cloud (přidejte port 3000)

### Databáze se nespouští
```bash
# Zkontrolujte logy
docker-compose logs db

# Restartujte
docker-compose restart db
```

---

## Shrnutí

Nyní máte:
✅ Aplikaci spuštěnou na Oracle Cloud (FREE)
✅ Přístup přes IP:3000
✅ Licenční systém
✅ Možnost připojit doménu

Aplikace je připravena k prodeji zákazníkům! 🚀

---

## Kontakt

Máte-li otázky, kontaktujte nás:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
