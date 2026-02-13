"use client"

import { useState, useMemo, useEffect } from "react"
import { ArrowDownUp, Loader2, Settings, Coins, Gift } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useEthBalance } from "@/hooks/useEthBalance"
import { useSwap } from "@/hooks/useSwap"
import { useWallet } from "@/lib/wallet-context"
import { calculatePoints, calculateReferralBonus, formatNumber } from "@/lib/mock-data"
import { formatEther } from "viem"

export function SwapCard() {
  const { isConnected } = useWallet()
  const { data: ethBalanceData } = useEthBalance()
  const { swap, isPending, isConfirming, isSuccess, error } = useSwap()

  const [fromAmount, setFromAmount] = useState("")
  const [direction, setDirection] = useState<"ethToToken" | "tokenToEth">("ethToToken")

  const ethBalance = ethBalanceData
    ? parseFloat(formatEther(ethBalanceData.value))
    : 0

  const parsedAmount = parseFloat(fromAmount) || 0
  const hasReferrer = false // TODO: read from URL params or contract

  // Simulated exchange rate (until pool is live)
  const toAmount = useMemo(() => {
    if (!parsedAmount) return ""
    return direction === "ethToToken"
      ? (parsedAmount * 1000).toFixed(2)
      : (parsedAmount / 1000).toFixed(6)
  }, [parsedAmount, direction])

  const basePoints = useMemo(() => calculatePoints(parsedAmount), [parsedAmount])
  const referralBonus = useMemo(() => calculateReferralBonus(basePoints), [basePoints])
  const totalPoints = basePoints + (hasReferrer ? referralBonus : 0)

  const fromSymbol = direction === "ethToToken" ? "ETH" : "TEST"
  const toSymbol = direction === "ethToToken" ? "TEST" : "ETH"
  const fromBalance = direction === "ethToToken" ? ethBalance : 0 // TODO: read TEST balance

  const handleSwitch = () => {
    setDirection((d) => (d === "ethToToken" ? "tokenToEth" : "ethToToken"))
    setFromAmount("")
  }

  const handleSwap = () => {
    if (!parsedAmount || !isConnected) return

    if (direction === "ethToToken") {
      swap(fromAmount)
    } else {
      // TODO: implement TOKEN → ETH swap (needs token approval first)
      toast.error("TOKEN → ETH swap not implemented yet")
    }
  }

  // Show toast on success/error
  useEffect(() => {
    if (isSuccess) {
      toast.success(`Swap successful! You earned ~${formatNumber(totalPoints)} points!`)
      setFromAmount("")
    }
  }, [isSuccess, totalPoints])

  useEffect(() => {
    if (error) {
      const msg = error.message?.includes("Pool not initialized")
        ? "Pool not initialized yet on Sepolia. Deploy the pool first."
        : error.message?.slice(0, 100) || "Swap failed"
      toast.error(msg)
    }
  }, [error])

  const insufficientBalance = parsedAmount > fromBalance
  const isSwapping = isPending || isConfirming

  const buttonLabel = (() => {
    if (!isConnected) return "Connect wallet"
    if (isPending) return "Confirm in wallet..."
    if (isConfirming) return "Swapping..."
    if (insufficientBalance) return `Insufficient ${fromSymbol}`
    if (!parsedAmount) return "Enter amount"
    return "Swap & Earn Points"
  })()

  const isDisabled = isSwapping || !parsedAmount || insufficientBalance || !isConnected

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
              step="0.001"
              className="min-w-0 flex-1 bg-transparent text-2xl font-bold text-foreground outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-sm font-semibold text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {fromSymbol[0]}
              </span>
              {fromSymbol}
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{"\u00A0"}</span>
            <button
              type="button"
              onClick={() => {
                if (fromBalance > 0) {
                  // Leave a little for gas
                  const maxAmount = direction === "ethToToken"
                    ? Math.max(0, fromBalance - 0.001).toFixed(6)
                    : fromBalance.toString()
                  setFromAmount(maxAmount)
                }
              }}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Max: {fromBalance.toFixed(4)} {fromSymbol}
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
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-sm font-semibold text-foreground">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {toSymbol[0]}
              </span>
              {toSymbol}
            </div>
          </div>
        </div>

        {/* Points Preview */}
        {parsedAmount > 0 && direction === "ethToToken" && (
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
          {isSwapping && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {buttonLabel}
        </Button>

        {/* Footer Info */}
        <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>Slippage: 0.5%</span>
          <span className="text-border">{"/"}</span>
          <span>Sepolia Testnet</span>
        </div>
      </CardContent>
    </Card>
  )
}
