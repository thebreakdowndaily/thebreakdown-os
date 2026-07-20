// Identifier validation and ownership metadata for the research methodology


// Constituency identifier – zero‑padded three‑digit number (001‑403)
export const ConstituencyIdPattern = /^UP-AC-(00[1-9]|0[1-9][0-9]|[1-3][0-9]{2}|40[0-3])$/;
export type ConstituencyId = string & { __brand: "ConstituencyId" };
export function isValidConstituencyId(id: string): id is ConstituencyId {
  return ConstituencyIdPattern.test(id);
}

// Claim identifier – constituency + CLAIM + six‑digit sequence
export const ClaimIdPattern = /^UP-AC-(00[1-9]|0[1-9][0-9]|[1-3][0-9]{2})-CLAIM-\d{6}$/;
export type ClaimId = string & { __brand: "ClaimId" };
export function isValidClaimId(id: string): id is ClaimId {
  return ClaimIdPattern.test(id);
}


// The ResponsibilityType enum lives in `types/research.ts`; it is re‑exported via the index barrel.
