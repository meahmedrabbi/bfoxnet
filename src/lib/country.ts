/**
 * Country utility functions for consistent country display across the app.
 */

// Country flag emojis mapping - all countries
export const COUNTRY_FLAGS: Record<string, string> = {
  // Americas
  US: '🇺🇸', CA: '🇨🇦', MX: '🇲🇽', BR: '🇧🇷', AR: '🇦🇷',
  CO: '🇨🇴', PE: '🇵🇪', VE: '🇻🇪', CL: '🇨🇱', EC: '🇪🇨',
  GT: '🇬🇹', CU: '🇨🇺', BO: '🇧🇴', DO: '🇩🇴', HN: '🇭🇳',
  PY: '🇵🇾', SV: '🇸🇻', NI: '🇳🇮', CR: '🇨🇷', PA: '🇵🇦',
  UY: '🇺🇾', JM: '🇯🇲', HT: '🇭🇹', TT: '🇹🇹', PR: '🇵🇷',
  GY: '🇬🇾', SR: '🇸🇷', BZ: '🇧🇿', BB: '🇧🇧', BS: '🇧🇸',
  LC: '🇱🇨', GD: '🇬🇩', VC: '🇻🇨', AG: '🇦🇬', DM: '🇩🇲',
  KN: '🇰🇳', AW: '🇦🇼', CW: '🇨🇼', TC: '🇹🇨', VG: '🇻🇬',
  VI: '🇻🇮', AI: '🇦🇮', MS: '🇲🇸', KY: '🇰🇾', BM: '🇧🇲',
  GL: '🇬🇱', PM: '🇵🇲', MQ: '🇲🇶', GP: '🇬🇵', GF: '🇬🇫',
  FK: '🇫🇰', BQ: '🇧🇶', SX: '🇸🇽', MF: '🇲🇫', BL: '🇧🇱',
  // Europe
  GB: '🇬🇧', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸',
  PT: '🇵🇹', NL: '🇳🇱', BE: '🇧🇪', CH: '🇨🇭', AT: '🇦🇹',
  PL: '🇵🇱', RU: '🇷🇺', UA: '🇺🇦', TR: '🇹🇷', GR: '🇬🇷',
  SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮', IE: '🇮🇪',
  CZ: '🇨🇿', RO: '🇷🇴', HU: '🇭🇺', SK: '🇸🇰', BG: '🇧🇬',
  RS: '🇷🇸', HR: '🇭🇷', SI: '🇸🇮', LT: '🇱🇹', LV: '🇱🇻',
  EE: '🇪🇪', BY: '🇧🇾', MD: '🇲🇩', AL: '🇦🇱', MK: '🇲🇰',
  ME: '🇲🇪', BA: '🇧🇦', XK: '🇽🇰', IS: '🇮🇸', LU: '🇱🇺',
  MT: '🇲🇹', CY: '🇨🇾', MC: '🇲🇨', AD: '🇦🇩', SM: '🇸🇲',
  VA: '🇻🇦', LI: '🇱🇮', GI: '🇬🇮', IM: '🇮🇲', JE: '🇯🇪',
  GG: '🇬🇬', AX: '🇦🇽', FO: '🇫🇴', SJ: '🇸🇯',
  // Asia
  CN: '🇨🇳', JP: '🇯🇵', KR: '🇰🇷', IN: '🇮🇳', ID: '🇮🇩',
  TH: '🇹🇭', VN: '🇻🇳', PH: '🇵🇭', MY: '🇲🇾', SG: '🇸🇬',
  PK: '🇵🇰', BD: '🇧🇩', IR: '🇮🇷', IQ: '🇮🇶', SA: '🇸🇦',
  AE: '🇦🇪', IL: '🇮🇱', TW: '🇹🇼', HK: '🇭🇰', MO: '🇲🇴',
  KP: '🇰🇵', MM: '🇲🇲', LA: '🇱🇦', KH: '🇰🇭', NP: '🇳🇵',
  LK: '🇱🇰', AF: '🇦🇫', KZ: '🇰🇿', UZ: '🇺🇿', TM: '🇹🇲',
  TJ: '🇹🇯', KG: '🇰🇬', AZ: '🇦🇿', AM: '🇦🇲', GE: '🇬🇪',
  MN: '🇲🇳', BT: '🇧🇹', BN: '🇧🇳', TL: '🇹🇱', MV: '🇲🇻',
  JO: '🇯🇴', LB: '🇱🇧', SY: '🇸🇾', PS: '🇵🇸', YE: '🇾🇪',
  OM: '🇴🇲', KW: '🇰🇼', BH: '🇧🇭', QA: '🇶🇦',
  // Africa
  EG: '🇪🇬', ZA: '🇿🇦', NG: '🇳🇬', KE: '🇰🇪', ET: '🇪🇹',
  GH: '🇬🇭', TZ: '🇹🇿', MA: '🇲🇦', DZ: '🇩🇿', SD: '🇸🇩',
  UG: '🇺🇬', MZ: '🇲🇿', CI: '🇨🇮', CM: '🇨🇲', AO: '🇦🇴',
  SN: '🇸🇳', ZW: '🇿🇼', RW: '🇷🇼', TN: '🇹🇳', LY: '🇱🇾',
  MW: '🇲🇼', ZM: '🇿🇲', BW: '🇧🇼', NA: '🇳🇦', GA: '🇬🇦',
  LS: '🇱🇸', GM: '🇬🇲', GN: '🇬🇳', BJ: '🇧🇯', TG: '🇹🇬',
  SL: '🇸🇱', LR: '🇱🇷', MR: '🇲🇷', ML: '🇲🇱', BF: '🇧🇫',
  NE: '🇳🇪', TD: '🇹🇩', CF: '🇨🇫', CG: '🇨🇬', CD: '🇨🇩',
  GQ: '🇬🇶', ST: '🇸🇹', CV: '🇨🇻', MU: '🇲🇺', SC: '🇸🇨',
  KM: '🇰🇲', MG: '🇲🇬', ER: '🇪🇷', SO: '🇸🇴', DJ: '🇩🇯',
  SS: '🇸🇸', BI: '🇧🇮', SZ: '🇸🇿', RE: '🇷🇪', YT: '🇾🇹',
  EH: '🇪🇭', SH: '🇸🇭', IO: '🇮🇴',
  // Oceania
  AU: '🇦🇺', NZ: '🇳🇿', PG: '🇵🇬', FJ: '🇫🇯', SB: '🇸🇧',
  VU: '🇻🇺', NC: '🇳🇨', PF: '🇵🇫', WS: '🇼🇸', TO: '🇹🇴',
  FM: '🇫🇲', KI: '🇰🇮', MH: '🇲🇭', PW: '🇵🇼', NR: '🇳🇷',
  TV: '🇹🇻', AS: '🇦🇸', GU: '🇬🇺', MP: '🇲🇵', CK: '🇨🇰',
  NU: '🇳🇺', TK: '🇹🇰', WF: '🇼🇫', PN: '🇵🇳', NF: '🇳🇫',
  CC: '🇨🇨', CX: '🇨🇽', HM: '🇭🇲',
  // Others
  AQ: '🇦🇶', TF: '🇹🇫', GS: '🇬🇸', BV: '🇧🇻', UM: '🇺🇲',
};

/**
 * Get the flag emoji for a country ISO2 code.
 * @param iso2 - Two-letter country code (e.g., 'US', 'BR')
 * @returns Flag emoji or white flag if not found
 */
export const getCountryFlag = (iso2: string): string => {
  return COUNTRY_FLAGS[iso2?.toUpperCase()] || '🏳️';
};

/**
 * Format file size in human-readable format.
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., '1.5 MB', '256 KB')
 */
export const formatFileSize = (bytes: number | null): string => {
  if (bytes === null || bytes === undefined) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
