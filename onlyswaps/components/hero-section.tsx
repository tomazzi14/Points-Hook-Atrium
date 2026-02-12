"use client"

import { ArrowDown, Sparkles, Zap } from "lucide-react"
import { useWallet } from "@/lib/wallet-context"
import { useConnectModal } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const { isConnected } = useWallet()
  const { openConnectModal } = useConnectModal()

  if (isConnected) return null

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Exclusive Swaps. Exclusive Rewards.
        </div>

        {/* Heading */}
        <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
          Your swaps deserve{" "}
          <span className="text-primary">exclusive rewards.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed text-pretty">
          Subscribe to the swap experience. Every trade earns you 20% in POINTS tokens.
          Refer friends and earn 10% bonus forever on all their trades.
        </p>

        {/* Features */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <span>20% Points per Swap</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span>10% Referral Bonus</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ArrowDown className="h-4 w-4 text-primary" />
            </div>
            <span>Low Gas Fees</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Button
            onClick={openConnectModal}
            size="lg"
            className="h-12 bg-primary px-8 text-base font-semibold text-primary-foreground hover:bg-primary/90 glow-primary"
          >
            Connect Wallet to Start
          </Button>
        </div>
      </div>
    </section>
  )
}
