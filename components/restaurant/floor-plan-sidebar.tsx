"use client"

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { 
  ChevronDown, ChevronRight, LayoutPanelTop, Search, 
  Move3d, Trees, UtensilsCrossed, MonitorSpeaker, Tags,
  Square, CornerRightDown, CircleDashed, SeparatorHorizontal, Grid2X2, DoorClosed, DoorOpen, ArrowLeftRight, Maximize, Rainbow, Cylinder, MoveUp,
  Circle, RectangleHorizontal, Sofa, GlassWater, Martini, PenTool, Armchair, Wine, ConciergeBell, Banknote, Soup, Shirt, Archive,
  ChefHat, Flame, Microwave, Droplet, Snowflake, Waves, LayoutGrid, Table, Bath, User, Accessibility, Wrench, ArrowUpDown,
  Flower2, TreePine, Umbrella, Grid3X3, LayoutDashboard, Sun, Tag,
  Minus, TrendingUp, XSquare, ArrowUpRight, Pill, Link, MoveHorizontal, FoldHorizontal, Coffee, Users, Baby, PartyPopper
} from "lucide-react"
import { 
  RoundTableIcon, SquareTableIcon, RectangleTableIcon, OvalTableIcon, CapsuleTableIcon, BarTableIcon, HighTableIcon, BoothIcon, CustomTableIcon,
  TwoSeatTableIcon, FourSeatTableIcon, SixSeatTableIcon, ConnectableTableIcon, ExpandableTableIcon, FoldableTableIcon,
  CoffeeTableIcon, SofaTableIcon, BenchSeatingIcon, UShapedBoothIcon, CornerBoothIcon, BanquetteIcon,
  BarCounterIcon, BarTable2Icon, HighTable2Icon, BarStoolIcon,
  PatioTableIcon, UmbrellaTableIcon, PicnicTableIcon, GardenTableIcon,
  ChefTableIcon, PrivateDiningIcon, EventTableIcon,
  WoodenChairIcon, ArmchairIcon, SofaSeatIcon, BabyChairIcon 
} from "./floor-plan-icons"

interface Props {
  onAddTable: (shape: string, capacity: number, presetColor?: string) => void
  onAddElement: (type: string) => void
  activeColor: string
  onColorChange: (color: string) => void
}

function DragItem({
  label,
  icon,
  payload,
  onClick,
  badge,
}: {
  label: string
  icon?: React.ReactNode
  payload: object
  onClick?: () => void
  badge?: string
}) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("floor-plan-item", JSON.stringify(payload))}
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
          {icon || <div className="w-2 h-2 rounded-full bg-gray-400 group-hover:bg-blue-500 transition-colors" />}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-violet-600 border border-violet-300 bg-violet-50 tracking-wider">
          {badge}
        </span>
      )}
    </div>
  )
}

function Category({ title, icon, defaultOpen = false, children }: { title: string, icon: React.ReactNode, defaultOpen?: boolean, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 transition-colors group text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-5 h-5 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors shrink-0">
            {icon}
          </div>
          <span className="text-sm font-semibold text-gray-800 truncate group-hover:text-gray-900 transition-colors">
            {title}
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {isOpen && (
        <div className="px-2 pb-3 space-y-1">
          {children}
        </div>
      )}
    </div>
  )
}

