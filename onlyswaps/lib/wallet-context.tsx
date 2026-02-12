"use client"

import { useAccount } from "wagmi"

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()

  return {
    address: address ?? null,
    isConnected,
    isConnecting,
  }
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
