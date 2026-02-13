import { useBalance, useAccount } from 'wagmi'

export function useEthBalance() {
  const { address } = useAccount()

  return useBalance({
    address,
    query: {
      enabled: !!address,
    },
  })
}
