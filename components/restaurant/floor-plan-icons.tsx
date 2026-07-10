import React from 'react';

// Common mini components for the icons
const ChairWood = ({ x, y, angle, scale = 1 }: { x: number, y: number, angle: number, scale?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${angle}) scale(${scale})`} filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))">
    <path d="M-10,10 L-10,-6 Q-10,-12 0,-12 Q10,-12 10,-6 L10,10" fill="none" stroke="#5c3317" strokeWidth="4" strokeLinecap="round" />
    <path d="M-10,10 L-10,-6 Q-10,-12 0,-12 Q10,-12 10,-6 L10,10" fill="none" stroke="#a46f44" strokeWidth="3" strokeLinecap="round" />
    <rect x="-8" y="-6" width="16" height="15" rx="3" fill="#dcd1c2" stroke="#a4937e" strokeWidth="1" />
  </g>
);

const ChairGrey = ({ x, y, angle, scale = 1 }: { x: number, y: number, angle: number, scale?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${angle}) scale(${scale})`} filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))">
    <path d="M-11,11 L-11,-5 Q-11,-12 0,-12 Q11,-12 11,-5 L11,11" fill="none" stroke="#3f3f46" strokeWidth="5" strokeLinecap="round" />
    <rect x="-9" y="-7" width="18" height="16" rx="4" fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="1" />
  </g>
);

