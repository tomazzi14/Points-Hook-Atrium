"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Lock, ExternalLink, Copy, LogOut, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useDisconnect } from "wagmi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "https://docs.uniswap.org/contracts/v4/overview", label: "Docs", external: true },
]

function WalletAvatar({ address }: { address: string }) {
  const hue = parseInt(address.slice(2, 8), 16) % 360
  return (
    <div
      className="h-6 w-6 rounded-full"
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${(hue + 60) % 360}, 70%, 40%))`,
      }}
    />
  )
}

export function Header() {
  const pathname = usePathname()
  const { disconnect } = useDisconnect()

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

        {/* Wallet Button - Custom styled */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const connected = mounted && account && chain

            return (
              <div
                {...(!mounted && {
                  "aria-hidden": true,
                  style: { opacity: 0, pointerEvents: "none" as const, userSelect: "none" as const },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button
                        onClick={openConnectModal}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
                      >
                        Connect Wallet
                      </Button>
                    )
                  }

                  if (chain.unsupported) {
                    return (
                      <Button onClick={openChainModal} variant="destructive">
                        Wrong Network
                      </Button>
                    )
                  }

                  return (
                    <div className="flex items-center gap-2">
                      {/* Chain button */}
                      <button
                        onClick={openChainModal}
                        className="hidden items-center gap-1.5 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary sm:flex"
                      >
                        {chain.hasIcon && chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain"}
                            src={chain.iconUrl}
                            className="h-4 w-4 rounded-full"
                          />
                        )}
                        <span className="hidden md:inline">{chain.name}</span>
                      </button>

                      {/* Account dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 transition-colors hover:bg-secondary">
                            {account.displayBalance && (
                              <span className="hidden text-sm text-muted-foreground sm:inline">
                                {account.displayBalance}
                              </span>
                            )}
                            <WalletAvatar address={account.address} />
                            <span className="font-mono text-sm text-foreground">
                              {account.displayName}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(account.address)
                              toast.success("Address copied to clipboard")
                            }}
                            className="cursor-pointer gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Address
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="cursor-pointer gap-2">
                            <a
                              href={`https://sepolia.etherscan.io/address/${account.address}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View on Etherscan
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => disconnect()}
                            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          >
                            <LogOut className="h-4 w-4" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </header>
  )
}
