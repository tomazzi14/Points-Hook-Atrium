import PointsHookABI from '../abis/PointsHook.json'

// Addresses deployadas en Sepolia
export const POINTS_HOOK_ADDRESS = '0xDa51ba4E764f6B1524aA8e89F91C30bC6Abb4040' as const
export const POOL_MANAGER_ADDRESS = '0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A' as const

// TODO: Necesitamos estos para hacer swaps
export const SWAP_ROUTER_ADDRESS = '0x...' as const // TBD
export const TEST_TOKEN_ADDRESS = '0x...' as const  // TBD
export const WETH_ADDRESS = '0x...' as const        // TBD

export const contracts = {
  pointsHook: {
    address: POINTS_HOOK_ADDRESS,
    abi: PointsHookABI.abi,
  },
} as const

// Pool ID - TODO: Calcular esto desde PoolKey
export const POOL_ID = 0n