# Nastavení Resend Webhooků - Příchozí E-maily

Tato dokumentace popisuje, jak nastavit příchozí e-mailové webhooky v Resend, aby se automaticky vytvářely nové leady v systému Reality Follow-up AI.

## Jak to funguje

1. Zákazník pošle e-mail na adresu vašeho makléře (např. `info@vase-realitka.cz`)
2. Resend přijme e-mail a pošle webhook na váš server (`/api/webhooks/resend`)
3. Webhook automaticky:
   - Najde existující lead podle e-mailu odesílatele
   - Pokud lead neexistuje, vytvoří nový lead
   - Zaznamená příchozí e-mail jako komunikaci
   - Označí leada jako "Kvalifikováno" (status: qualified)
4. Makléř vidí nový e-mail v komunikační historii leada v dashboardu

## Kroky pro nastavení

### Krok 1: Přihlášení do Resend

1. Přejděte na https://resend.com
2. Přihlaste se do svého účtu
3. Jděte na **Settings** → **Webhooks**

### Krok 2: Vytvoření webhooku

1. Klikněte na **Create Webhook**
2. Vyplňte následující údaje:
   - **Webhook URL:** `https://vas-domena.cz/api/webhooks/resend`
     - Nahraďte `vas-domena.cz` vaší skutečnou doménou
     - Příklad: `https://crm.vase-realitka.cz/api/webhooks/resend`
   - **Events:** Vyberte **Email received** (příchozí e-maily)
3. Klikněte na **Create**

### Krok 3: Ověření webhooku

Resend pošle testovací webhook. Měli byste vidět odpověď `200 OK` s JSON:
```json
{
  "ok": true,
  "skipped": "not-email-event"
}
```

To je normální - je to testovací zpráva bez skutečného e-mailu.

## Jak se e-maily zpracovávají

### Příchozí e-mail od zákazníka

```
Od: jan.novak@example.com
Komu: info@vase-realitka.cz
Předmět: Poptávka - byt 2+1 v Praze
Obsah: Dobrý den, hledám byt 2+1 v Praze...
```

### Co se stane v systému

1. **Nový lead se vytvoří** (pokud neexistuje):
   - Jméno: `jan.novak` (z e-mailu)
   - E-mail: `jan.novak@example.com`
   - Hledaný typ: `Poptávka - byt 2+1 v Praze` (z předmětu)
   - Poznámka: `Automaticky vytvořeno z příchozího e-mailu`

2. **Komunikace se zaznamená**:
   - Směr: Příchozí (inbound)
   - Typ: Manuální (manual)
   - Obsah: Celý text e-mailu
   - Status: Doručeno (received)

3. **Lead se označí jako kvalifikovaný**:
   - Status: Kvalifikováno (qualified)
   - `clientRepliedAt`: Čas přijetí e-mailu

### Existující lead

Pokud lead s daným e-mailem již existuje, e-mail se jednoduše přidá do komunikační historie.

## Testování

### Test 1: Odeslání e-mailu

1. Pošlete e-mail na adresu, kterou máte nastavenou v Resend
2. Počkejte 5-10 sekund
3. Jděte do dashboardu Reality Follow-up AI
4. Měli byste vidět nový lead nebo novou komunikaci u existujícího leadu

### Test 2: Kontrola logů

Pokud máte přístup k serverovým logům, můžete vidět:
```
Webhook received: from_email=jan.novak@example.com, leadId=123, ownerId=1
```

## Řešení problémů

### Webhook se nespouští

1. **Ověřte URL:** Ujistěte se, že je URL správná a dostupná
2. **Ověřte HTTPS:** Resend vyžaduje HTTPS, ne HTTP
3. **Ověřte firewall:** Ujistěte se, že váš server přijímá požadavky z Resend
4. **Zkontrolujte logy:** Podívejte se na serverové logy pro chyby

### E-mail se nezobrazuje v systému

1. **Ověřte senderEmail:** Ujistěte se, že máte v Nastavení nastavenou adresu, na kterou přichází e-maily
2. **Ověřte e-mail odesílatele:** E-mail musí být od skutečného e-mailového účtu
3. **Zkontrolujte logy:** Podívejte se na serverové logy pro chyby

### Webhook vrací chybu 500

1. **Zkontrolujte databázi:** Ujistěte se, že je databáze dostupná
2. **Zkontrolujte logy:** Podívejte se na serverové logy pro podrobnosti chyby
3. **Restartujte aplikaci:** Zkuste restartovat Docker kontejner

## Bezpečnost

### Ověření webhooku

Aktuálně webhooky nejsou ověřovány podpisem. V budoucnu můžete přidat:

1. **Webhook signature verification:** Resend posílá `X-Resend-Signature` header
2. **IP whitelist:** Ověřte, že webhook pochází z Resend IP adres
3. **HMAC validation:** Ověřte, že je webhook autentický

### Ochrana dat

- Webhooky jsou odesílány přes HTTPS
- E-maily jsou uloženy v databázi s šifrováním
- Přístup k e-mailům je omezen na vlastníka leadu

## Příklad Curl testu

Pokud chcete testovat webhook ručně:

```bash
curl -X POST https://vas-domena.cz/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.received",
    "created_at": "2026-07-14T10:00:00Z",
    "data": {
      "from_email": "test@example.com",
      "from_name": "Test User",
      "to": ["info@vase-realitka.cz"],
      "subject": "Testovací poptávka",
      "text": "Dobrý den, hledám byt v Praze.",
      "message_id": "test-123"
    }
  }'
```

## Další kroky

1. **Nastavte webhook** v Resend
2. **Testujte** odesláním e-mailu
3. **Ověřte** v dashboardu, že se lead zobrazuje
4. **Optimalizujte** AI prompty na základě příchozích poptávek

## Podpora

Pokud máte problémy s nastavením webhooků, kontaktujte:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
