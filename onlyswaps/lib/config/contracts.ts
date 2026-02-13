import PointsHookABI from '../abis/PointsHook.json'

// Addresses deployadas en Sepolia
export const POINTS_HOOK_ADDRESS = '0xDa51ba4E764f6B1524aA8e89F91C30bC6Abb4040' as const
export const POOL_MANAGER_ADDRESS = '0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A' as const

// PoolSwapTest deployado en Sepolia (targeting correct PoolManager 0x8C4B...)
export const SWAP_ROUTER_ADDRESS = '0xF284251509ebcb1AFc111e27dF889703815AeE39' as const

// MockERC20 "OnlySwaps Test Token" (TEST) deployado en Sepolia
export const TEST_TOKEN_ADDRESS = '0xEd9473357C80ED4cBdc260dCC99Cc8F5E1De79Bd' as const

// ABI minimo de PoolSwapTest.swap()
export const POOL_SWAP_TEST_ABI = [
  {
    type: 'function',
    name: 'swap',
    inputs: [
      {
        name: 'key',
        type: 'tuple',
        components: [
          { name: 'currency0', type: 'address' },
          { name: 'currency1', type: 'address' },
          { name: 'fee', type: 'uint24' },
          { name: 'tickSpacing', type: 'int24' },
          { name: 'hooks', type: 'address' },
        ],
      },
      {
        name: 'params',
        type: 'tuple',
        components: [
          { name: 'zeroForOne', type: 'bool' },
          { name: 'amountSpecified', type: 'int256' },
          { name: 'sqrtPriceLimitX96', type: 'uint160' },
        ],
      },
      {
        name: 'testSettings',
        type: 'tuple',
        components: [
          { name: 'takeClaims', type: 'bool' },
          { name: 'settleUsingBurn', type: 'bool' },
        ],
      },
      { name: 'hookData', type: 'bytes' },
    ],
    outputs: [
      { name: 'delta', type: 'int256' },
    ],
    stateMutability: 'payable',
  },
] as const

export const contracts = {
  pointsHook: {
    address: POINTS_HOOK_ADDRESS,
    abi: PointsHookABI.abi,
  },
  swapRouter: {
    address: SWAP_ROUTER_ADDRESS,
    abi: POOL_SWAP_TEST_ABI,
  },
} as const

// Pool ID from the Initialize event on Sepolia
export const POOL_ID = BigInt('0x0c18f6f003b3e96312e00e41da45ab0a4a844d6c9d7581f0d4a2807fabdef877')

// PoolKey para el pool ETH-TEST con nuestro hook
export const POOL_KEY = {
  currency0: '0x0000000000000000000000000000000000000000' as const, // ETH nativo
  currency1: TEST_TOKEN_ADDRESS,       // Token ERC20
  fee: 3000,                           // 0.3%
  tickSpacing: 60,                     // Standard para 0.3%
  hooks: POINTS_HOOK_ADDRESS,          // Nuestro hook
} as const

// MIN_SQRT_PRICE + 1 (para swaps zeroForOne)
export const MIN_SQRT_PRICE_LIMIT = BigInt('4295128740')
// MAX_SQRT_PRICE - 1 (para swaps oneForZero)
export const MAX_SQRT_PRICE_LIMIT = BigInt('1461446703485210103287273052203988822378723970341')
