export const MOCK_USER_STATS = {
  pointsBalance: 12450,
  referralCount: 3,
  globalRank: 47,
  totalUsers: 1234,
  totalEarnedEth: 0.05,
}

export const MOCK_REFERRALS = [
  { address: "0x1234567890abcdef1234567890abcdef12345678", pointsEarned: 1200 },
  { address: "0xabcdef1234567890abcdef1234567890abcdef12", pointsEarned: 800 },
  { address: "0x7890abcdef1234567890abcdef1234567890abcd", pointsEarned: 400 },
]

export const MOCK_LEADERBOARD = [
  { rank: 1, address: "0xabc123def456789012345678901234567890abcd", referrals: 127, totalPoints: 2450000 },
  { rank: 2, address: "0x123456abcdef7890123456789012345678901234", referrals: 98, totalPoints: 1980000 },
  { rank: 3, address: "0x789abcdef012345678901234567890123456789a", referrals: 87, totalPoints: 1750000 },
  { rank: 4, address: "0xdef789012345678901234567890abcdef01234567", referrals: 56, totalPoints: 1120000 },
  { rank: 5, address: "0xghi012345678901234567890abcdef0123456789a", referrals: 43, totalPoints: 860000 },
  { rank: 6, address: "0x456789abcdef012345678901234567890abcdef01", referrals: 38, totalPoints: 760000 },
  { rank: 7, address: "0x012345678901234567890abcdef0123456789abcd", referrals: 32, totalPoints: 640000 },
  { rank: 8, address: "0xfedcba9876543210fedcba9876543210fedcba98", referrals: 28, totalPoints: 560000 },
  { rank: 9, address: "0x9876543210fedcba9876543210fedcba98765432", referrals: 25, totalPoints: 500000 },
  { rank: 10, address: "0x3210fedcba9876543210fedcba987654321fedcb", referrals: 22, totalPoints: 440000 },
  { rank: 11, address: "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2", referrals: 19, totalPoints: 380000 },
  { rank: 12, address: "0xf6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5", referrals: 17, totalPoints: 340000 },
  { rank: 13, address: "0x1a2b3c4d5e6f1a2b3c4d5e6f1a2b3c4d5e6f1a2b", referrals: 15, totalPoints: 300000 },
  { rank: 14, address: "0x6f5e4d3c2b1a6f5e4d3c2b1a6f5e4d3c2b1a6f5e", referrals: 13, totalPoints: 260000 },
  { rank: 15, address: "0xaa11bb22cc33dd44ee55ff66aa11bb22cc33dd44", referrals: 11, totalPoints: 220000 },
  { rank: 16, address: "0xbb22cc33dd44ee55ff66aa11bb22cc33dd44ee55", referrals: 10, totalPoints: 200000 },
  { rank: 17, address: "0xcc33dd44ee55ff66aa11bb22cc33dd44ee55ff66", referrals: 9, totalPoints: 180000 },
  { rank: 18, address: "0xdd44ee55ff66aa11bb22cc33dd44ee55ff66aa11", referrals: 8, totalPoints: 160000 },
  { rank: 19, address: "0xee55ff66aa11bb22cc33dd44ee55ff66aa11bb22", referrals: 7, totalPoints: 140000 },
  { rank: 20, address: "0xff66aa11bb22cc33dd44ee55ff66aa11bb22cc33", referrals: 6, totalPoints: 120000 },
]

export const ETH_PRICE_USD = 3200
export const POINTS_PER_SWAP_PCT = 0.2
export const REFERRAL_BONUS_PCT = 0.1

export function calculatePoints(ethAmount: number) {
  const basePoints = Math.floor(ethAmount * POINTS_PER_SWAP_PCT * ETH_PRICE_USD)
  return basePoints
}

export function calculateReferralBonus(basePoints: number) {
  return Math.floor(basePoints * REFERRAL_BONUS_PCT)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}

export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`
  return num.toString()
}
