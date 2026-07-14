# Prodejní Návod - Reality Follow-up AI

Kompletní návod pro prodej a nasazení aplikace klientům.

---

## 1. PŘÍPRAVA PRODEJE

### 1.1 Cena a Balíčky
Navrhované ceny:

| Balíček | Cena | Trvání | Funkce |
|---------|------|--------|--------|
| Starter | 299 Kč/měsíc | Měsíčně | Základní CRM |
| Professional | 699 Kč/měsíc | Měsíčně | CRM + AI odpovědi |
| Enterprise | 1 499 Kč/měsíc | Měsíčně | Vše + Resend + Google Calendar |
| Jednorázová licence | 4 999 Kč | 1 rok | Vlastní server |

### 1.2 Argumenty Prodeje

**Pro makléře:**
- ✅ Automatické odpovědi na e-maily (AI)
- ✅ Centralizovaná správa leadů
- ✅ Automatické follow-upy
- ✅ Integrace s Google Calendar
- ✅ Přehledný dashboard

**Výhody:**
- Ušetří čas (2-3 hodiny denně)
- Zvýší konverzi (lepší follow-up)
- Zlepší komunikaci s klienty
- Zvýší profesionalitu

---

## 2. PRODEJNÍ PROCES

### 2.1 Kontakt se Zákazníkem
1. Pošli demo video (5 minut)
2. Nabídni bezplatný trial (7 dní)
3. Dohodni se na ceně a podmínkách

### 2.2 Podpis Smlouvy
Připrav si smlouvu s těmito body:

```
LICENČNÍ SMLOUVA

1. Předmět
   Licencování software Reality Follow-up AI

2. Doba Trvání
   [Vyberte: 1 měsíc / 1 rok / jiné]

3. Cena
   [Vyberte cenu z tabulky výše]

4. Omezení
   - Licence je osobní a nepřenosná
   - Zákaz prodeje, pronajímání, sdílení
   - Zákaz modifikace nebo reverse engineeringu
   - Maximálně 1 uživatel na licenci

5. Podpora
   - E-mail podpora: [Váš e-mail]
   - Doba odpovědi: 24 hodin

6. Ukončení
   - Buď strana může zrušit s 30 dny výpovědní lhůtou
   - Při zrušení se vrátí proporcionální poplatek
```

### 2.3 Platba
Přijímejte platby přes:
- Bankovní převod
- PayPal
- Stripe
- Platební brána

---

## 3. INSTALACE PRO ZÁKAZNÍKA

### 3.1 Příprava Serveru (Váš Tým)
1. Pronajmi VPS server (DigitalOcean, Hetzner, atd.)
2. Spusť instalační skript
3. Nakonfiguruj doménu
4. Nainstaluj SSL certifikát

### 3.2 Generování Licence (Váš Tým)
```bash
node generate-license.js cust_001 "Jan Novák" "jan@example.com" 365
```

Výstup:
```
=== NOVÁ LICENCE ===
Zákazník: Jan Novák
E-mail: jan@example.com
Platnost: 365 dní

Licenční klíč:
eyJjdXN0b21lcklkIjoiY3VzdF8wMDEiLCJjdXN0b21lck5hbWUiOiJKYW4gTm92w6FrIiwi...
```

### 3.3 Zaslání Zákazníkovi (Váš Tým)
Pošli e-mail:

```
Vážený pane Nováku,

Vaše instalace Reality Follow-up AI je hotova!

Přístupové údaje:
- URL: https://reality-crm.vase-realitka.cz
- Uživatelské jméno: [vaše jméno]
- Heslo: [vygenerované heslo]

Licenční klíč:
[VLOŽTE KLÍČ ZDE]

Jak začít:
1. Přihlaste se na https://reality-crm.vase-realitka.cz
2. Jděte do Nastavení
3. Vložte licenční klíč
4. Klikněte "Aktivovat"

Návod: [ODKAZ NA NÁVOD]

Máte-li otázky, kontaktujte nás.

S pozdravem,
[Váš tým]
```

---

## 4. ONBOARDING ZÁKAZNÍKA

### 4.1 Úvodní Školení (30 minut)
1. Přihlášení a navigace
2. Přidání prvního leadu
3. Nastavení Resend (e-maily)
4. Nastavení Google Calendar
5. Generování AI odpovědi

### 4.2 Průběžná Podpora
- Odpovídej na e-maily do 24 hodin
- Řeš problémy operativně
- Nabízej tipy a triky

### 4.3 Měsíční Check-in
- Zkontroluj, jak zákazník aplikaci používá
- Nabídni optimalizace
- Sbírej feedback

---

## 5. PRODEJNÍ MATERIÁLY

### 5.1 Landing Page
Vytvoř jednoduchou landing page s:
- Screenshots aplikace
- Video demo (2-3 minuty)
- Ceny a balíčky
- Testimonials (od prvních zákazníků)
- CTA tlačítko "Vyzkoušej zdarma"

