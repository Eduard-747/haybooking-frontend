export function formatPrice(price: number, currencyCode: string = "AMD"): string {
  const code = currencyCode.toUpperCase();
  
  switch (code) {
    case "AMD":
      return `${price.toLocaleString()} ֏`;
    case "USD":
      return `$${price.toFixed(2)}`;
    case "EUR":
      return `€${price.toFixed(2)}`;
    case "RUB":
      return `${price.toLocaleString()} ₽`;
    case "GBP":
      return `£${price.toFixed(2)}`;
    default:
      return `${price.toLocaleString()} ${code}`;
  }
}
