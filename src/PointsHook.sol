// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {BaseHook} from "uniswap-hooks/base/BaseHook.sol";
import {ERC1155} from "solmate/src/tokens/ERC1155.sol";

import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";
import {PoolId} from "v4-core/types/PoolId.sol";
import {BalanceDelta} from "v4-core/types/BalanceDelta.sol";
import {SwapParams} from "v4-core/types/PoolOperation.sol";

import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";

contract PointsHook is BaseHook, ERC1155 {
    using CurrencyLibrary for Currency;
    
    // REFERRAL SYSTEM
    // Track who referred each user (one referrer per user)
    mapping(address => address) public referredBy;
    // Track how many people each address has referred
    mapping(address => uint256) public referralCount;
    
    // CONSTANTS
    // Referral bonus percentage (10 = 10%)
    uint256 public constant REFERRAL_BONUS = 10;
    
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
                afterSwap: true,           // We only use afterSwap
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
    
 function _assignPoints(
    PoolId poolId,
    bytes calldata hookData,
    uint256 points
) internal {
    if (hookData.length == 0) return;
    
    (address user, address referrer) = abi.decode(hookData, (address, address));
    
    if (user == address(0)) return;
    
    uint256 poolIdUint = uint256(PoolId.unwrap(poolId));
    uint256 userPoints = points;
    
    // REFERRAL LOGIC
    if (referrer != address(0) && referrer != user) {
        // If user has no referrer yet, set this one
        if (referredBy[user] == address(0)) {
            referredBy[user] = referrer;
            referralCount[referrer]++;
        }
    }
    
    // Always give bonus to the SAVED referrer (ignore new ones)
    if (referredBy[user] != address(0)) {
        address savedReferrer = referredBy[user];
        uint256 bonus = (points * REFERRAL_BONUS) / 100;
        
        userPoints = points + bonus;
        _mint(savedReferrer, poolIdUint, bonus, "");
    }
    
    _mint(user, poolIdUint, userPoints, "");
}
    
    /// notice Hook function that runs AFTER every swap
    /// param key Pool information (tokens, fee, hooks address)
    /// param swapParams Swap direction and amount
    /// param delta How much of each token was exchanged
    /// param hookData Custom data passed by user
    /// return selector Function selector (must return this for success)
    /// return 0 No delta changes
    function _afterSwap(
        address,                              // sender (who made the swap)
        PoolKey calldata key,                 // pool info
        SwapParams calldata swapParams,       // swap parameters
        BalanceDelta delta,                   // how much was exchanged
        bytes calldata hookData               // custom data (user + referrer)
    ) internal override returns (bytes4, int128) {
        // RULE 1: Only work with ETH-TOKEN pools
        // currency0 must be native ETH (address zero)
        if (!key.currency0.isAddressZero()) return (this.afterSwap.selector, 0);
        
        // RULE 2: Only give points when buying TOKEN with ETH
        // zeroForOne = true means swapping currency0 (ETH) for currency1 (TOKEN)
        if (!swapParams.zeroForOne) return (this.afterSwap.selector, 0);
        
        // Calculate how much ETH user spent
        // delta.amount0() is negative (ETH going out from user)
        // We convert to positive uint256
        uint256 ethSpendAmount = uint256(int256(-delta.amount0()));
        
        // Calculate points: 20% of ETH spent
        // Dividing by 5 gives us 20% (1/5 = 0.2 = 20%)
        uint256 pointsForSwap = ethSpendAmount / 5;
        
        // Mint points to user (with referral logic)
        _assignPoints(key.toId(), hookData, pointsForSwap);
        
        // Return success
        return (this.afterSwap.selector, 0);
    }
}