### 5.2 Demo Video
Obsah (5 minut):
1. Úvod (30 sekund)
2. Dashboard (1 minuta)
3. Přidání leadu (1 minuta)
4. AI odpověď (1 minuta)
5. Automatické follow-upy (1 minuta)
6. Závěr (30 sekund)

### 5.3 Case Study
Příklad:
```
Realitní kancelář "Domov Reality"
- Počet makléřů: 5
- Počet leadů/měsíc: 150
- Čas na odpověď: 2 hodiny

Po implementaci Reality Follow-up AI:
- Čas na odpověď: 15 minut (AI)
- Konverze: +25%
- Spokojenost klientů: +40%
- Úspora času: 10 hodin/týden
```

---

## 6. CENOVÁ STRATEGIE

### 6.1 Kalkulace Nákladů
- Server VPS: 100-200 Kč/měsíc
- Vaše práce (setup, podpora): 500 Kč
- Marže: 200-400 Kč/měsíc

### 6.2 Doporučené Ceny
- Starter (bez serveru): 299 Kč/měsíc
- Professional (s AI): 699 Kč/měsíc
- Enterprise (vše): 1 499 Kč/měsíc
- Jednorázová licence: 4 999 Kč/rok

### 6.3 Sleva na Více Uživatelů
- 2-5 uživatelů: -10%
- 6-10 uživatelů: -20%
- 10+ uživatelů: -30% (custom)

---

## 7. OCHRANA PŘED SDÍLENÍM

### 7.1 Technické Opatření
- Licence se váže na e-mail zákazníka
- Licence se váže na doménu serveru
- Licence se váže na IP adresu serveru
- Licence má expirační datum

### 7.2 Právní Opatření
- Smlouva zakazuje sdílení
- Smlouva zakazuje prodej dál
- Smlouva zakazuje reverse engineering
- Pokuta za porušení: 10 000 Kč

### 7.3 Monitoring
- Sleduj počet aktivních instalací
- Sleduj počet uživatelů na licenci
- Sleduj anomálie (více IP adres, atd.)

---

## 8. PODPORA A MAINTENANCE

### 8.1 Úrovně Podpory
**Tier 1: E-mail podpora**
- Doba odpovědi: 24 hodin
- Cena: Zdarma

**Tier 2: Prioritní podpora**
- Doba odpovědi: 2 hodiny
- Cena: +199 Kč/měsíc

**Tier 3: Dedikovaný support**
- Doba odpovědi: 30 minut
- Cena: +499 Kč/měsíc

### 8.2 Údržba
- Měsíční backup databází
- Měsíční aktualizace bezpečnosti
- Měsíční monitoring serveru
- Roční aktualizace aplikace

---

## 9. RŮST A ŠKÁLOVÁNÍ

### 9.1 Upsell Příležitosti
- Tier 2/3 podpora
- Vlastní branding
- API integrace
- Vlastní funkce

### 9.2 Retenční Strategie
- Měsíční newsletter s tipy
- Webináře (1x měsíčně)
- Komunita uživatelů
- Referenční program

### 9.3 Referenční Program
- Každý nový zákazník: +500 Kč
- Maximálně 5 referrálů/měsíc
- Vyplaceno na konci měsíce

---

## 10. PŘÍKLADY KOMUNIKACE

### 10.1 Úvodní E-mail
```
Předmět: Reality Follow-up AI - Zvyšte konverzi o 25%

Vážený pane [Jméno],

Znáte to - každý den přicházejí desítky e-mailů od potenciálních klientů,
ale nemáte čas na všechny odpovědět.

Představuji vám Reality Follow-up AI - CRM systém s AI, který:

✓ Automaticky odpovídá na e-maily
✓ Spravuje leady na jednom místě
✓ Vytváří automatické follow-upy
✓ Integruje se s Google Calendar

Výsledek? Vaši klienti dostávají odpověď během 15 minut,
a vy ušetříte 2-3 hodiny denně.

Chcete vyzkoušet zdarma? Stačí odpovědět na tento e-mail.

S pozdravem,
[Vaše jméno]
```

### 10.2 Follow-up E-mail
```
Předmět: Reality Follow-up AI - Jak to funguje

Vážený pane [Jméno],

Ještě jste se nerozhodl? Bez problému!

Zde je krátké video, jak to funguje:
[ODKAZ NA VIDEO]

Nebo se můžeme sejít na videokolu?
[ODKAZ NA KALENDÁŘ]

S pozdravem,
[Vaše jméno]
```

---

## Kontakt a Podpora

Máte-li otázky, kontaktujte:
- **E-mail:** [Váš e-mail]
- **Telefon:** [Váš telefon]
- **Weby:** [Vaše webové stránky]
