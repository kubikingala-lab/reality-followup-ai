# Ověření pilotní aplikace

## Automatické kontroly

Kompletní sada obsahuje 13 testů v 6 souborech. Ověřuje odhlášení, CRM API, AI sanitaci, plain-text e-mailové odesílání, platnost serverového e-mailového klíče a časovou logiku follow-upů. TypeScript kontrola a produkční sestavení proběhly bez chyb.

| Oblast | Výsledek |
|---|---|
| Vitest | 13/13 testů úspěšných |
| TypeScript | Bez typových chyb |
| Produkční build | Úspěšný |
| Databázové migrace | Aplikovány bez destruktivních změn |

Závěrečný běh byl uložen odděleně a vrátil explicitní značky `TESTS_OK`, `TYPESCRIPT_OK` a `BUILD_OK`. Test runner vykázal **6 úspěšných souborů a 13 úspěšných testů**, TypeScript skončil bez diagnostiky a produkční balíček byl vytvořen za 4,59 sekundy.

## Vizuální kontrola

Dashboard, detail ukázkového leadu Petra Nováka a nastavení byly ověřeny v desktopovém i mobilním zobrazení. Mobilní rozhraní skládá statistiky, formuláře a komunikační panely pod sebe; tabulka leadů zůstává horizontálně posuvná. Vizuální systém byl sjednocen do teplé slonovinové, lesní zelené a měděného akcentu.

Runtime kontrola odhalila duplicitní React klíče u dvou navigačních položek vedoucích na stejnou trasu. Klíče byly změněny na jedinečné názvy položek; síťové logy neobsahovaly požadavky se stavem 4xx nebo 5xx.

Konkrétní UI evidence potvrzuje povinná pole a e-mailový typ ve formuláři, skeletony během načítání, prázdné stavy tabulky a historie, zakázání akcí při neplatném či probíhajícím vstupu a české chybové notifikace pro vytvoření leadu, AI generování, odesílání e-mailu, logo i aktivaci automatizace.
