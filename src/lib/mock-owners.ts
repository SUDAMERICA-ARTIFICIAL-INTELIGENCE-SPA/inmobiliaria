import { Property, OwnerInfo } from "./types";

const LLC_NAMES = [
    "Brickell Capital Holdings LLC",
    "Coral Gables Investment Group",
    "South Beach Properties Inc",
    "Miamicom Investments LLC",
    "Coconut Grove Ventures LLC",
    "Wynwood Capital Partners",
    "Key Biscayne Trust Co.",
    "Doral Real Estate Holdings",
    "Aventura Asset Management LLC",
    "Pinecrest Family Trust",
    "Edgewater Development Corp",
    "Little Havana Properties LLC",
    "Design District Capital LLC",
    "Midtown Miami Holdings",
    "Sunny Isles Investment Trust",
];

const INDIVIDUAL_NAMES = [
    "Maria C. Fernandez",
    "Carlos A. Rodriguez",
    "James R. Sullivan",
    "Patricia L. Chen",
    "Roberto E. Gonzalez",
    "Sarah M. Williams",
    "Miguel A. Perez",
    "Jennifer K. Thompson",
    "David R. Martinez",
    "Ana L. Castillo",
];

const MAILING_ADDRESSES = [
    "1200 Brickell Ave, Suite 1800, Miami, FL 33131",
    "2665 S Bayshore Dr, PH-1, Coconut Grove, FL 33133",
    "900 S Miami Ave, Suite 400, Miami, FL 33130",
    "3250 NE 1st Ave, Suite 305, Miami, FL 33137",
    "8950 SW 74th Ct, Suite 2201, Miami, FL 33156",
    "1111 Lincoln Rd, Suite 600, Miami Beach, FL 33139",
    "701 Brickell Ave, Suite 1550, Miami, FL 33131",
    "333 SE 2nd Ave, Suite 2000, Miami, FL 33131",
    "2801 Collins Ave, Suite 700, Miami Beach, FL 33140",
    "1395 Brickell Ave, Suite 800, Miami, FL 33131",
];

export function seededRandom(seed: string): () => number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return () => {
        hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
        hash = Math.imul(hash ^ (hash >>> 13), 0x45d9f3b);
        hash = (hash ^ (hash >>> 16)) >>> 0;
        return hash / 0xFFFFFFFF;
    };
}

function pickOwnerIdentity(rng: () => number) {
    const isLLC = rng() > 0.4;
    const isTrust = !isLLC && rng() > 0.5;
    const type: OwnerInfo["type"] = isLLC ? "LLC" : isTrust ? "Trust" : "Individual";
    const name = isLLC
        ? LLC_NAMES[Math.floor(rng() * LLC_NAMES.length)]
        : INDIVIDUAL_NAMES[Math.floor(rng() * INDIVIDUAL_NAMES.length)];
    return { name, type, isLLC };
}

function generateEmail(name: string, isLLC: boolean, rng: () => number): string {
    if (isLLC) {
        const domain = name.toLowerCase().replace(/\s+/g, "").replace(/llc|inc|corp|co\./gi, "").slice(0, 15) + ".com";
        return `contact@${domain}`;
    }
    return name.toLowerCase().split(" ")[0] + Math.floor(rng() * 99) + "@gmail.com";
}

function generateAcquisition(price: number, rng: () => number) {
    const yearsAgo = Math.floor(rng() * 8) + 2;
    const acquisitionYear = new Date().getFullYear() - yearsAgo;
    const acquisitionPrice = Math.floor(price * (0.55 + rng() * 0.3));
    const month = String(Math.floor(rng() * 12) + 1).padStart(2, "0");
    const day = String(Math.floor(rng() * 28) + 1).padStart(2, "0");
    return { acquisitionPrice, acquisitionDate: `${acquisitionYear}-${month}-${day}` };
}

export function weightedPick<T>(options: T[], weights: number[], roll: number): T {
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (roll < cumulative) return options[i];
    }
    return options[0];
}

export function generateOwnerInfo(property: Property): OwnerInfo {
    const rng = seededRandom(property.id);
    const { name, type, isLLC } = pickOwnerIdentity(rng);
    const email = generateEmail(name, isLLC, rng);
    const { acquisitionPrice, acquisitionDate } = generateAcquisition(property.price, rng);

    const riskOptions: OwnerInfo["riskScore"][] = ["Low", "Medium", "High"];
    const riskWeights = property.days_on_mls > 60 ? [0.1, 0.3, 0.6] : [0.5, 0.35, 0.15];
    const riskScore = weightedPick(riskOptions, riskWeights, rng());

    return {
        name,
        type,
        email,
        phone: `(305) ${String(Math.floor(rng() * 900) + 100)}-${String(Math.floor(rng() * 9000) + 1000)}`,
        mailingAddress: MAILING_ADDRESSES[Math.floor(rng() * MAILING_ADDRESSES.length)],
        acquisitionDate,
        acquisitionPrice,
        estimatedEquity: property.price - acquisitionPrice,
        linkedProperties: Math.floor(rng() * 7) + 1,
        riskScore,
    };
}
