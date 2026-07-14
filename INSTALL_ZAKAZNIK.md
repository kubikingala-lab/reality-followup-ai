# Reality Follow-up AI - Instalace pro Zákazníka

Jednoduchý návod, jak si nainstalovat aplikaci na svůj VPS server.

---

## 📋 Co potřebuješ

1. **VPS Server** (Linux - Ubuntu 20.04 nebo novější)
   - Cena: 100-300 Kč/měsíc
   - Poskytovatelé: DigitalOcean, Hetzner, Linode, Vultr, atd.
   - RAM: 2GB minimálně
   - Disk: 20GB minimálně

2. **SSH přístup** (dostaneš od poskytovatele)
   - IP adresa serveru
   - Uživatelské jméno (obvykle `root`)
   - Heslo nebo SSH klíč

3. **ZIP soubor** s aplikací (dostaneš od prodávajícího)

---

## 🚀 Instalace (4 kroky)

### KROK 1: Připoj se na server

Na svém počítači otevři Terminal/PowerShell a napiš:

```bash
ssh root@TVOJE_IP_ADRESA
```

Nahraď `TVOJE_IP_ADRESA` skutečnou IP adresou serveru.

Zadej heslo (dostaneš od poskytovatele).

### KROK 2: Nahraj ZIP soubor

Na svém počítači (v novém okně Terminalu):

```bash
scp reality-followup-ai.zip root@TVOJE_IP_ADRESA:/root/
```

Zadej heslo.

### KROK 3: Spusť instalační skript

Na serveru (v SSH okně):

```bash
cd /root
unzip reality-followup-ai.zip
cd reality-followup-ai
sudo bash install-vps.sh
```

Skript bude:
- ✅ Instalovat Docker
- ✅ Instalovat Docker Compose
- ✅ Vytvořit Docker image
- ✅ Spustit aplikaci
- ✅ Nastavit firewall

**Trvá cca 10-15 minut.**

### KROK 4: Přístup k aplikaci

Po instalaci otevři v prohlížeči:

```
http://TVOJE_IP_ADRESA:3000
```

Nahraď `TVOJE_IP_ADRESA` skutečnou IP adresou.

**Hotovo! 🎉**

---

## 🔧 Užitečné příkazy

**Zobrazit logy aplikace:**
```bash
cd /root/reality-followup-ai
docker-compose logs -f
```

**Restartovat aplikaci:**
```bash
cd /root/reality-followup-ai
docker-compose restart
```

**Zastavit aplikaci:**
```bash
cd /root/reality-followup-ai
docker-compose down
```

**Znovu spustit aplikaci:**
```bash
cd /root/reality-followup-ai
docker-compose up -d
```

---

## 🌐 Vlastní doména (volitelné)

Chceš aplikaci na vlastní doméně (např. `crm.tvoje-domena.cz`)?

1. Kup si doménu (Wedos, Namecheap, atd.)
2. Nastav DNS na IP adresu serveru
3. Nainstaluj SSL certifikát (Let's Encrypt)
4. Nakonfiguruj Nginx

**Kontaktuj prodávajícího pro pomoc s tímto krokem.**

---

## 🔐 Bezpečnost

**Důležité:**
- Změň heslo do serveru
- Nastav firewall (port 3000 by měl být přístupný jen tobě)
- Pravidelně updatuj systém

---

## ❓ Řešení problémů

### Aplikace se nespustila
```bash
docker-compose logs
```

Podívej se na chyby v logech.

### Port 3000 je obsazený
```bash
sudo lsof -i :3000
```

Zabij proces, který port používá.

### Docker není nainstalován
Skript by měl Docker nainstalovat automaticky. Pokud ne:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo bash get-docker.sh
```

---

## 📞 Podpora

Máš problém? Kontaktuj prodávajícího:
- Email: [email prodávajícího]
- Telefon: [telefon prodávajícího]

---

**Vše je hotovo! Aplikace běží na tvém serveru! 🚀**
