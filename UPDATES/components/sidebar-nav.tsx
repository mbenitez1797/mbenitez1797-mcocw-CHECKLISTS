"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Sun, 
  Sunset, 
  Moon, 
  ClipboardList, 
  UserCog, 
  Crown, 
  Target, 
  Sparkles, 
  Wrench,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useInventory } from "@/contexts/inventory-context"

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  category?: string
  badge?: string
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  // Inventory
  { name: "Availability", href: "/availability", icon: BarChart3, category: "Inventory", badge: "Live" },
  { name: "Shift Inventory", href: "/inventory", icon: ClipboardCheck, category: "Inventory" },
  // Front Desk Shifts
  { name: "AM Shift", href: "/am", icon: Sun, category: "Front Desk" },
  { name: "PM Shift", href: "/pm", icon: Sunset, category: "Front Desk" },
  { name: "Night Audit", href: "/night", icon: Moon, category: "Front Desk" },
  // Operations
  { name: "Housekeeping", href: "/housekeeping", icon: Sparkles, category: "Operations" },
  { name: "Engineering", href: "/engineering", icon: Wrench, category: "Operations" },
  // Leadership
  { name: "Admin", href: "/admin", icon: ClipboardList, category: "Leadership" },
  { name: "Sales", href: "/sales", icon: Target, category: "Leadership" },
  { name: "AGM", href: "/agm", icon: UserCog, category: "Leadership" },
  { name: "GM", href: "/gm", icon: Crown, category: "Leadership" },
]

export function SidebarNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { currentShift, isAuditMode } = useInventory()

  const categories = Array.from(new Set(navItems.filter(i => i.category).map(i => i.category)))

  return (
    <aside className={cn(
      "sticky top-[88px] h-[calc(100vh-88px)] bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-60"
    )}>
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-slate-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-600" />
        )}
      </button>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {/* Home Link */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-2 transition-colors",
            pathname === "/" 
              ? "bg-slate-900 text-white" 
              : "text-slate-700 hover:bg-slate-100"
          )}
        >
          <Home className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="font-medium">Home</span>}
        </Link>

        {/* Categorized Items */}
        {categories.map(category => (
          <div key={category} className="mt-4">
            {!isCollapsed && (
              <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {category}
              </div>
            )}
            <div className="space-y-1">
              {navItems
                .filter(item => item.category === category)
                .map(item => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  const isCurrentShift = 
                    (item.href === "/am" && currentShift === "AM" && !isAuditMode) ||
                    (item.href === "/pm" && currentShift === "PM" && !isAuditMode) ||
                    (item.href === "/night" && currentShift === "Night")

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                        isActive 
                          ? "bg-slate-900 text-white" 
                          : "text-slate-700 hover:bg-slate-100",
                        isCurrentShift && !isActive && "ring-2 ring-blue-400 ring-offset-1"
                      )}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      {!isCollapsed && (
                        <>
                          <span className="font-medium flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded">
                              {item.badge}
                            </span>
                          )}
                          {isCurrentShift && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </>
                      )}
                    </Link>
                  )
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Current Shift Indicator */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs font-medium text-slate-500 mb-1">Current Shift</div>
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm font-semibold text-center",
            currentShift === "AM" && "bg-amber-100 text-amber-800",
            currentShift === "PM" && "bg-orange-100 text-orange-800",
            currentShift === "Night" && "bg-indigo-100 text-indigo-800",
          )}>
            {currentShift === "AM" && "Morning Shift"}
            {currentShift === "PM" && "Evening Shift"}
            {currentShift === "Night" && "Night Audit"}
          </div>
        </div>
      )}
    </aside>
  )
}



