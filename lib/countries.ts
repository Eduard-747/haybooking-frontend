export const defaultCountryCodes = [
  { code: "+1", country: "US", name: "United States", flag: "🇺🇸", placeholder: "555 000 0000" },
  { code: "+44", country: "UK", name: "United Kingdom", flag: "🇬🇧", placeholder: "7700 900000" },
  { code: "+374", country: "AM", name: "Armenia", flag: "🇦🇲", placeholder: "99 00 00 00" },
  { code: "+995", country: "GE", name: "Georgia", flag: "🇬🇪", placeholder: "555 00 00 00" },
  { code: "+994", country: "AZ", name: "Azerbaijan", flag: "🇦🇿", placeholder: "50 000 00 00" },
  { code: "+7", country: "RU", name: "Russia", flag: "🇷🇺", placeholder: "900 000 00 00" },
  { code: "+49", country: "DE", name: "Germany", flag: "🇩🇪", placeholder: "151 23456789" },
  { code: "+33", country: "FR", name: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { code: "+39", country: "IT", name: "Italy", flag: "🇮🇹", placeholder: "312 345 6789" },
  { code: "+34", country: "ES", name: "Spain", flag: "🇪🇸", placeholder: "612 34 56 78" },
  { code: "+90", country: "TR", name: "Turkey", flag: "🇹🇷", placeholder: "501 234 56 78" },
  { code: "+971", country: "AE", name: "United Arab Emirates", flag: "🇦🇪", placeholder: "50 123 4567" },
  { code: "+86", country: "CN", name: "China", flag: "🇨🇳", placeholder: "131 2345 6789" },
  { code: "+81", country: "JP", name: "Japan", flag: "🇯🇵", placeholder: "90 1234 5678" },
  { code: "+82", country: "KR", name: "South Korea", flag: "🇰🇷", placeholder: "10 1234 5678" },
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳", placeholder: "91234 56789" },
  { code: "+55", country: "BR", name: "Brazil", flag: "🇧🇷", placeholder: "11 91234 5678" },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺", placeholder: "412 345 678" },
  { code: "+52", country: "MX", name: "Mexico", flag: "🇲🇽", placeholder: "55 1234 5678" },
  { code: "+48", country: "PL", name: "Poland", flag: "🇵🇱", placeholder: "512 345 678" },
]

export function getPhonePrefixAndPlaceholderByName(countryName: string, countryCodesList: any[] = defaultCountryCodes) {
  const match = countryCodesList.find(c => c.name?.toLowerCase() === countryName?.toLowerCase())
  if (match) return { code: match.code, placeholder: match.placeholder }
  return null
}

export function getPhonePlaceholder(countryCode: string, countryCodesList: any[] = defaultCountryCodes) {
  const match = countryCodesList.find(c => c.code === countryCode)
  return match?.placeholder || "555 000 0000"
}

export function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "🌐"
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
