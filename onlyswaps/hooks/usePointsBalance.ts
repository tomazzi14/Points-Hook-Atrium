import { useReadContract, useAccount } from 'wagmi'
import { contracts, POOL_ID } from '@/lib/config/contracts'

export function usePointsBalance() {
  const { address } = useAccount()

  return useReadContract({
    ...contracts.pointsHook,
    functionName: 'balanceOf',
    args: address ? [address, POOL_ID] : undefined,
    query: {
      enabled: !!address,
    },
  })
}
