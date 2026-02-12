"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"

const TABS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  { href: "#", icon: User, label: "Profile" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
