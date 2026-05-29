// Remove discover-level layout since the parent /client/layout.tsx handles it now
export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
