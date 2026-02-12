"use client"

import { useState, useMemo } from "react"
import { Search, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { truncateAddress, useWallet } from "@/lib/wallet-context"
import { MOCK_LEADERBOARD, MOCK_USER_STATS, formatNumber, formatCompactNumber } from "@/lib/mock-data"

const MEDALS = ["", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"]

export function LeaderboardTable() {
  const { address } = useWallet()
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"points" | "referrals">("points")

  const sorted = useMemo(() => {
    const list = [...MOCK_LEADERBOARD]
    if (tab === "referrals") {
      list.sort((a, b) => b.referrals - a.referrals)
    }
    return list
  }, [tab])

  const filtered = useMemo(() => {
    if (!search) return sorted
    return sorted.filter((entry) =>
      entry.address.toLowerCase().includes(search.toLowerCase())
    )
  }, [sorted, search])

  // Simulated user row
  const userRow = address
    ? {
        rank: MOCK_USER_STATS.globalRank,
        address,
        referrals: MOCK_USER_STATS.referralCount,
        totalPoints: MOCK_USER_STATS.pointsBalance,
      }
    : null

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 font-heading text-xl font-bold text-foreground">
            <Trophy className="h-5 w-5 text-primary" />
            Top Referrers
          </CardTitle>
          <div className="flex items-center gap-3">
            <Tabs
              value={tab}
              onValueChange={(v) => setTab(v as "points" | "referrals")}
            >
              <TabsList className="h-9 bg-secondary">
                <TabsTrigger value="points" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  By Points
                </TabsTrigger>
                <TabsTrigger value="referrals" className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  By Referrals
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-secondary/50 pl-9 font-mono text-xs border-border/50"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="mb-2 grid grid-cols-[60px_1fr_100px_120px] items-center px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Rank</span>
          <span>Address</span>
          <span className="text-right">Referrals</span>
          <span className="text-right">Total Points</span>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-1">
          {filtered.map((entry, i) => {
            const isUser = address && entry.address === address
            const medal = entry.rank <= 3 ? MEDALS[entry.rank] : null
            return (
              <div
                key={entry.address}
                className={cn(
                  "grid grid-cols-[60px_1fr_100px_120px] items-center rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isUser
                    ? "border border-primary/30 bg-primary/5"
                    : "hover:bg-secondary/50",
                  i === 0 && "animate-in fade-in"
                )}
              >
                <span className="font-mono text-muted-foreground">
                  {medal ? (
                    <span className="text-base">{medal}</span>
                  ) : (
                    <span className="pl-0.5">{entry.rank}</span>
                  )}
                </span>
                <span className="flex items-center gap-2 font-mono text-xs text-foreground">
                  {truncateAddress(entry.address)}
                  {isUser && (
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                      You
                    </span>
                  )}
                </span>
                <span className="text-right text-muted-foreground">
                  {entry.referrals}
                </span>
                <span className="text-right font-semibold text-foreground">
                  {formatCompactNumber(entry.totalPoints)}
                </span>
              </div>
            )
          })}

          {/* User row (shown separately if not in top 20) */}
          {userRow && !filtered.find((e) => e.address === address) && (
            <>
              <div className="flex items-center gap-2 px-3 py-1">
                <div className="flex-1 border-b border-dashed border-border/50" />
                <span className="text-[10px] text-muted-foreground">your position</span>
                <div className="flex-1 border-b border-dashed border-border/50" />
              </div>
              <div className="grid grid-cols-[60px_1fr_100px_120px] items-center rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
                <span className="font-mono text-muted-foreground">{userRow.rank}</span>
                <span className="flex items-center gap-2 font-mono text-xs text-foreground">
                  {truncateAddress(userRow.address)}
                  <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-primary">
                    You
                  </span>
                </span>
                <span className="text-right text-muted-foreground">
                  {userRow.referrals}
                </span>
                <span className="text-right font-semibold text-foreground">
                  {formatNumber(userRow.totalPoints)}
                </span>
              </div>
            </>
          )}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No results found for that address.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
