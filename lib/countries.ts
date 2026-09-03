export interface CountryConfig {
  code: string
  country: string
  name: string
  flag: string
  placeholder: string
  minDigits: number
  maxDigits: number
}

export const defaultCountryCodes: CountryConfig[] = [
  { code: "+374", country: "AM", name: "Armenia", flag: "🇦🇲", placeholder: "99 00 00 00", minDigits: 8, maxDigits: 8 },
  { code: "+7", country: "RU", name: "Russia", flag: "🇷🇺", placeholder: "900 000 00 00", minDigits: 10, maxDigits: 10 },
  { code: "+1", country: "US", name: "United States / Canada", flag: "🇺🇸", placeholder: "555 000 0000", minDigits: 10, maxDigits: 10 },
  { code: "+33", country: "FR", name: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78", minDigits: 9, maxDigits: 9 },
  { code: "+995", country: "GE", name: "Georgia", flag: "🇬🇪", placeholder: "555 00 00 00", minDigits: 9, maxDigits: 9 },
  { code: "+49", country: "DE", name: "Germany", flag: "🇩🇪", placeholder: "151 23456789", minDigits: 10, maxDigits: 11 },
  { code: "+971", country: "AE", name: "United Arab Emirates", flag: "🇦🇪", placeholder: "50 123 4567", minDigits: 9, maxDigits: 9 },
  { code: "+44", country: "UK", name: "United Kingdom", flag: "🇬🇧", placeholder: "7700 900000", minDigits: 10, maxDigits: 10 },
  { code: "+30", country: "GR", name: "Greece", flag: "🇬🇷", placeholder: "691 234 5678", minDigits: 10, maxDigits: 10 },
  { code: "+357", country: "CY", name: "Cyprus", flag: "🇨🇾", placeholder: "99 123456", minDigits: 8, maxDigits: 8 },
  { code: "+98", country: "IR", name: "Iran", flag: "🇮🇷", placeholder: "912 345 6789", minDigits: 10, maxDigits: 10 },
  { code: "+961", country: "LB", name: "Lebanon", flag: "🇱🇧", placeholder: "70 123 456", minDigits: 7, maxDigits: 8 },
  { code: "+39", country: "IT", name: "Italy", flag: "🇮🇹", placeholder: "312 345 6789", minDigits: 9, maxDigits: 10 },
  { code: "+34", country: "ES", name: "Spain", flag: "🇪🇸", placeholder: "612 34 56 78", minDigits: 9, maxDigits: 9 },
  { code: "+43", country: "AT", name: "Austria", flag: "🇦🇹", placeholder: "664 123456", minDigits: 9, maxDigits: 11 },
  { code: "+32", country: "BE", name: "Belgium", flag: "🇧🇪", placeholder: "470 12 34 56", minDigits: 9, maxDigits: 9 },
  { code: "+31", country: "NL", name: "Netherlands", flag: "🇳🇱", placeholder: "6 12345678", minDigits: 9, maxDigits: 9 },
  { code: "+41", country: "CH", name: "Switzerland", flag: "🇨🇭", placeholder: "78 123 45 67", minDigits: 9, maxDigits: 9 },
  { code: "+48", country: "PL", name: "Poland", flag: "🇵🇱", placeholder: "512 345 678", minDigits: 9, maxDigits: 9 },
  { code: "+380", country: "UA", name: "Ukraine", flag: "🇺🇦", placeholder: "50 123 4567", minDigits: 9, maxDigits: 9 },
  { code: "+375", country: "BY", name: "Belarus", flag: "🇧🇾", placeholder: "29 123 45 67", minDigits: 9, maxDigits: 9 },
  { code: "+86", country: "CN", name: "China", flag: "🇨🇳", placeholder: "131 2345 6789", minDigits: 11, maxDigits: 11 },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺", placeholder: "412 345 678", minDigits: 9, maxDigits: 9 },
  { code: "+82", country: "KR", name: "South Korea", flag: "🇰🇷", placeholder: "10 1234 5678", minDigits: 9, maxDigits: 10 },
  { code: "+81", country: "JP", name: "Japan", flag: "🇯🇵", placeholder: "90 1234 5678", minDigits: 10, maxDigits: 10 },
  { code: "+55", country: "BR", name: "Brazil", flag: "🇧🇷", placeholder: "11 91234 5678", minDigits: 10, maxDigits: 11 },
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳", placeholder: "91234 56789", minDigits: 10, maxDigits: 10 },
]

export function getCountryConfig(countryCode: string, countryCodesList: CountryConfig[] = defaultCountryCodes): CountryConfig {
  return countryCodesList.find(c => c.code === countryCode) || {
    code: countryCode,
    country: "AM",
    name: "Armenia",
    flag: "🇦🇲",
    placeholder: "99 00 00 00",
    minDigits: 7,
    maxDigits: 11
  }
}

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

/**
 * Format raw digit input according to country placeholder structure
 */
export function formatPhoneNumber(input: string, countryCode: string, countryCodesList: CountryConfig[] = defaultCountryCodes): string {
  const config = getCountryConfig(countryCode, countryCodesList)
  const digits = input.replace(/\D/g, "").slice(0, config.maxDigits)
  
  if (!digits) return ""
  
  const placeholder = config.placeholder
  const groupLengths = placeholder.split(" ").map(g => g.length)
  
  let formatted = ""
  let digitIdx = 0
  
  for (let i = 0; i < groupLengths.length; i++) {
    const len = groupLengths[i]
    if (digitIdx >= digits.length) break
    
    const chunk = digits.slice(digitIdx, digitIdx + len)
    if (i > 0) formatted += " "
    formatted += chunk
    digitIdx += len
  }

  if (digitIdx < digits.length) {
    formatted += (formatted ? " " : "") + digits.slice(digitIdx)
  }

  return formatted
}

/**
 * Validate phone number digit count for selected country
 */
export function validatePhoneNumber(phone: string, countryCode: string, countryCodesList: CountryConfig[] = defaultCountryCodes): {
  isValid: boolean
  error?: string
  rawDigits: string
  config: CountryConfig
} {
  const config = getCountryConfig(countryCode, countryCodesList)

  // Super admin bypass
  if (phone.trim() === "haybooking_super_admin") {
    return { isValid: true, rawDigits: phone, config }
  }

  const rawDigits = phone.replace(/\D/g, "")

  if (!rawDigits) {
    return {
      isValid: false,
      error: `Please enter a phone number`,
      rawDigits,
      config,
    }
  }

  if (config.minDigits === config.maxDigits) {
    if (rawDigits.length !== config.minDigits) {
      return {
        isValid: false,
        error: `Phone number for ${config.name} (${config.code}) must be exactly ${config.minDigits} digits.`,
        rawDigits,
        config,
      }
    }
  } else {
    if (rawDigits.length < config.minDigits || rawDigits.length > config.maxDigits) {
      return {
        isValid: false,
        error: `Phone number for ${config.name} (${config.code}) must be between ${config.minDigits} and ${config.maxDigits} digits.`,
        rawDigits,
        config,
      }
    }
  }

  return { isValid: true, rawDigits, config }
}

/**
 * Validate 6-digit verification OTP code
 */
export function validateOtpCode(code: string): { isValid: boolean; error?: string; cleanCode: string } {
  const cleanCode = code.replace(/\D/g, "")
  if (cleanCode.length !== 6) {
    return {
      isValid: false,
      error: `Verification code must be exactly 6 digits (entered ${cleanCode.length}/6).`,
      cleanCode,
    }
  }
  return { isValid: true, cleanCode }
}