export function FloorPlanSidebar({ onAddTable, onAddElement, activeColor, onColorChange }: Props) {
  const { t } = useTranslation()
  const [search, setSearch] = useState("")

  return (
    <div className="w-[280px] h-full bg-white border-r border-gray-200 flex flex-col z-20 shrink-0 font-sans shadow-sm">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t("restaurant.floorPlan.searchAssets", "Search assets...")} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <Category title={t("restaurant.assets.structure", "STRUCTURE")} icon={<LayoutPanelTop className="w-4 h-4" />} defaultOpen>
          <DragItem label={t("restaurant.assets.wall", "Wall")} icon={<Minus className="w-4 h-4" />} payload={{ category: 'element', type: 'wall' }} />
          <DragItem label={t("restaurant.assets.cornerWall", "Corner Wall")} icon={<CornerRightDown className="w-4 h-4" />} payload={{ category: 'element', type: 'corner_wall' }} />
          <DragItem label={t("restaurant.assets.curvedWall", "Curved Wall")} icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 20c0-8.284 6.716-15 15-15"/></svg>} payload={{ category: 'element', type: 'curved_wall' }} />
          <DragItem label={t("restaurant.assets.divider", "Divider")} icon={<SeparatorHorizontal className="w-4 h-4" />} payload={{ category: 'element', type: 'divider' }} />
          <DragItem label={t("restaurant.assets.glassWall", "Glass Wall")} icon={<Grid2X2 className="w-4 h-4" />} payload={{ category: 'element', type: 'glass_wall' }} />
          <DragItem label={t("restaurant.assets.door", "Door")} icon={<DoorClosed className="w-4 h-4" />} payload={{ category: 'element', type: 'door' }} />
          <DragItem label={t("restaurant.assets.doubleDoor", "Double Door")} icon={<DoorOpen className="w-4 h-4" />} payload={{ category: 'element', type: 'double_door' }} />
          <DragItem label={t("restaurant.assets.slidingDoor", "Sliding Door")} icon={<ArrowLeftRight className="w-4 h-4" />} payload={{ category: 'element', type: 'sliding_door' }} />
          <DragItem label={t("restaurant.assets.window", "Window")} icon={<Maximize className="w-4 h-4" />} payload={{ category: 'element', type: 'window' }} />
          <DragItem label={t("restaurant.assets.arch", "Arch")} icon={<Rainbow className="w-4 h-4" />} payload={{ category: 'element', type: 'arch' }} />
          <DragItem label={t("restaurant.assets.column", "Column")} icon={<Cylinder className="w-4 h-4" />} payload={{ category: 'element', type: 'column' }} />
          <DragItem label={t("restaurant.assets.stairs", "Stairs")} icon={<MoveUp className="w-4 h-4" />} payload={{ category: 'element', type: 'stairs' }} />
          <DragItem label={t("restaurant.assets.escalator", "Escalator")} icon={<ArrowUpRight className="w-4 h-4" />} payload={{ category: 'element', type: 'escalator' }} />
          <DragItem label={t("restaurant.assets.elevator", "Elevator")} icon={<ArrowUpDown className="w-4 h-4" />} payload={{ category: 'element', type: 'elevator' }} />
          <DragItem label={t("restaurant.assets.wheelchair", "Wheelchair")} icon={<Accessibility className="w-4 h-4" />} payload={{ category: 'element', type: 'wheelchair' }} />
          <DragItem label={t("restaurant.assets.ramp", "Ramp")} icon={<TrendingUp className="w-4 h-4" />} payload={{ category: 'element', type: 'ramp' }} />
          <DragItem label={t("restaurant.assets.shaft", "Shaft")} icon={<XSquare className="w-4 h-4" />} payload={{ category: 'element', type: 'shaft' }} />
        </Category>

        <Category title={t("restaurant.assets.standardTables", "Standard Tables")} icon={<Move3d className="w-4 h-4" />} defaultOpen>
          <DragItem label={t("restaurant.assets.roundTable", "Round Table")} icon={<RoundTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'round', capacity: 4 }} onClick={() => onAddTable('round', 4)} />
          <DragItem label={t("restaurant.assets.squareTable", "Square Table")} icon={<SquareTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'square', capacity: 4 }} onClick={() => onAddTable('square', 4)} />
          <DragItem label={t("restaurant.assets.rectangleTable", "Rectangle Table")} icon={<RectangleTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'rectangular', capacity: 6 }} onClick={() => onAddTable('rectangular', 6)} />
          <DragItem label={t("restaurant.assets.ovalTable", "Oval Table")} icon={<OvalTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'oval', capacity: 6 }} onClick={() => onAddTable('oval', 6)} />
          <DragItem label={t("restaurant.assets.capsuleTable", "Capsule Table")} icon={<CapsuleTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'capsule', capacity: 6 }} onClick={() => onAddTable('capsule', 6)} />
          <DragItem label={t("restaurant.assets.twoSeatTable", "2-Seat Table")} icon={<TwoSeatTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'two_seat', capacity: 2 }} onClick={() => onAddTable('two_seat', 2)} />
          <DragItem label={t("restaurant.assets.barTable", "Bar Table")} icon={<BarTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'bar', capacity: 6 }} onClick={() => onAddTable('bar', 6)} />
          <DragItem label={t("restaurant.assets.highTable", "High Table")} icon={<HighTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'high', capacity: 3 }} onClick={() => onAddTable('high', 3)} />
          <DragItem label={t("restaurant.assets.booth", "Booth")} icon={<BoothIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'booth', capacity: 4 }} onClick={() => onAddTable('booth', 4)} />
          <DragItem label={t("restaurant.assets.connectable", "Connectable")} icon={<ConnectableTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'connectable', capacity: 2 }} onClick={() => onAddTable('connectable', 2)} />
          <DragItem label={t("restaurant.assets.expandable", "Expandable")} icon={<ExpandableTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'expandable', capacity: 4 }} onClick={() => onAddTable('expandable', 4)} />
          <DragItem label={t("restaurant.assets.foldable", "Foldable")} icon={<FoldableTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'foldable', capacity: 2 }} onClick={() => onAddTable('foldable', 2)} />
          <DragItem label={t("restaurant.assets.customTable", "Custom Table")} icon={<CustomTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'custom', capacity: 8 }} onClick={() => onAddTable('custom', 8)} />
        </Category>

        <Category title={t("restaurant.assets.loungeCafe", "Lounge & Cafe")} icon={<Coffee className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.coffeeTable", "Coffee Table")} icon={<CoffeeTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'coffee_table', capacity: 4 }} onClick={() => onAddTable('coffee_table', 4)} />
          <DragItem label={t("restaurant.assets.sofaTable", "Sofa Table")} icon={<SofaTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'sofa_table', capacity: 4 }} onClick={() => onAddTable('sofa_table', 4)} />
          <DragItem label={t("restaurant.assets.benchSeating", "Bench Seating")} icon={<BenchSeatingIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'bench_seating', capacity: 3 }} onClick={() => onAddTable('bench_seating', 3)} />
          <DragItem label={t("restaurant.assets.uShapedBooth", "U-Shaped Booth")} icon={<UShapedBoothIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'u_conf', capacity: 6 }} onClick={() => onAddTable('u_conf', 6)} />
          <DragItem label={t("restaurant.assets.cornerBooth", "Corner Booth")} icon={<CornerBoothIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'corner_booth', capacity: 4 }} onClick={() => onAddTable('corner_booth', 4)} />
          <DragItem label={t("restaurant.assets.banquette", "Banquette")} icon={<BanquetteIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'banquette', capacity: 4 }} onClick={() => onAddTable('banquette', 4)} />
        </Category>

        <Category title={t("restaurant.assets.barHighTables", "Bar & High Tables")} icon={<Wine className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.barCounter", "Bar Counter")} icon={<BarCounterIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'element', type: 'bar_counter' }} />
          <DragItem label={t("restaurant.assets.barTable", "Bar Table")} icon={<BarTable2Icon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'bar', capacity: 2 }} onClick={() => onAddTable('bar', 2)} />
          <DragItem label={t("restaurant.assets.highTable", "High Table")} icon={<HighTable2Icon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'high', capacity: 2 }} onClick={() => onAddTable('high', 2)} />
          <DragItem label={t("restaurant.assets.barStool", "Bar Stool")} icon={<BarStoolIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'element', type: 'bar_stool' }} />
        </Category>

        <Category title={t("restaurant.assets.outdoorTables", "Outdoor Tables")} icon={<Sun className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.patioTable", "Patio Table")} icon={<PatioTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'patio_table', capacity: 4 }} onClick={() => onAddTable('patio_table', 4)} />
          <DragItem label={t("restaurant.assets.umbrellaTable", "Umbrella Table")} icon={<UmbrellaTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'umbrella_table', capacity: 4 }} onClick={() => onAddTable('umbrella_table', 4)} />
          <DragItem label={t("restaurant.assets.picnicTable", "Picnic Table")} icon={<PicnicTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'picnic_table', capacity: 6 }} onClick={() => onAddTable('picnic_table', 6)} />
          <DragItem label={t("restaurant.assets.gardenTable", "Garden Table")} icon={<GardenTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'garden_table', capacity: 4 }} onClick={() => onAddTable('garden_table', 4)} />
        </Category>

        <Category title={t("restaurant.assets.vipPrivate", "VIP & Private")} icon={<Users className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.chefTable", "Chef's Table")} icon={<ChefTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'chef_table', capacity: 8 }} onClick={() => onAddTable('chef_table', 8)} />
          <DragItem label={t("restaurant.assets.privateDining", "Private Dining")} icon={<PrivateDiningIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'private_dining', capacity: 10 }} onClick={() => onAddTable('private_dining', 10)} />
          <DragItem label={t("restaurant.assets.familyTable", "Family Table")} icon={<ChefTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'family_table', capacity: 8 }} onClick={() => onAddTable('family_table', 8)} />
          <DragItem label={t("restaurant.assets.eventTable", "Event Table")} icon={<EventTableIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'table', shape: 'event_table', capacity: 12 }} onClick={() => onAddTable('event_table', 12)} />
        </Category>

        <Category title={t("restaurant.assets.chairsSeating", "Chairs & Seating")} icon={<Armchair className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.woodenChair", "Wooden Chair")} icon={<WoodenChairIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'element', type: 'wooden_chair' }} />
          <DragItem label={t("restaurant.assets.armchair", "Armchair")} icon={<ArmchairIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'element', type: 'armchair' }} />
          <DragItem label={t("restaurant.assets.bench", "Bench")} icon={<Square className="w-4 h-4" />} payload={{ category: 'element', type: 'bench' }} />
          <DragItem label={t("restaurant.assets.sofaSeat", "Sofa Seat")} icon={<SofaSeatIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'element', type: 'sofa_seat' }} />
          <DragItem label={t("restaurant.assets.babyChair", "Baby Chair")} icon={<BabyChairIcon className="w-12 h-12 -ml-2" />} payload={{ category: 'element', type: 'baby_chair' }} />
          <DragItem label={t("restaurant.assets.wheelchairSpace", "Wheelchair Space")} icon={<Accessibility className="w-4 h-4" />} payload={{ category: 'element', type: 'wheelchair' }} />
        </Category>

        <Category title={t("restaurant.assets.decorStorage", "Decor & Storage")} icon={<Archive className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.receptionDesk", "Reception Desk")} icon={<ConciergeBell className="w-4 h-4" />} payload={{ category: 'element', type: 'reception_desk' }} />
          <DragItem label={t("restaurant.assets.cashier", "Cashier")} icon={<Banknote className="w-4 h-4" />} payload={{ category: 'element', type: 'cashier' }} />
          <DragItem label={t("restaurant.assets.buffet", "Buffet")} icon={<Soup className="w-4 h-4" />} payload={{ category: 'element', type: 'buffet' }} />
          <DragItem label={t("restaurant.assets.waitingBench", "Waiting Bench")} icon={<Armchair className="w-4 h-4" />} payload={{ category: 'element', type: 'waiting_bench' }} />
          <DragItem label={t("restaurant.assets.coatRack", "Coat Rack")} icon={<Shirt className="w-4 h-4" />} payload={{ category: 'element', type: 'coat_rack' }} />
          <DragItem label={t("restaurant.assets.cabinet", "Cabinet")} icon={<Archive className="w-4 h-4" />} payload={{ category: 'element', type: 'cabinet' }} />
        </Category>

        <Category title={t("restaurant.assets.kitchen", "Kitchen")} icon={<UtensilsCrossed className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.kitchenArea", "Kitchen Area")} icon={<ChefHat className="w-4 h-4" />} payload={{ category: 'element', type: 'kitchen_area' }} />
          <DragItem label={t("restaurant.assets.grill", "Grill")} icon={<Flame className="w-4 h-4" />} payload={{ category: 'element', type: 'grill' }} />
          <DragItem label={t("restaurant.assets.oven", "Oven")} icon={<Microwave className="w-4 h-4" />} payload={{ category: 'element', type: 'oven' }} />
          <DragItem label={t("restaurant.assets.sink", "Sink")} icon={<Droplet className="w-4 h-4" />} payload={{ category: 'element', type: 'sink' }} />
          <DragItem label={t("restaurant.assets.refrigerator", "Refrigerator")} icon={<Snowflake className="w-4 h-4" />} payload={{ category: 'element', type: 'refrigerator' }} />
          <DragItem label={t("restaurant.assets.dishwasher", "Dishwasher")} icon={<Waves className="w-4 h-4" />} payload={{ category: 'element', type: 'dishwasher' }} />
          <DragItem label={t("restaurant.assets.storageShelf", "Storage Shelf")} icon={<LayoutGrid className="w-4 h-4" />} payload={{ category: 'element', type: 'storage_shelf' }} />
          <DragItem label={t("restaurant.assets.prepTable", "Prep Table")} icon={<Table className="w-4 h-4" />} payload={{ category: 'element', type: 'prep_table' }} />
        </Category>

        <Category title={t("restaurant.assets.facilities", "Facilities")} icon={<MonitorSpeaker className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.restroom", "Restroom")} icon={<Bath className="w-4 h-4" />} payload={{ category: 'element', type: 'restroom' }} />
          <DragItem label={t("restaurant.assets.mensToilet", "Men's Toilet")} icon={<User className="w-4 h-4" />} payload={{ category: 'element', type: 'mens_toilet' }} />
          <DragItem label={t("restaurant.assets.womensToilet", "Women's Toilet")} icon={<User className="w-4 h-4" />} payload={{ category: 'element', type: 'womens_toilet' }} />
          <DragItem label={t("restaurant.assets.accessibleToilet", "Accessible Toilet")} icon={<Accessibility className="w-4 h-4" />} payload={{ category: 'element', type: 'accessible_toilet' }} />
          <DragItem label={t("restaurant.assets.utilityRoom", "Utility Room")} icon={<Wrench className="w-4 h-4" />} payload={{ category: 'element', type: 'utility_room' }} />
          <DragItem label={t("restaurant.assets.elevator", "Elevator")} icon={<ArrowUpDown className="w-4 h-4" />} payload={{ category: 'element', type: 'elevator' }} />
          <DragItem label={t("restaurant.assets.emergencyExit", "Emergency Exit")} icon={<DoorOpen className="w-4 h-4" />} payload={{ category: 'element', type: 'emergency_exit' }} />
        </Category>

        <Category title={t("restaurant.assets.outdoor", "Outdoor")} icon={<Trees className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.plant", "Plant")} icon={<Flower2 className="w-4 h-4" />} payload={{ category: 'element', type: 'plant' }} />
          <DragItem label={t("restaurant.assets.tree", "Tree")} icon={<TreePine className="w-4 h-4" />} payload={{ category: 'element', type: 'tree' }} />
          <DragItem label={t("restaurant.assets.umbrella", "Umbrella")} icon={<Umbrella className="w-4 h-4" />} payload={{ category: 'element', type: 'umbrella' }} />
          <DragItem label={t("restaurant.assets.fence", "Fence")} icon={<Grid3X3 className="w-4 h-4" />} payload={{ category: 'element', type: 'fence' }} />
          <DragItem label={t("restaurant.assets.patio", "Patio")} icon={<LayoutDashboard className="w-4 h-4" />} payload={{ category: 'element', type: 'patio' }} />
          <DragItem label={t("restaurant.assets.terraceFurniture", "Terrace Furniture")} icon={<Sun className="w-4 h-4" />} payload={{ category: 'element', type: 'terrace_furniture' }} />
        </Category>

        <Category title={t("restaurant.assets.labels", "Labels")} icon={<Tags className="w-4 h-4" />}>
          <DragItem label={t("restaurant.assets.labelKitchen", "Kitchen")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'Kitchen' }} />
          <DragItem label={t("restaurant.assets.diningArea", "Dining Area")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'Dining Area' }} />
          <DragItem label={t("restaurant.assets.labelVip", "VIP")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'VIP' }} />
          <DragItem label={t("restaurant.assets.terrace", "Terrace")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'Terrace' }} />
          <DragItem label={t("restaurant.assets.smoking", "Smoking")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'Smoking' }} />
          <DragItem label={t("restaurant.assets.labelBar", "Bar")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'Bar' }} />
          <DragItem label={t("restaurant.assets.waitingArea", "Waiting Area")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'Waiting Area' }} />
          <DragItem label={t("restaurant.assets.privateRoom", "Private Room")} icon={<Tag className="w-4 h-4" />} payload={{ category: 'element', type: 'label', text: 'Private Room' }} />
        </Category>
      </div>
    </div>
  )
}
