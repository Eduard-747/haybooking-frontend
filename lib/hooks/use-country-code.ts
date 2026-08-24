import { useState } from "react"
import { defaultCountryCodes } from "../countries"

export function useCountryCode(initialCode: string = "+374") {
  const [countryCode, setCountryCode] = useState(initialCode)
  const [countryCodesList, setCountryCodesListState] = useState(defaultCountryCodes)

  const setCountryCodesList = (list: typeof defaultCountryCodes) => {
    const uniqueList = list.filter((item, index, self) => index === self.findIndex((t) => t.code === item.code))
    setCountryCodesListState(uniqueList)
  }

  return { countryCode, setCountryCode, countryCodesList }
}
