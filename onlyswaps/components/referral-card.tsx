"use client"

import { Copy, Share2, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useWallet, truncateAddress } from "@/lib/wallet-context"
import { MOCK_REFERRALS, formatNumber } from "@/lib/mock-data"

const STEPS = [
  { step: 1, text: "Share your link" },
  { step: 2, text: "Friends swap using it" },
  { step: 3, text: "You both earn 10% bonus" },
  { step: 4, text: "Forever on all their swaps" },
]

export function ReferralCard() {
  const { address } = useWallet()
  const referralLink = `onlyswaps.app?ref=${address ? truncateAddress(address) : "..."}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://${referralLink}`)
    toast.success("Referral link copied!")
  }

  const shareOnX = () => {
    const text = encodeURIComponent(
      `I'm earning exclusive rewards on every swap with @OnlySwaps! Use my link to get 10% bonus: https://${referralLink}`
    )
    window.open(`https://x.com/intent/tweet?text=${text}`, "_blank")
  }

  const shareOnTelegram = () => {
    const url = encodeURIComponent(`https://${referralLink}`)
    const text = encodeURIComponent("Earn exclusive rewards on every swap with OnlySwaps!")
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank")
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Invite friends, earn forever!
        </p>

        {/* Referral Link */}
        <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/50 p-3">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">
            {referralLink}
          </code>
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            aria-label="Copy referral link"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shareOnX}
            className="flex-1 gap-2 border-border/60 bg-secondary hover:bg-secondary/80 text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share on X
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareOnTelegram}
            className="flex-1 gap-2 border-border/60 bg-secondary hover:bg-secondary/80 text-foreground"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Telegram
          </Button>
        </div>

        <Separator className="bg-border/50" />

        {/* How it works */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            How it works
          </h4>
          <div className="flex flex-col gap-2.5">
            {STEPS.map((step) => (
              <div key={step.step} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {step.step}
                </span>
                <span className="text-sm text-muted-foreground">{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* Your Referrals */}
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Your Referrals ({MOCK_REFERRALS.length})
          </h4>
          <div className="flex flex-col gap-2">
            {MOCK_REFERRALS.map((ref) => (
              <div
                key={ref.address}
                className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {truncateAddress(ref.address)}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {formatNumber(ref.pointsEarned)} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
