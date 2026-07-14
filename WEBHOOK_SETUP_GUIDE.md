# Návod: Nastavení Resend Webhooku - Příchozí E-maily do Databáze

Tento návod vám krok za krokem ukáže, jak nastavit webhook, aby se e-maily automaticky ukládaly do databáze.

---

## 1. PŘÍPRAVA - Co potřebujete

- ✅ Účet na Resend.com (https://resend.com)
- ✅ Váš server s Reality Follow-up AI (např. `https://crm.vase-realitka.cz`)
- ✅ Ověřenou doménu v Resend (např. `vase-realitka.cz`)
- ✅ E-mailovou adresu, na kterou chcete přijímat poptávky (např. `info@vase-realitka.cz`)

---

## 2. KROK 1: Přihlášení do Resend a Ověření Domény

### 2.1 Přihlášení
1. Jděte na https://resend.com
2. Klikněte na **Sign In** a přihlaste se

### 2.2 Ověření domény
1. V levé nabídce klikněte na **Domains**
2. Klikněte na **Add Domain**
3. Zadejte vaši doménu (např. `vase-realitka.cz`)
4. Resend vám dá DNS záznamy, které musíte přidat u vašeho poskytovatele domény
5. Počkejte, až se doména ověří (obvykle 5-30 minut)

---

## 3. KROK 2: Vytvoření E-mailové Adresy

1. V levé nabídce klikněte na **Emails**
2. Klikněte na **Create Email**
3. Vyplňte:
   - **From Name:** `Realitní tým` (nebo vaše jméno)
   - **From Email:** `info@vase-realitka.cz` (nebo libovolná adresa na vaší doméně)
4. Klikněte na **Create**

**Poznámka:** Tato adresa se bude používat pro odesílání AI odpovědí na poptávky.

---

## 4. KROK 3: Nastavení Webhooku - NEJDŮLEŽITĚJŠÍ

### 4.1 Přejděte na Webhooks
1. V levé nabídce klikněte na **Webhooks** (nebo **Settings** → **Webhooks**)
2. Klikněte na **Create Webhook**

### 4.2 Vyplňte údaje webhooku

**Webhook URL:**
```
https://vas-domena.cz/api/webhooks/resend
```

Nahraďte `vas-domena.cz` vaší skutečnou doménou. Příklady:
- `https://crm.vase-realitka.cz/api/webhooks/resend`
- `https://reality-crm.example.com/api/webhooks/resend`

**Events (Události):**
Vyberte **Email received** - to znamená, že webhook se spustí, když přijde nový e-mail.

### 4.3 Klikněte na **Create**

---

## 5. KROK 4: Ověření Webhooku

Resend automaticky pošle testovací webhook. Měli byste vidět:

```
Status: ✅ Success (200)
Response: {"ok": true, "skipped": "not-email-event"}
```

To je normální - je to testovací zpráva bez skutečného e-mailu.

---

## 6. KROK 5: Nastavení v Aplikaci

### 6.1 Přihlášení do Reality Follow-up AI
1. Jděte na `https://crm.vase-realitka.cz`
2. Přihlaste se

### 6.2 Přejděte do Nastavení
1. Klikněte na **Nastavení** v levé nabídce
2. Vyplňte:
   - **Jméno odesílatele:** `Realitní tým` (nebo vaše jméno)
   - **E-mail odesílatele:** `info@vase-realitka.cz` (MUSÍ ODPOVÍDAT e-mailu z Resend!)
   - **Název společnosti:** `Vaše Realitka` (nebo vaše jméno)
   - **Primární barva:** `#C66A3D` (nebo vaše barva)

**DŮLEŽITÉ:** E-mail odesílatele MUSÍ odpovídat e-mailu, na který přichází poptávky!

### 6.3 Uložte nastavení
Klikněte na **Uložit**

---

## 7. KROK 6: Testování - Pošlete Testovací E-mail

### 7.1 Pošlete e-mail
Pošlete e-mail na adresu, kterou máte nastavenou (např. `info@vase-realitka.cz`):

```
Od: vas-email@example.com
Komu: info@vase-realitka.cz
Předmět: Poptávka - hledám byt 2+1 v Praze
Obsah: Dobrý den, hledám byt 2+1 v Praze 5. Kontakt: +420 777 123 456
```

### 7.2 Zkontrolujte v aplikaci
1. Počkejte 5-10 sekund
2. Jděte do Reality Follow-up AI
3. Klikněte na **Přehled** (Dashboard)
4. Měli byste vidět nový lead s názvem `vas-email` a e-mailem `vas-email@example.com`

### 7.3 Klikněte na lead a zkontrolujte komunikaci
Měli byste vidět:
- **Komunikace:** Váš testovací e-mail
- **Směr:** Příchozí (inbound)
- **Status:** Doručeno (received)

---

## 8. AUTOMATICKÉ ZPRACOVÁNÍ

Jakmile je webhook nastaven, systém automaticky:

1. **Přijme e-mail** z Resend
2. **Vytvoří nový lead** nebo najde existující
3. **Zaznamená komunikaci** (e-mail se uloží do databáze)
4. **Označí leada** jako "Kvalifikováno"
5. **Upozorní vás** (pokud máte nastaveny notifikace)

---

## 9. PŘÍKLAD TOKU

```
Zákazník pošle e-mail
    ↓
Resend přijme e-mail
    ↓
Resend pošle webhook na váš server
    ↓
Aplikace zpracuje webhook
    ↓
Vytvoří se nový lead NEBO se přidá do existujícího
    ↓
E-mail se zaznamená v komunikační historii
    ↓
Makléř vidí nový lead v dashboardu
    ↓
Makléř klikne na lead a vidí e-mail
    ↓
Makléř klikne "Generovat AI odpověď"
    ↓
AI vygeneruje odpověď
    ↓
Makléř odešle odpověď
    ↓
Zákazník dostane odpověď
```

---

## 10. ŘEŠENÍ PROBLÉMŮ

### Webhook se nespouští
**Příčina:** Webhook URL je špatná nebo server není dostupný

**Řešení:**
1. Ověřte, že URL je správná (bez typo)
2. Ověřte, že server běží a je dostupný (zkuste otevřít v prohlížeči)
3. Zkontrolujte, že máte HTTPS (ne HTTP)
4. Zkontrolujte firewall - Resend musí mít přístup k vašemu serveru

### E-mail se nezobrazuje v aplikaci
**Příčina:** E-mail odesílatele se neshoduje s nastavením

**Řešení:**
1. Zkontrolujte, že e-mail v Nastavení odpovídá e-mailu, na který přichází poptávky
2. Zkontrolujte, že je e-mail ověřen v Resend
3. Zkontrolujte serverové logy pro chyby

### Webhook vrací chybu 500
**Příčina:** Chyba v aplikaci nebo databázi

**Řešení:**
1. Zkontrolujte, že je databáze dostupná
2. Zkontrolujte serverové logy pro podrobnosti
3. Restartujte aplikaci (Docker kontejner)

---

## 11. BEZPEČNOST

- ✅ Webhooky jsou odesílány přes HTTPS
- ✅ E-maily jsou uloženy v databázi
- ✅ Přístup je omezen na vlastníka leadu
- ✅ V budoucnu lze přidat webhook signature verification

---

## 12. DALŠÍ KROKY

1. ✅ Webhook je nastaven
2. ⏭️ **Aktivujte Google Calendar integraci** - automatické vytváření schůzek
3. ⏭️ Nastavte SMS notifikace - upozornění na nové leady
4. ⏭️ Optimalizujte AI prompty - lepší odpovědi

---

## Kontakt a Podpora

Máte-li problémy, kontaktujte:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
- **Resend Support:** https://resend.com/support
