"use client"

import { Header } from "@/components/header"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { MobileNav } from "@/components/mobile-nav"

export default function LeaderboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8 lg:px-6">
          <LeaderboardTable />
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
