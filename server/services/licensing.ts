import crypto from "crypto";

/**
 * Licenční systém pro Reality Follow-up AI
 * Ověřuje, zda má zákazník právo používat aplikaci
 */

interface LicenseData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  expiresAt: number; // Unix timestamp
  features: string[]; // seznam povolených funkcí
}

const LICENSE_SECRET = process.env.LICENSE_SECRET || "default-secret-change-in-production";

/**
 * Generuje licenční klíč pro zákazníka
 */
export function generateLicenseKey(data: LicenseData): string {
  const payload = JSON.stringify(data);
  const hash = crypto.createHmac("sha256", LICENSE_SECRET).update(payload).digest("hex");
  const encoded = Buffer.from(payload).toString("base64");
  return `${encoded}.${hash}`;
}

/**
 * Ověřuje licenční klíč
 */
export function verifyLicenseKey(licenseKey: string): LicenseData | null {
  try {
    const [encoded, hash] = licenseKey.split(".");
    if (!encoded || !hash) return null;

    const payload = Buffer.from(encoded, "base64").toString("utf-8");
    const expectedHash = crypto.createHmac("sha256", LICENSE_SECRET).update(payload).digest("hex");

    if (hash !== expectedHash) return null;

    const data = JSON.parse(payload) as LicenseData;

    // Zkontroluj, zda licence není vypršela
    if (data.expiresAt < Date.now()) return null;

    return data;
  } catch (error) {
    console.error("License verification error:", error);
    return null;
  }
}

/**
 * Generuje demo licenci pro testování
 */
export function generateDemoLicense(): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dní
  return generateLicenseKey({
    customerId: "demo",
    customerName: "Demo Account",
    customerEmail: "demo@example.com",
    expiresAt,
    features: ["all"],
  });
}

/**
 * Generuje licenci pro prodej
 */
export function generateCustomerLicense(
  customerId: string,
  customerName: string,
  customerEmail: string,
  daysValid: number = 365
): string {
  const expiresAt = Date.now() + daysValid * 24 * 60 * 60 * 1000;
  return generateLicenseKey({
    customerId,
    customerName,
    customerEmail,
    expiresAt,
    features: ["all"],
  });
}

/**
 * Vrací informace o licenci
 */
export function getLicenseInfo(licenseKey: string): { valid: boolean; data?: LicenseData; expiresIn?: number } {
  const data = verifyLicenseKey(licenseKey);
  if (!data) {
    return { valid: false };
  }

  const expiresIn = Math.ceil((data.expiresAt - Date.now()) / (24 * 60 * 60 * 1000)); // dny

  return {
    valid: true,
    data,
    expiresIn,
  };
}
