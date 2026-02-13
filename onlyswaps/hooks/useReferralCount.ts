import { useReadContract, useAccount } from 'wagmi'
import { contracts } from '@/lib/config/contracts'

export function useReferralCount() {
  const { address } = useAccount()

  return useReadContract({
    ...contracts.pointsHook,
    functionName: 'referralCount',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}
