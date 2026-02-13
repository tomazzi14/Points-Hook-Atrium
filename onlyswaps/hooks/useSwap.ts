import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { parseEther, encodeAbiParameters, parseAbiParameters } from 'viem'
import {
  contracts,
  POOL_KEY,
  MIN_SQRT_PRICE_LIMIT,
  MAX_SQRT_PRICE_LIMIT,
} from '@/lib/config/contracts'

export function useSwap() {
  const { address } = useAccount()
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const swap = (ethAmount: string, referrer?: string) => {
    if (!address) return

    const amountWei = parseEther(ethAmount)

    // hookData = abi.encode(address user, address referrer)
    const hookData = encodeAbiParameters(
      parseAbiParameters('address, address'),
      [address, (referrer as `0x${string}`) || '0x0000000000000000000000000000000000000000']
    )

    writeContract({
      ...contracts.swapRouter,
      functionName: 'swap',
      args: [
        // PoolKey
        {
          currency0: POOL_KEY.currency0,
          currency1: POOL_KEY.currency1,
          fee: POOL_KEY.fee,
          tickSpacing: POOL_KEY.tickSpacing,
          hooks: POOL_KEY.hooks,
        },
        // SwapParams (exact input ETH → TOKEN)
        {
          zeroForOne: true,
          amountSpecified: -amountWei, // negative = exact input
          sqrtPriceLimitX96: MIN_SQRT_PRICE_LIMIT,
        },
        // TestSettings
        {
          takeClaims: false,
          settleUsingBurn: false,
        },
        // hookData
        hookData,
      ],
      value: amountWei,
    })
  }

  return {
    swap,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}
