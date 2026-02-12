"use client"

import { useEffect, useState } from "react"
import { Coins, Users, Trophy, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MOCK_USER_STATS, formatNumber } from "@/lib/mock-data"

function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.floor(target * eased))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])

  return <>{formatNumber(current)}</>
}

const STATS = [
  {
    label: "Points Balance",
    value: MOCK_USER_STATS.pointsBalance,
    icon: Coins,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Referrals",
    value: MOCK_USER_STATS.referralCount,
    icon: Users,
    suffix: " friends",
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  {
    label: "Global Rank",
    value: MOCK_USER_STATS.globalRank,
    icon: Trophy,
    prefix: "#",
    suffix: ` of ${formatNumber(MOCK_USER_STATS.totalUsers)}`,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    label: "Total Earned",
    value: MOCK_USER_STATS.totalEarnedEth,
    icon: TrendingUp,
    suffix: " ETH in points",
    isDecimal: true,
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
  },
]

export function StatsCard() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Your Stats
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-6 w-24" />
              ) : (
                <p className={`text-xl font-bold ${stat.color}`}>
                  {stat.prefix}
                  {stat.isDecimal ? stat.value : <AnimatedNumber target={stat.value} />}
                  <span className="text-sm font-normal text-muted-foreground">
                    {stat.suffix}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