const ChairIron = ({ x, y, angle, scale = 1 }: { x: number, y: number, angle: number, scale?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${angle}) scale(${scale})`} filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))">
    <path d="M-10,10 L-10,-8 Q-10,-14 0,-14 Q10,-14 10,-8 L10,10" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    <circle cx="0" cy="-6" r="4" fill="none" stroke="#0f172a" strokeWidth="1" />
    <rect x="-8" y="-4" width="16" height="14" rx="7" fill="#334155" stroke="#0f172a" strokeWidth="1" />
  </g>
);

const StoolBar = ({ x, y, angle, scale = 1 }: { x: number, y: number, angle: number, scale?: number }) => (
  <g transform={`translate(${x},${y}) rotate(${angle}) scale(${scale})`} filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))">
    <circle cx="0" cy="0" r="10" fill="#3f3f46" stroke="#18181b" strokeWidth="2" />
    <circle cx="0" cy="0" r="8" fill="#52525b" />
    <path d="M-6,-4 Q0,-8 6,-4" fill="none" stroke="#18181b" strokeWidth="1" opacity="0.3" />
  </g>
);

// Styles
const woodBase = { fill: "#8b5a2b", stroke: "#3d2314", strokeWidth: 2 };
const woodLight = { fill: "rgba(255,255,255,0.08)" };
const woodShadow = { filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.6))" };

const TableRect = ({ x, y, w, h, rx }: any) => (
  <g {...woodShadow}>
    <rect x={x} y={y} width={w} height={h} rx={rx} {...woodBase} />
    <rect x={x+2} y={y+2} width={w-4} height={h-4} rx={rx-1} {...woodLight} />
  </g>
);

const TableCirc = ({ cx, cy, r }: any) => (
  <g {...woodShadow}>
    <circle cx={cx} cy={cy} r={r} {...woodBase} />
    <circle cx={cx} cy={cy} r={r-2} {...woodLight} />
  </g>
);

const TableOval = ({ cx, cy, rx, ry }: any) => (
  <g {...woodShadow}>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} {...woodBase} />
    <ellipse cx={cx} cy={cy} rx={rx-2} ry={ry-2} {...woodLight} />
  </g>
);

// ==== STANDARD TABLES ====
export const RoundTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={50} y={15} angle={180} />
    <ChairWood x={50} y={85} angle={0} />
    <ChairWood x={15} y={50} angle={90} />
    <ChairWood x={85} y={50} angle={-90} />
    <TableCirc cx={50} cy={50} r={28} />
  </svg>
)

export const SquareTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={35} y={15} angle={180} /><ChairWood x={65} y={15} angle={180} />
    <ChairWood x={35} y={85} angle={0} /><ChairWood x={65} y={85} angle={0} />
    <ChairWood x={15} y={35} angle={90} /><ChairWood x={15} y={65} angle={90} />
    <ChairWood x={85} y={35} angle={-90} /><ChairWood x={85} y={65} angle={-90} />
    <TableRect x={22} y={22} w={56} h={56} rx={8} />
    <circle cx={28} cy={28} r={2} fill="rgba(0,0,0,0.3)" />
    <circle cx={72} cy={28} r={2} fill="rgba(0,0,0,0.3)" />
    <circle cx={28} cy={72} r={2} fill="rgba(0,0,0,0.3)" />
    <circle cx={72} cy={72} r={2} fill="rgba(0,0,0,0.3)" />
  </svg>
)

export const RectangleTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <ChairWood x={30} y={15} angle={180} /><ChairWood x={60} y={15} angle={180} /><ChairWood x={90} y={15} angle={180} />
    <ChairWood x={30} y={85} angle={0} /><ChairWood x={60} y={85} angle={0} /><ChairWood x={90} y={85} angle={0} />
    <ChairWood x={12} y={50} angle={90} /><ChairWood x={108} y={50} angle={-90} />
    <TableRect x={18} y={22} w={84} h={56} rx={6} />
  </svg>
)

export const OvalTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <ChairWood x={40} y={15} angle={180} /><ChairWood x={80} y={15} angle={180} />
    <ChairWood x={40} y={85} angle={0} /><ChairWood x={80} y={85} angle={0} />
    <ChairWood x={20} y={35} angle={110} /><ChairWood x={20} y={65} angle={70} />
    <ChairWood x={100} y={35} angle={-110} /><ChairWood x={100} y={65} angle={-70} />
    <TableOval cx={60} cy={50} rx={45} ry={28} />
  </svg>
)

export const CapsuleTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <ChairWood x={40} y={15} angle={180} /><ChairWood x={80} y={15} angle={180} />
    <ChairWood x={40} y={85} angle={0} /><ChairWood x={80} y={85} angle={0} />
    <ChairWood x={15} y={50} angle={90} /><ChairWood x={105} y={50} angle={-90} />
    <TableRect x={18} y={22} w={84} h={56} rx={28} />
  </svg>
)

export const BarTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={30} y={20} angle={180} /><ChairWood x={70} y={20} angle={180} />
    <ChairWood x={30} y={80} angle={0} /><ChairWood x={70} y={80} angle={0} />
    <ChairWood x={15} y={50} angle={90} /><ChairWood x={85} y={50} angle={-90} />
    <TableRect x={18} y={30} w={64} h={40} rx={4} />
  </svg>
)

export const HighTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <StoolBar x={25} y={70} angle={0} /><StoolBar x={60} y={70} angle={0} /><StoolBar x={95} y={70} angle={0} />
    <TableRect x={10} y={30} w={100} h={20} rx={2} />
    <line x1={15} y1={30} x2={15} y2={25} stroke="#3d2314" strokeWidth="4" />
    <line x1={105} y1={30} x2={105} y2={25} stroke="#3d2314" strokeWidth="4" />
  </svg>
)

export const BoothIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <path d="M 10,10 L 90,10 L 90,90 L 70,90 L 70,30 L 30,30 L 30,90 L 10,90 Z" fill="#064e3b" stroke="#022c22" strokeWidth="2" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.5))" />
    <rect x={15} y={15} width={70} height={12} rx={2} fill="#022c22" />
    <TableRect x={35} y={35} w={30} h={55} rx={4} />
  </svg>
)

export const CustomTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <rect x={10} y={10} width={80} height={80} rx={8} fill="none" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8,8" />
    <line x1={50} y1={35} x2={50} y2={65} stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
    <line x1={35} y1={50} x2={65} y2={50} stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

// ==== MODULAR TABLES ====
export const TwoSeatTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={25} y={50} angle={90} /><ChairWood x={75} y={50} angle={-90} />
    <TableRect x={35} y={25} w={30} h={50} rx={4} />
  </svg>
)

export const FourSeatTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={50} y={20} angle={180} /><ChairWood x={50} y={80} angle={0} />
    <ChairWood x={20} y={50} angle={90} /><ChairWood x={80} y={50} angle={-90} />
    <TableRect x={30} y={30} w={40} h={40} rx={4} />
  </svg>
)

export const SixSeatTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <ChairWood x={40} y={25} angle={180} /><ChairWood x={80} y={25} angle={180} />
    <ChairWood x={40} y={75} angle={0} /><ChairWood x={80} y={75} angle={0} />
    <ChairWood x={20} y={50} angle={90} /><ChairWood x={100} y={50} angle={-90} />
    <TableRect x={28} y={33} w={64} h={34} rx={4} />
  </svg>
)

export const ConnectableTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <TableRect x={20} y={25} w={38} h={50} rx={4} />
    <TableRect x={62} y={25} w={38} h={50} rx={4} />
    <rect x={55} y={45} width={10} height={10} rx={2} fill="#334155" />
    <circle cx={57} cy={50} r={2} fill="#e2e8f0" />
    <circle cx={63} cy={50} r={2} fill="#e2e8f0" />
  </svg>
)

export const ExpandableTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <TableRect x={10} y={25} w={80} h={50} rx={4} />
    <line x1={35} y1={25} x2={35} y2={75} stroke="#3d2314" strokeWidth="2" strokeDasharray="4,4" />
    <line x1={65} y1={25} x2={65} y2={75} stroke="#3d2314" strokeWidth="2" strokeDasharray="4,4" />
    <path d="M 95,50 L 115,50 M 95,50 L 100,45 M 95,50 L 100,55 M 115,50 L 110,45 M 115,50 L 110,55" stroke="#334155" strokeWidth="2" fill="none" />
  </svg>
)

export const FoldableTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <TableRect x={40} y={25} w={50} h={50} rx={4} />
    {/* Folded flap */}
    <path d="M 40,25 L 20,35 L 20,85 L 40,75 Z" fill="#784a22" stroke="#3d2314" strokeWidth="2" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" />
    <line x1={40} y1={25} x2={40} y2={75} stroke="#3d2314" strokeWidth="3" />
    <ChairWood x={100} y={50} angle={-90} />
  </svg>
)

// ==== LOUNGE & CAFE ====
export const CoffeeTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairGrey x={25} y={25} angle={135} />
    <ChairGrey x={75} y={25} angle={-135} />
    <ChairGrey x={25} y={75} angle={45} />
    <ChairGrey x={75} y={75} angle={-45} />
    <circle cx="50" cy="50" r="24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.4))" />
    <circle cx="50" cy="50" r="20" fill="none" stroke="#e2e8f0" strokeWidth="1" />
  </svg>
)

export const SofaTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <rect x={20} y={15} width={80} height={20} rx={4} fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="2" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))" />
    <rect x={15} y={10} width={10} height={25} rx={3} fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
    <rect x={95} y={10} width={10} height={25} rx={3} fill="#d4d4d8" stroke="#a1a1aa" strokeWidth="1" />
    <ChairGrey x={40} y={85} angle={0} />
    <ChairGrey x={80} y={85} angle={0} />
    <TableRect x={30} y={40} w={60} h={30} rx={4} />
  </svg>
)

export const BenchSeatingIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <rect x={20} y={20} width={80} height={18} rx={2} fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))" />
    <line x1={20} y1={30} x2={100} y2={30} stroke="#e2e8f0" strokeWidth="1" />
    <TableRect x={20} y={45} w={80} h={35} rx={4} />
  </svg>
)

export const UShapedBoothIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <path d="M 10,10 L 90,10 L 90,90 L 70,90 L 70,30 L 30,30 L 30,90 L 10,90 Z" fill="#064e3b" stroke="#022c22" strokeWidth="2" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.5))" />
    <TableRect x={35} y={35} w={30} h={40} rx={4} />
  </svg>
)

export const CornerBoothIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <path d="M 10,10 L 90,10 L 90,30 L 30,30 L 30,90 L 10,90 Z" fill="#064e3b" stroke="#022c22" strokeWidth="2" filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.5))" />
    <TableRect x={35} y={35} w={40} h={40} rx={4} />
  </svg>
)

export const BanquetteIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <rect x={10} y={20} width={100} height={20} rx={3} fill="#52525b" stroke="#3f3f46" strokeWidth="2" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.4))" />
    <TableRect x={10} y={45} w={100} h={35} rx={4} />
  </svg>
)

// ==== BAR & HIGH TABLES ====
export const BarCounterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 150 100" className={className} overflow="visible">
    <StoolBar x={30} y={75} angle={0} /><StoolBar x={52} y={75} angle={0} /><StoolBar x={74} y={75} angle={0} />
    <StoolBar x={96} y={75} angle={0} /><StoolBar x={118} y={75} angle={0} />
    <g filter="drop-shadow(0px 4px 4px rgba(0,0,0,0.6))">
      <rect x={10} y={25} width={130} height={35} rx={4} fill="#64748b" stroke="#334155" strokeWidth="2" />
      <rect x={12} y={27} width={126} height={10} rx={2} fill="#94a3b8" />
    </g>
  </svg>
)

export const BarTable2Icon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <StoolBar x={30} y={80} angle={0} /><StoolBar x={70} y={80} angle={0} />
    <TableRect x={15} y={25} w={70} h={40} rx={20} />
  </svg>
)

export const HighTable2Icon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairGrey x={30} y={80} angle={0} /><ChairGrey x={70} y={80} angle={0} />
    <TableRect x={20} y={25} w={60} h={40} rx={4} />
  </svg>
)

export const BarStoolIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <line x1={30} y1={80} x2={40} y2={40} stroke="#0f172a" strokeWidth="4" />
    <line x1={70} y1={80} x2={60} y2={40} stroke="#0f172a" strokeWidth="4" />
    <line x1={35} y1={65} x2={65} y2={65} stroke="#0f172a" strokeWidth="3" />
    <rect x={35} y={30} width={30} height={15} rx={5} fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="2" />
    <rect x={40} y={10} width={20} height={15} rx={4} fill="#e4e4e7" stroke="#a1a1aa" strokeWidth="2" />
  </svg>
)

// ==== OUTDOOR TABLES ====
export const PatioTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <ChairWood x={35} y={15} angle={180} /><ChairWood x={60} y={15} angle={180} /><ChairWood x={85} y={15} angle={180} />
    <ChairWood x={35} y={85} angle={0} /><ChairWood x={60} y={85} angle={0} /><ChairWood x={85} y={85} angle={0} />
    <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.6))">
      <rect x={20} y={25} width={80} height={50} rx={4} fill="#b45309" stroke="#78350f" strokeWidth="2" />
      <line x1={20} y1={35} x2={100} y2={35} stroke="#78350f" strokeWidth="1" />
      <line x1={20} y1={45} x2={100} y2={45} stroke="#78350f" strokeWidth="1" />
      <line x1={20} y1={55} x2={100} y2={55} stroke="#78350f" strokeWidth="1" />
      <line x1={20} y1={65} x2={100} y2={65} stroke="#78350f" strokeWidth="1" />
    </g>
  </svg>
)

export const UmbrellaTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={35} y={20} angle={180} /><ChairWood x={65} y={20} angle={180} />
    <ChairWood x={35} y={80} angle={0} /><ChairWood x={65} y={80} angle={0} />
    <TableRect x={25} y={30} w={50} h={40} rx={4} />
    <circle cx={50} cy={50} r={35} fill="#65a30d" stroke="#4d7c0f" strokeWidth="2" opacity="0.9" />
    <path d="M 50,15 L 50,85 M 15,50 L 85,50 M 25,25 L 75,75 M 25,75 L 75,25" stroke="#4d7c0f" strokeWidth="1" opacity="0.5" />
    <circle cx={50} cy={50} r={3} fill="#14532d" />
  </svg>
)

export const PicnicTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <g filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))">
      <rect x={20} y={15} width={80} height={15} rx={2} fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <rect x={20} y={70} width={80} height={15} rx={2} fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <rect x={25} y={30} width={70} height={40} rx={2} fill="#d97706" stroke="#78350f" strokeWidth="2" />
      <line x1={25} y1={43} x2={95} y2={43} stroke="#78350f" strokeWidth="1" />
      <line x1={25} y1={56} x2={95} y2={56} stroke="#78350f" strokeWidth="1" />
    </g>
  </svg>
)

export const GardenTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairIron x={50} y={15} angle={180} />
    <ChairIron x={50} y={85} angle={0} />
    <ChairIron x={15} y={50} angle={90} />
    <ChairIron x={85} y={50} angle={-90} />
    <circle cx={50} cy={50} r={28} fill="#334155" stroke="#0f172a" strokeWidth="2" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.5))" />
    <circle cx={50} cy={50} r={25} fill="none" stroke="#0f172a" strokeWidth="1" strokeDasharray="2,2" />
    <circle cx={50} cy={50} r={12} fill="none" stroke="#0f172a" strokeWidth="1" />
  </svg>
)

// ==== VIP & PRIVATE ====
export const ChefTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <ChairWood x={25} y={15} angle={180} /><ChairWood x={50} y={15} angle={180} /><ChairWood x={75} y={15} angle={180} /><ChairWood x={100} y={15} angle={180} />
    <ChairWood x={25} y={85} angle={0} /><ChairWood x={50} y={85} angle={0} /><ChairWood x={75} y={85} angle={0} /><ChairWood x={100} y={85} angle={0} />
    <TableRect x={10} y={25} w={105} h={50} rx={6} />
  </svg>
)

export const PrivateDiningIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={50} y={10} angle={180} /><ChairWood x={50} y={90} angle={0} />
    <ChairWood x={10} y={50} angle={90} /><ChairWood x={90} y={50} angle={-90} />
    <ChairWood x={22} y={22} angle={135} /><ChairWood x={78} y={22} angle={-135} />
    <ChairWood x={22} y={78} angle={45} /><ChairWood x={78} y={78} angle={-45} />
    <TableCirc cx={50} cy={50} r={32} />
  </svg>
)

export const EventTableIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 100" className={className} overflow="visible">
    <ChairWood x={25} y={15} angle={180} /><ChairWood x={50} y={15} angle={180} /><ChairWood x={75} y={15} angle={180} /><ChairWood x={100} y={15} angle={180} />
    <ChairWood x={25} y={85} angle={0} /><ChairWood x={50} y={85} angle={0} /><ChairWood x={75} y={85} angle={0} /><ChairWood x={100} y={85} angle={0} />
    <ChairWood x={10} y={50} angle={90} /><ChairWood x={115} y={50} angle={-90} />
    <g filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.6))">
      <rect x={15} y={25} width={95} height={50} rx={8} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />
      <rect x={20} y={30} width={85} height={40} rx={6} fill="#ffffff" />
    </g>
  </svg>
)

// ==== SEATING ====
export const WoodenChairIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairWood x={50} y={50} angle={0} scale={2} />
  </svg>
)
export const ArmchairIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <ChairGrey x={50} y={50} angle={0} scale={2} />
  </svg>
)
export const SofaSeatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <rect x={15} y={15} width={70} height={70} rx={8} fill="#52525b" stroke="#3f3f46" strokeWidth="4" />
    <rect x={25} y={25} width={50} height={45} rx={4} fill="#e4e4e7" />
  </svg>
)
export const BabyChairIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} overflow="visible">
    <rect x={25} y={30} width={50} height={50} rx={8} fill="#f1f5f9" stroke="#94a3b8" strokeWidth="4" />
    <rect x={35} y={20} width={30} height={30} rx={4} fill="#94a3b8" />
    <rect x={20} y={60} width={60} height={15} rx={4} fill="#cbd5e1" />
  </svg>
)
