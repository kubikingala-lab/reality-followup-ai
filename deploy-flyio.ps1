# ============================================================================
# Reality Follow-up AI - Fly.io Deployment Script (Windows PowerShell)
# ============================================================================
# Tento skript automaticky nasadí aplikaci na Fly.io
# Použití: powershell -ExecutionPolicy Bypass -File deploy-flyio.ps1
# ============================================================================

# Nastavení chyb
$ErrorActionPreference = "Stop"

# Barvy pro výstup
function Write-Header {
    Write-Host "`n========================================" -ForegroundColor Blue
    Write-Host $args[0] -ForegroundColor Blue
    Write-Host "========================================`n" -ForegroundColor Blue
}

function Write-Success {
    Write-Host "✓ $($args[0])" -ForegroundColor Green
}

function Write-Error-Custom {
    Write-Host "✗ $($args[0])" -ForegroundColor Red
}

function Write-Warning-Custom {
    Write-Host "⚠ $($args[0])" -ForegroundColor Yellow
}

# ============================================================================
# KROK 1: KONTROLA SYSTÉMU
# ============================================================================
Write-Header "KROK 1: Kontrola systému"

# Kontrola PowerShell verze
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Error-Custom "PowerShell 5.0 nebo vyšší je vyžadován"
    exit 1
}

Write-Success "PowerShell verze: $($PSVersionTable.PSVersion)"

# ============================================================================
# KROK 2: INSTALACE FLY CLI
# ============================================================================
Write-Header "KROK 2: Instalace Fly CLI"

if (Get-Command flyctl -ErrorAction SilentlyContinue) {
    Write-Success "Fly CLI je již nainstalován"
    flyctl version
} else {
    Write-Warning-Custom "Instaluji Fly CLI..."
    
    # Stažení a instalace
    $FlyInstallScript = "$env:TEMP\install-flyctl.ps1"
    Invoke-WebRequest -Uri "https://fly.io/install.ps1" -OutFile $FlyInstallScript
    & $FlyInstallScript
    
    # Přidání do PATH
    $env:PATH += ";$env:USERPROFILE\.fly\bin"
    
    Write-Success "Fly CLI nainstalován"
}

# ============================================================================
# KROK 3: PŘIHLÁŠENÍ K FLY.IO
# ============================================================================
Write-Header "KROK 3: Přihlášení k Fly.io"

Write-Host "Otevírám Fly.io login v prohlížeči..." -ForegroundColor Cyan
Write-Host "Prosím, přihlaste se a potvrzujte v prohlížeči.`n" -ForegroundColor Cyan

flyctl auth login

Write-Success "Přihlášení úspěšné"

# ============================================================================
# KROK 4: PŘÍPRAVA APLIKACE
# ============================================================================
Write-Header "KROK 4: Příprava aplikace"

# Kontrola, že jsme v správném adresáři
if (-not (Test-Path "package.json")) {
    Write-Error-Custom "package.json nenalezen! Prosím, spusťte skript v adresáři aplikace."
    exit 1
}

Write-Success "Adresář aplikace nalezen"

# ============================================================================
# KROK 5: NASAZENÍ NA FLY.IO
# ============================================================================
Write-Header "KROK 5: Nasazení na Fly.io"

Write-Warning-Custom "Spouštím nasazení (trvá cca 5-10 minut)..."

# Kontrola, zda fly.toml existuje
if (-not (Test-Path "fly.toml")) {
    Write-Warning-Custom "fly.toml nenalezen, vytvářím..."
    # Vytvoření základního fly.toml
    $flyToml = @"
app = "reality-crm-cz"
primary_region = "ams"

[build]
  image = "node:20-alpine"

[env]
  NODE_ENV = "production"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1

[[services]]
  protocol = "tcp"
  internal_port = 3000

  [[services.ports]]
    number = 80
    protocol = "tcp"
    handlers = ["http"]

  [[services.ports]]
    number = 443
    protocol = "tcp"
    handlers = ["tls", "http"]

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 256
"@
    Set-Content -Path "fly.toml" -Value $flyToml
}

# Nasazení
try {
    flyctl deploy --remote-only
    Write-Success "Nasazení úspěšné!"
} catch {
    Write-Error-Custom "Nasazení selhalo: $_"
    exit 1
}

# ============================================================================
# KROK 6: INFORMACE O APLIKACI
# ============================================================================
Write-Header "KROK 6: Informace o aplikaci"

# Získání informací o aplikaci
$appInfo = flyctl status 2>$null

Write-Host $appInfo -ForegroundColor Cyan

# Získání URL
$appName = (Select-String -Path "fly.toml" -Pattern 'app = "([^"]+)"' | ForEach-Object { $_.Matches.Groups[1].Value })

if ($appName) {
    $appUrl = "https://$appName.fly.dev"
    Write-Host "`nPřístup k aplikaci:" -ForegroundColor Green
    Write-Host "  URL: $appUrl`n" -ForegroundColor Cyan
} else {
    Write-Warning-Custom "Nepodařilo se určit URL aplikace"
}

# ============================================================================
# KROK 7: GENEROVÁNÍ LICENCÍ
# ============================================================================
Write-Header "KROK 7: Generování demo licence"

if (Test-Path "generate-license.js") {
    Write-Host "Generuji demo licenci...`n" -ForegroundColor Cyan
    
    try {
        node generate-license.js --demo
        Write-Success "Demo licence vygenerována"
    } catch {
        Write-Warning-Custom "Nepodařilo se vygenerovat demo licenci: $_"
    }
} else {
    Write-Warning-Custom "generate-license.js nenalezen"
}

# ============================================================================
# FINÁLNÍ ZPRÁVA
# ============================================================================
Write-Header "Instalace dokončena!"

Write-Host "Vaše aplikace je nyní spuštěna na Fly.io!`n" -ForegroundColor Green

if ($appUrl) {
    Write-Host "Příští kroky:" -ForegroundColor Green
    Write-Host "1. Otevřete v prohlížeči: $appUrl" -ForegroundColor Cyan
    Write-Host "2. Přihlaste se přes Manus OAuth" -ForegroundColor Cyan
    Write-Host "3. Vygenerujte licenci pro prvního zákazníka" -ForegroundColor Cyan
    Write-Host "4. Pošlete mu přístupové údaje`n" -ForegroundColor Cyan
}

Write-Host "Užitečné příkazy:" -ForegroundColor Green
Write-Host "  Zobrazit logy: flyctl logs" -ForegroundColor Cyan
Write-Host "  Restart: flyctl restart" -ForegroundColor Cyan
Write-Host "  Status: flyctl status" -ForegroundColor Cyan
Write-Host "  Destroy: flyctl destroy`n" -ForegroundColor Cyan

Write-Success "Vše je hotovo! 🚀"
