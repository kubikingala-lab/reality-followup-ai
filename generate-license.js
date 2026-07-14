#!/usr/bin/env node

/**
 * Skript pro generování licenčních klíčů
 * Použití: node generate-license.js <customerId> <customerName> <customerEmail> [daysValid]
 */

const crypto = require("crypto");

// Změňte na svůj LICENSE_SECRET z .env
const LICENSE_SECRET = process.env.LICENSE_SECRET || "default-secret-change-in-production";

function generateLicenseKey(customerId, customerName, customerEmail, daysValid = 365) {
  const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;

  const data = {
    customerId,
    customerName,
    customerEmail,
    expiresAt,
    features: ["all"],
  };

  const payload = JSON.stringify(data);
  const hash = crypto.createHmac("sha256", LICENSE_SECRET).update(payload).digest("hex");
  const encoded = Buffer.from(payload).toString("base64");

  return `${encoded}.${hash}`;
}

function generateDemoLicense() {
  return generateLicenseKey("demo", "Demo Account", "demo@example.com", 30);
}

// Zpracování argumentů
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log(`
Generátor licenčních klíčů pro Reality Follow-up AI

Použití:
  node generate-license.js <customerId> <customerName> <customerEmail> [daysValid]

Příklady:
  # Generuj demo licenci (30 dní)
  node generate-license.js --demo

  # Generuj licenci pro zákazníka (1 rok)
  node generate-license.js cust_001 "Jan Novák" "jan@example.com"

  # Generuj licenci pro zákazníka (90 dní)
  node generate-license.js cust_002 "Petr Svoboda" "petr@example.com" 90

Výstup:
  Vytiskne licenční klíč, který můžete poslat zákazníkovi.
  `);
  process.exit(0);
}

if (args[0] === "--demo") {
  const license = generateDemoLicense();
  console.log("\n=== DEMO LICENCE ===");
  console.log(`Platnost: 30 dní\n`);
  console.log("Licenční klíč:");
  console.log(license);
  console.log("\n");
  process.exit(0);
}

if (args.length < 3) {
  console.error("Chyba: Musíte zadat customerId, customerName a customerEmail");
  console.error("Spusťte: node generate-license.js --help");
  process.exit(1);
}

const customerId = args[0];
const customerName = args[1];
const customerEmail = args[2];
const daysValid = parseInt(args[3] || "365", 10);

const license = generateLicenseKey(customerId, customerName, customerEmail, daysValid);

console.log("\n=== NOVÁ LICENCE ===");
console.log(`Zákazník: ${customerName}`);
console.log(`E-mail: ${customerEmail}`);
console.log(`Platnost: ${daysValid} dní\n`);
console.log("Licenční klíč:");
console.log(license);
console.log("\n");
