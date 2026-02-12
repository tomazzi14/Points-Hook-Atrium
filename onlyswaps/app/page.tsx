"use client"

import { useWallet } from "@/lib/wallet-context"
import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { StatsCard } from "@/components/stats-card"
import { SwapCard } from "@/components/swap-card"
import { ReferralCard } from "@/components/referral-card"
import { MobileNav } from "@/components/mobile-nav"

function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8 lg:px-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
        {/* Stats - left column on desktop, full on mobile */}
        <div className="order-2 lg:order-1">
          <StatsCard />
        </div>

        {/* Swap - center column, main feature */}
        <div className="order-1 lg:order-2">
          <SwapCard />
        </div>

        {/* Referral - right column on desktop */}
        <div className="order-3">
          <ReferralCard />
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const { isConnected } = useWallet()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        {isConnected && <Dashboard />}
      </main>
      <MobileNav />
    </div>
  )
}
