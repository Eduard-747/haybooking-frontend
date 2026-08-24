import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 160, height = 44 }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="HayBooking Logo"
      width={width}
      height={height}
      className={`object-contain max-w-full shrink-0 ${className || "h-7 sm:h-9 md:h-10 w-auto"}`}
      priority
    />
  )
}
