# Reality Follow-up AI - Instalační Průvodce

Tento průvodce vám pomůže nasadit aplikaci **Reality Follow-up AI** na váš vlastní server (VPS) pomocí Dockeru a Docker Compose. Aplikace bude plně funkční, bez Manus brandingu a s automatickým odesíláním e-mailů.

## Obsah

1.  [Předpoklady](#předpoklady)
2.  [Krok 1: Připravte si server](#krok-1-připravte-si-server)
3.  [Krok 2: Konfigurace prostředí](#krok-2-konfigurace-prostředí)
4.  [Krok 3: Spuštění aplikace](#krok-3-spuštění-aplikace)
5.  [Krok 4: Přístup k aplikaci](#krok-4-přístup-k-aplikaci)
6.  [Správa aplikace](#správa-aplikace)
7.  [Důležité poznámky](#důležité-poznámky)

---

## 1. Předpoklady

Než začnete, ujistěte se, že máte:

-   **VPS server** (např. Hetzner, DigitalOcean, Linode) s operačním systémem Ubuntu 22.04+ nebo podobným Linuxem.
    -   Minimální specifikace: 1 vCPU, 1 GB RAM, 20 GB disk.
-   **Doménu** (volitelně, ale doporučeno pro profesionální vzhled), např. `crm.vase-realitka.cz`.
-   **Účet u Resend.com** pro odesílání e-mailů a váš **API klíč**.

---

## 2. Krok 1: Připravte si server

1.  **Připojte se k vašemu VPS** pomocí SSH (např. `ssh uzivatel@vas_server_ip`).
2.  **Nainstalujte Docker a Docker Compose**.
    -   Pro Ubuntu můžete použít následující příkazy:
        ```bash
        # Nainstalujte Docker
        sudo apt update
        sudo apt install apt-transport-https ca-certificates curl software-properties-common -y
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install docker-ce docker-ce-cli containerd.io -y

        # Nainstalujte Docker Compose
        sudo apt install docker-compose-plugin -y
        # Pro starší verze Dockeru: sudo curl -L "https://github.com/docker/compose/releases/download/v2.2.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        # sudo chmod +x /usr/local/bin/docker-compose
        ```
3.  **Stáhněte si soubory aplikace**.
    -   Naklonujte repozitář (pokud máte GitHub) nebo nahrajte soubory `Dockerfile`, `docker-compose.yml`, `install.sh` a `env.example.txt` do složky na vašem serveru (např. `/opt/reality-followup-ai`).
    -   ```bash
        # Příklad pro vytvoření složky a nahrání souborů
        sudo mkdir -p /opt/reality-followup-ai
        cd /opt/reality-followup-ai
        # Zde nahrajte soubory (např. pomocí scp nebo git clone)
        ```

---

## 3. Krok 2: Konfigurace prostředí

1.  **Přejmenujte `env.example.txt` na `.env`**:
    ```bash
    mv env.example.txt .env
    ```
2.  **Upravte soubor `.env`**.
    -   Otevřete soubor v textovém editoru (např. `nano .env`):
        ```bash
        nano .env
        ```
    -   Vyplňte následující proměnné:
        -   `MYSQL_ROOT_PASSWORD`: Silné heslo pro root uživatele MySQL.
        -   `MYSQL_DATABASE`: Název databáze (např. `reality_followup_ai`).
        -   `MYSQL_USER`: Uživatel databáze (např. `reality_user`).
        -   `MYSQL_PASSWORD`: Silné heslo pro uživatele databáze.
        -   `JWT_SECRET`: Dlouhý, náhodný řetězec pro podepisování JWT tokenů (např. vygenerovaný online).
        -   `RESEND_API_KEY`: Váš API klíč z Resend.com (začíná na `re_`).
        -   `VITE_APP_TITLE`: Název vaší aplikace (např. `Realitní AI Asistent`).
        -   `VITE_APP_LOGO`: URL k vašemu logu (např. `https://vas-hosting.cz/logo.png`).
    -   Ostatní proměnné (Manus OAuth, Forge API) můžete ponechat, pokud je nebudete používat, nebo je odstranit.
    -   Uložte a zavřete soubor (`Ctrl+X`, `Y`, `Enter` pro `nano`).

---

## 4. Krok 3: Spuštění aplikace

1.  **Nastavte oprávnění pro instalační skript**:
    ```bash
    chmod +x install.sh
    ```
2.  **Spusťte instalační skript**:
    ```bash
    ./install.sh
    ```
    -   Skript nejprve zkontroluje `.env` soubor. Pokud jste ho ještě neupravili, skript se zastaví a požádá vás o úpravu. Po úpravě ho spusťte znovu.
    -   Skript sestaví Docker obrazy, spustí databázi a aplikaci a provede databázové migrace.

---

## 5. Krok 4: Přístup k aplikaci

-   Aplikace by měla být dostupná na portu `3000` vašeho serveru.
-   Otevřete webový prohlížeč a zadejte adresu: `http://vas_server_ip:3000`.
-   Pokud máte doménu, můžete ji nasměrovat na váš server a použít reverzní proxy (např. Nginx) pro přístup přes `https://crm.vase-realitka.cz`.

---

## 6. Správa aplikace

-   **Zastavení aplikace:** `docker-compose down`
-   **Spuštění aplikace:** `docker-compose up -d`
-   **Restart aplikace:** `docker-compose restart app`
-   **Provedení migrací:** `docker-compose exec app pnpm drizzle-kit migrate`
-   **Zobrazení logů:** `docker-compose logs -f app`

---

## 7. Důležité poznámky

-   **Bezpečnost:** Ujistěte se, že používáte silná hesla a že váš server je správně zabezpečen (firewall, pravidelné aktualizace).
-   **Zálohování:** Pravidelně zálohujte databázi!
-   **HTTPS:** Pro produkční nasazení vždy používejte HTTPS. Můžete použít Nginx nebo Caddy jako reverzní proxy s Let's Encrypt pro bezplatné SSL certifikáty.
-   **E-maily:** Ujistěte se, že váš Resend API klíč je platný a že doména, ze které odesíláte e-maily, je ověřena v Resend.com.
