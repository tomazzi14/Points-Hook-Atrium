"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { ConnectButton } from "@rainbow-me/rainbowkit"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "https://docs.uniswap.org/contracts/v4/overview", label: "Docs", external: true },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Lock className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-foreground">
            Only<span className="text-primary">Swaps</span>
          </span>
        </Link>

        {/* Nav Links - hidden on mobile */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = !link.external && pathname === link.href
            return link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Wallet Button - RainbowKit */}
        <ConnectButton />
      </div>
    </header>
  )
}
