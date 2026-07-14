# Návrh aplikace Reality Follow-up AI

## Datový model

Aplikace odděluje firemní profil, leady a komunikaci. Každý záznam je svázán s přihlášeným vlastníkem, aby byly firemní údaje izolované. Firemní profil uchovává název, primární barvu a odkaz na logo v objektovém úložišti. Lead obsahuje kontaktní údaje, realitní požadavek, stav a čas poslední aktivity. Historie komunikace eviduje příchozí i odchozí e-maily, typ zprávy, stav doručení a případný follow-up den.

| Entita | Účel | Klíčové vazby |
|---|---|---|
| Firemní profil | Branding a nastavení odesílatele | Jeden profil na vlastníka |
| Lead | Kontaktní a kvalifikační údaje | Patří vlastníkovi, má více zpráv |
| Komunikace | Audit odpovědí a follow-upů | Patří leadu a vlastníkovi |
| Automatizace | Centrální hodinová kontrola | Jedna projektová cron úloha |

## Uživatelské toky

Po přihlášení se uživateli zobrazí dashboard se statistikami a tabulkou leadů. Nový lead lze přidat formulářem; po uložení se ihned objeví v přehledu a majitel dostane provozní upozornění. Detail leadu umožní změnit stav, vygenerovat českou odpověď pomocí AI, text ručně upravit a odeslat. Odeslaná zpráva se uloží do historie. Centrální úloha pravidelně vyhodnotí leady bez odpovědi a odešle právě splatný follow-up po 1, 3 nebo 7 dnech, nejvýše jednou pro každý interval.

## Vizuální systém

Rozhraní používá světlý profesionální styl s tmavým navigačním panelem, teplým neutrálním pozadím, výraznou firemní barvou a písmem Manrope. Primární barva z brandingu se promítá do hlavních tlačítek, aktivní navigace a drobných akcentů. Karty používají měkké stíny a větší zaoblení; tabulky zůstávají kompaktní a prioritizují čitelnost. Mobilní zobrazení převádí tabulkové části do horizontálně posuvných nebo skládaných bloků.
