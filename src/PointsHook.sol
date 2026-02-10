// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseHook} from "uniswap-hooks/base/BaseHook.sol";
import {ERC1155} from "solmate/src/tokens/ERC1155.sol";

import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {PoolId} from "v4-core/types/PoolId.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";

import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {SwapParams} from "v4-core/types/PoolOperation.sol";

contract PointsHook is BaseHook, ERC1155 {
    using CurrencyLibrary for Currency;
    constructor(IPoolManager _manager) BaseHook(_manager) {}

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: false,
                beforeAddLiquidity: false,
                beforeRemoveLiquidity: false,
                afterAddLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: false,
                afterSwap: true,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }

    function uri(uint256) public pure override returns (string memory) {
        return "https://api.example.com/token/{id}";
    }

    // Helper function to mint points to users
function _assignPoints(
    PoolId poolId,
    bytes calldata hookData,
    uint256 points
) internal {
    // If no hookData is passed in, no points assigned
    if (hookData.length == 0) return;
    
    // Extract user address from hookData
    address user = abi.decode(hookData, (address));
    
    // If user address is zero, nobody gets points
    if (user == address(0)) return;
    
    // Mint points to the user (ERC1155)
    uint256 poolIdUint = uint256(PoolId.unwrap(poolId));
    _mint(user, poolIdUint, points, "");
}    
    
function _afterSwap(
    address,                              // sender (who made the swap)
    PoolKey calldata key,                 // pool info
    SwapParams calldata swapParams,       // swap parameters
    BalanceDelta delta,                   // IMPORTANT: how much was exchanged
    bytes calldata hookData               // custom data (hookData)
) internal override returns (bytes4, int128) {
    // Only work with ETH-TOKEN pools (currency0 must be ETH)
    if (!key.currency0.isAddressZero()) return (this.afterSwap.selector, 0);
    
    // Only mint points when buying TOKEN with ETH (zeroForOne = true)
    if (!swapParams.zeroForOne) return (this.afterSwap.selector, 0);
    
    // Calculate ETH spent (always negative for user in delta.amount0)
    uint256 ethSpendAmount = uint256(int256(-delta.amount0()));
    
    // Mint points = 20% of ETH spent
    uint256 pointsForSwap = ethSpendAmount / 5;
    
    // Assign points to user
    _assignPoints(key.toId(), hookData, pointsForSwap);
    
    return (this.afterSwap.selector, 0);
}
}