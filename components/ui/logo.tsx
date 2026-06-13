import Image from "next/image"

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 160, height = 48 }: LogoProps) {
  return (
    <Image
      src="/logo.svg"
      alt="HayBooking Logo"
      width={width}
      height={height}
      className={`object-contain ${className || ""}`}
      style={{
        maxWidth: width,
        maxHeight: height,
        width: "auto",
        height: "auto",
      }}
      priority
    />
  )
}
