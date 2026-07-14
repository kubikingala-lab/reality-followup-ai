# Deployment Balíček - Reality Follow-up AI

Tento dokument popisuje, co je součástí deployment balíčku pro prodej aplikace Reality Follow-up AI.

## Obsah balíčku

```
reality-followup-ai/
├── Dockerfile                  # Docker image pro aplikaci
├── docker-compose.yml          # Orchestrace aplikace a databáze
├── install.sh                  # Instalační skript
├── env.example.txt             # Příklad proměnných prostředí
├── README.md                   # Instalační návod
├── package.json                # Závislosti Node.js
├── pnpm-lock.yaml              # Lock file pro pnpm
├── client/                     # Frontend aplikace
│   ├── src/                    # React komponenty
│   ├── index.html              # HTML vstupní bod
│   └── public/                 # Statické soubory
├── server/                     # Backend aplikace
│   ├── routers.ts              # tRPC API routy
│   ├── db.ts                   # Databázové operace
│   ├── services/               # Obchodní logika (e-maily, AI, follow-upy)
│   └── _core/                  # Jádro aplikace (OAuth, tRPC, atd.)
├── drizzle/                    # Databázové schéma a migrace
├── shared/                     # Sdílené typy a konstanty
└── sales_package/              # Prodejní materiály
    ├── sales_text.md           # Prodejní text a ceník
    ├── demo_video_guide.md     # Návod na vytvoření demo videa
    └── DEPLOYMENT_PACKAGE.md   # Tento soubor
```

## Jak připravit balíček pro klienta

1.  **Vytvořte ZIP soubor** se všemi výše uvedenými soubory a složkami.
2.  **Odstraňte zbytečné soubory** (např. `.git`, `node_modules`, `.env`).
3.  **Zahrňte README.md** s jasným návodem na instalaci.
4.  **Zahrňte env.example.txt** s popisem potřebných proměnných.
5.  **Zahrňte sales_package/** s prodejními materiály.

## Kroky pro nasazení na klientův server

1.  **Klient si vezme VPS** (např. Hetzner, DigitalOcean).
2.  **Klient si stáhne balíček** a rozbalí ho na serveru.
3.  **Klient si vezme Resend API klíč** (https://resend.com).
4.  **Klient upraví `.env` soubor** s potřebnými údaji.
5.  **Klient spustí `./install.sh`** a aplikace se automaticky nainstaluje.
6.  **Aplikace je dostupná** na portu 3000 (nebo přes reverzní proxy).

## Technické specifikace

-   **Runtime:** Node.js 20+
-   **Databáze:** MySQL 8.0
-   **Frontend:** React 19 + Tailwind CSS 4
-   **Backend:** Express 4 + tRPC 11
-   **Kontejnerizace:** Docker + Docker Compose
-   **Programovací jazyk:** TypeScript

## Požadavky na klientův server

-   **OS:** Linux (Ubuntu 22.04+, Debian 12+, CentOS 8+)
-   **RAM:** Minimálně 1 GB (doporučeno 2 GB)
-   **Disk:** Minimálně 20 GB
-   **CPU:** 1 vCPU (doporučeno 2 vCPU)
-   **Síť:** Přístup k internetu pro Resend API a LLM API

## Bezpečnostní doporučení

1.  **HTTPS:** Vždy používejte HTTPS v produkci. Nastavte reverzní proxy (Nginx, Caddy) s Let's Encrypt.
2.  **Hesla:** Používejte silná hesla pro MySQL a JWT_SECRET.
3.  **Firewall:** Omezujte přístup k portu 3306 (MySQL) pouze na localhost.
4.  **Zálohování:** Pravidelně zálohujte databázi.
5.  **Aktualizace:** Pravidelně aktualizujte Docker image a závislosti.

## Podpora a údržba

-   **Měsíční správa:** Optimalizace AI promptů, malé úpravy, aktualizace.
-   **Hodinový tarif:** Pro větší úpravy a nové funkce (cca 500 Kč/hodina).
-   **Telefonická podpora:** Dostupná během pracovních hodin.

## Kontakt

Pro otázky a podporu kontaktujte: **[Váš e-mail]** nebo **[Váš telefon]**.
