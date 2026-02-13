"use client"

import { Coins, Users, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePointsBalance } from "@/hooks/usePointsBalance"
import { useReferralCount } from "@/hooks/useReferralCount"
import { useEthBalance } from "@/hooks/useEthBalance"
import { formatEther } from "viem"
import { formatNumber } from "@/lib/mock-data"

export function StatsCard() {
  const { data: pointsRaw, isLoading: pointsLoading } = usePointsBalance()
  const { data: referralsRaw, isLoading: referralsLoading } = useReferralCount()
  const { data: ethBalanceData, isLoading: ethLoading } = useEthBalance()

  // Points come back as wei (18 decimals) from the ERC1155 — convert to human-readable
  const pointsBalance = pointsRaw ? parseFloat(formatEther(BigInt(pointsRaw.toString()))) : 0
  const referralCount = referralsRaw ? Number(referralsRaw) : 0
  const ethBalance = ethBalanceData ? formatEther(ethBalanceData.value) : "0"

  const isLoading = pointsLoading || referralsLoading || ethLoading

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Points Balance */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Coins className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Points Balance</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-6 w-24" />
            ) : (
              <p className="text-xl font-bold text-primary">
                {formatNumber(pointsBalance)}
              </p>
            )}
          </div>
        </div>

        {/* Referrals */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Referrals</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-6 w-24" />
            ) : (
              <p className="text-xl font-bold text-emerald-400">
                {referralCount}
                <span className="text-sm font-normal text-muted-foreground"> friends</span>
              </p>
            )}
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10">
            <Wallet className="h-5 w-5 text-sky-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Wallet Balance</p>
            {isLoading ? (
              <Skeleton className="mt-1 h-6 w-24" />
            ) : (
              <p className="text-xl font-bold text-sky-400">
                {parseFloat(ethBalance).toFixed(4)}
                <span className="text-sm font-normal text-muted-foreground"> ETH</span>
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
