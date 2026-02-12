"use client"

import { useState, useMemo, useCallback } from "react"
import { ArrowDownUp, Loader2, Settings, Coins, Gift, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { calculatePoints, calculateReferralBonus, formatNumber } from "@/lib/mock-data"

const TOKENS = [
  { symbol: "ETH", name: "Ethereum", balance: 2.45 },
  { symbol: "TEST", name: "Test Token", balance: 10000 },
]

type SwapState = "idle" | "approving" | "swapping" | "success"

export function SwapCard() {
  const [fromToken, setFromToken] = useState(TOKENS[0])
  const [toToken, setToToken] = useState(TOKENS[1])
  const [fromAmount, setFromAmount] = useState("")
  const [swapState, setSwapState] = useState<SwapState>("idle")

  const parsedAmount = parseFloat(fromAmount) || 0
  const hasReferrer = true // Simulated: user was referred

  const toAmount = useMemo(() => {
    if (!parsedAmount) return ""
    // Simulated exchange rate
    return (parsedAmount * 1000).toFixed(2)
  }, [parsedAmount])

  const basePoints = useMemo(() => calculatePoints(parsedAmount), [parsedAmount])
  const referralBonus = useMemo(() => calculateReferralBonus(basePoints), [basePoints])
  const totalPoints = basePoints + (hasReferrer ? referralBonus : 0)

  const handleSwitch = useCallback(() => {
    setFromToken(toToken)
    setToToken(fromToken)
    setFromAmount("")
  }, [fromToken, toToken])

  const handleSwap = useCallback(async () => {
    if (!parsedAmount) return
    setSwapState("approving")
    await new Promise((r) => setTimeout(r, 1500))
    setSwapState("swapping")
    await new Promise((r) => setTimeout(r, 2000))
    setSwapState("success")
    toast.success(`You earned ${formatNumber(totalPoints)} points!`, {
      description: "Your swap was successful.",
    })
    setTimeout(() => {
      setSwapState("idle")
      setFromAmount("")
    }, 1500)
  }, [parsedAmount, totalPoints])

  const insufficientBalance = parsedAmount > fromToken.balance

  const buttonLabel = (() => {
    if (swapState === "approving") return "Approving..."
    if (swapState === "swapping") return "Swapping..."
    if (swapState === "success") return "Success!"
    if (insufficientBalance) return `Insufficient ${fromToken.symbol}`
    if (!parsedAmount) return "Enter amount"
    return "Swap & Earn Points"
  })()

  const isDisabled =
    swapState !== "idle" || !parsedAmount || insufficientBalance

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Swap & Earn Points
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {/* From Token */}
        <div className="rounded-xl border border-border/50 bg-secondary/50 p-4 transition-colors focus-within:border-primary/40">
          <label className="text-xs text-muted-foreground">You pay</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              min="0"
              step="0.01"
              className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <TokenSelector token={fromToken} onSelect={(t) => { setFromToken(t); setFromAmount("") }} otherToken={toToken} />
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {parsedAmount
                ? `~$${formatNumber(Math.floor(parsedAmount * 3200))}`
                : "\u00A0"}
            </span>
            <button
              type="button"
              onClick={() => setFromAmount(fromToken.balance.toString())}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Max: {fromToken.balance} {fromToken.symbol}
            </button>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-1 relative z-10">
          <button
            type="button"
            onClick={handleSwitch}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all hover:text-foreground hover:border-primary/40 active:scale-95"
          >
            <ArrowDownUp className="h-4 w-4" />
          </button>
        </div>

        {/* To Token */}
        <div className="rounded-xl border border-border/50 bg-secondary/50 p-4">
          <label className="text-xs text-muted-foreground">You receive (estimated)</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="text"
              placeholder="0.0"
              value={toAmount ? `~${toAmount}` : ""}
              readOnly
              className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40"
            />
            <TokenSelector token={toToken} onSelect={(t) => setToToken(t)} otherToken={fromToken} />
          </div>
        </div>

        {/* Points Preview */}
        {parsedAmount > 0 && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Coins className="h-4 w-4 text-primary" />
                  {"Points you'll earn"}
                </span>
                <span className="font-semibold text-foreground">
                  {formatNumber(basePoints)}
                </span>
              </div>
              {hasReferrer && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Gift className="h-4 w-4 text-emerald-400" />
                    Referral bonus (10%)
                  </span>
                  <span className="font-semibold text-emerald-400">
                    +{formatNumber(referralBonus)}
                  </span>
                </div>
              )}
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Total points</span>
                <span className="text-lg font-bold text-primary">
                  {formatNumber(totalPoints)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={isDisabled}
          className="h-12 w-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 glow-primary"
        >
          {(swapState === "approving" || swapState === "swapping") && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {buttonLabel}
        </Button>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>Slippage: 0.5%</span>
          <span className="text-border">{"/"}</span>
          <span>Gas: ~$2.50</span>
        </div>
      </CardContent>
    </Card>
  )
}

function TokenSelector({
  token,
  onSelect,
  otherToken,
}: {
  token: (typeof TOKENS)[0]
  onSelect: (t: (typeof TOKENS)[0]) => void
  otherToken: (typeof TOKENS)[0]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
            {token.symbol[0]}
          </span>
          {token.symbol}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-card border-border">
        {TOKENS.filter((t) => t.symbol !== otherToken.symbol).map((t) => (
          <DropdownMenuItem
            key={t.symbol}
            onClick={() => onSelect(t)}
            className="cursor-pointer gap-2"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
              {t.symbol[0]}
            </span>
            <span>{t.symbol}</span>
            <span className="ml-auto text-xs text-muted-foreground">{t.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
