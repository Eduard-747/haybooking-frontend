export const defaultCountryCodes = [
  { code: "+374", country: "AM", name: "Armenia", flag: "🇦🇲", placeholder: "99 00 00 00" },
  { code: "+7", country: "RU", name: "Russia", flag: "🇷🇺", placeholder: "900 000 00 00" },
  { code: "+1", country: "US", name: "United States / Canada", flag: "🇺🇸", placeholder: "555 000 0000" },
  { code: "+33", country: "FR", name: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { code: "+995", country: "GE", name: "Georgia", flag: "🇬🇪", placeholder: "555 00 00 00" },
  { code: "+49", country: "DE", name: "Germany", flag: "🇩🇪", placeholder: "151 23456789" },
  { code: "+971", country: "AE", name: "United Arab Emirates", flag: "🇦🇪", placeholder: "50 123 4567" },
  { code: "+44", country: "UK", name: "United Kingdom", flag: "🇬🇧", placeholder: "7700 900000" },
  { code: "+30", country: "GR", name: "Greece", flag: "🇬🇷", placeholder: "691 234 5678" },
  { code: "+357", country: "CY", name: "Cyprus", flag: "🇨🇾", placeholder: "99 123456" },
  { code: "+98", country: "IR", name: "Iran", flag: "🇮🇷", placeholder: "912 345 6789" },
  { code: "+961", country: "LB", name: "Lebanon", flag: "🇱🇧", placeholder: "70 123 456" },
  { code: "+39", country: "IT", name: "Italy", flag: "🇮🇹", placeholder: "312 345 6789" },
  { code: "+34", country: "ES", name: "Spain", flag: "🇪🇸", placeholder: "612 34 56 78" },
  { code: "+43", country: "AT", name: "Austria", flag: "🇦🇹", placeholder: "664 123456" },
  { code: "+32", country: "BE", name: "Belgium", flag: "🇧🇪", placeholder: "470 12 34 56" },
  { code: "+31", country: "NL", name: "Netherlands", flag: "🇳🇱", placeholder: "6 12345678" },
  { code: "+41", country: "CH", name: "Switzerland", flag: "🇨🇭", placeholder: "78 123 45 67" },
  { code: "+48", country: "PL", name: "Poland", flag: "🇵🇱", placeholder: "512 345 678" },
  { code: "+380", country: "UA", name: "Ukraine", flag: "🇺🇦", placeholder: "50 123 4567" },
  { code: "+375", country: "BY", name: "Belarus", flag: "🇧🇾", placeholder: "29 123 45 67" },
  { code: "+86", country: "CN", name: "China", flag: "🇨🇳", placeholder: "131 2345 6789" },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺", placeholder: "412 345 678" },
  { code: "+82", country: "KR", name: "South Korea", flag: "🇰🇷", placeholder: "10 1234 5678" },
  { code: "+81", country: "JP", name: "Japan", flag: "🇯🇵", placeholder: "90 1234 5678" },
  { code: "+55", country: "BR", name: "Brazil", flag: "🇧🇷", placeholder: "11 91234 5678" },
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳", placeholder: "91234 56789" },
]

export function getPhonePrefixAndPlaceholderByName(countryName: string, countryCodesList: any[] = defaultCountryCodes) {
  const match = countryCodesList.find(c => c.name?.toLowerCase() === countryName?.toLowerCase())
  if (match) return { code: match.code, placeholder: match.placeholder }
  return null
}

export function getPhonePlaceholder(countryCode: string, countryCodesList: any[] = defaultCountryCodes) {
  const match = countryCodesList.find(c => c.code === countryCode)
  return match?.placeholder || "99 00 00 00"
}

export function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐"
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
