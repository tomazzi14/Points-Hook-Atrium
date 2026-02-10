// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Deployers} from "@uniswap/v4-core/test/utils/Deployers.sol";
import {PoolSwapTest} from "v4-core/test/PoolSwapTest.sol";
import {MockERC20} from "solmate/src/test/utils/mocks/MockERC20.sol";

import {PoolManager} from "v4-core/PoolManager.sol";
import {SwapParams, ModifyLiquidityParams} from "v4-core/types/PoolOperation.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";

import {Currency, CurrencyLibrary} from "v4-core/types/Currency.sol";
import {PoolId, PoolIdLibrary} from "v4-core/types/PoolId.sol";
import {PoolKey} from "v4-core/types/PoolKey.sol";

import {Hooks} from "v4-core/libraries/Hooks.sol";
import {TickMath} from "v4-core/libraries/TickMath.sol";
import {LiquidityAmounts} from "@uniswap/v4-core/test/utils/LiquidityAmounts.sol";

import {ERC1155TokenReceiver} from "solmate/src/tokens/ERC1155.sol";

import "forge-std/console.sol";
import {PointsHook} from "../src/PointsHook.sol";

contract TestPointsHook is Test, Deployers, ERC1155TokenReceiver {
    using PoolIdLibrary for PoolKey;
    
    MockERC20 token;  // Our TOKEN for the ETH-TOKEN pool
    
    // Native ETH is represented by address(0)
    Currency ethCurrency = Currency.wrap(address(0));
    Currency tokenCurrency;
    
    PointsHook hook;
    
    function setUp() public {
    // Step 1 + 2: Deploy PoolManager and Router contracts
    deployFreshManagerAndRouters();
    
    // Step 3: Deploy our TOKEN contract
    token = new MockERC20("Test Token", "TEST", 18);
    tokenCurrency = Currency.wrap(address(token));
    
    // Step 4: Mint TOKEN to ourselves and to address(1)
    token.mint(address(this), 1000 ether);
    token.mint(address(1), 1000 ether);
    
    // Step 5: Mine hook address with correct flags
    uint160 flags = uint160(Hooks.AFTER_SWAP_FLAG);
    
    // Step 6: Deploy hook to that address
    deployCodeTo("PointsHook.sol", abi.encode(manager), address(flags));
    hook = PointsHook(address(flags));
    
    // Step 7: Approve TOKEN for routers
    token.approve(address(swapRouter), type(uint256).max);
    token.approve(address(modifyLiquidityRouter), type(uint256).max);
    
    // Step 8: Initialize pool (ETH-TOKEN with our hook)
    (key, ) = initPool(
        ethCurrency,      // Currency 0 = ETH
        tokenCurrency,    // Currency 1 = TOKEN
        hook,             // Hook Contract
        3000,             // Swap Fee (0.3%)
        SQRT_PRICE_1_1    // Initial price = 1:1
    );
    
    // Step 9: Add liquidity to pool
    // Calculate amounts needed for liquidity
    uint160 sqrtPriceAtTickLower = TickMath.getSqrtPriceAtTick(-60);
    uint160 sqrtPriceAtTickUpper = TickMath.getSqrtPriceAtTick(60);
    
    uint256 ethToAdd = 10 ether;
    uint128 liquidityDelta = LiquidityAmounts.getLiquidityForAmount0(
        SQRT_PRICE_1_1,
        sqrtPriceAtTickUpper,
        ethToAdd
    );
    uint256 tokenToAdd = LiquidityAmounts.getAmount1ForLiquidity(
        sqrtPriceAtTickLower,
        SQRT_PRICE_1_1,
        liquidityDelta
    );
    
    // Actually add the liquidity
    modifyLiquidityRouter.modifyLiquidity{value: ethToAdd}(
        key,
        ModifyLiquidityParams({
            tickLower: -60,
            tickUpper: 60,
            liquidityDelta: int256(uint256(liquidityDelta)),
            salt: bytes32(0)
        }),
        ZERO_BYTES
    );
}
    
    function test_swap() public {
    // Get the pool ID as uint256 for ERC1155 token ID
    uint256 poolIdUint = uint256(PoolId.unwrap(key.toId()));
    
    // Check original points balance (should be 0)
    uint256 pointsBalanceOriginal = hook.balanceOf(address(this), poolIdUint);
    
    // Encode hookData: (user address, referrer address)
    // No referrer = address(0)
    bytes memory hookData = abi.encode(address(this), address(0));
    
    // Execute swap: 0.001 ETH for TOKEN
    // Should get 20% of 0.001 ETH = 0.0002 ETH worth of points
    // = 2 * 10**14 wei
    swapRouter.swap{value: 0.001 ether}(
        key,
        SwapParams({
            zeroForOne: true,                        // ETH → TOKEN
            amountSpecified: -0.001 ether,           // Exact input (negative)
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        }),
        PoolSwapTest.TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        }),
        hookData
    );
    
    // Check points balance after swap
    uint256 pointsBalanceAfterSwap = hook.balanceOf(address(this), poolIdUint);
    
    // Assert we got exactly 20% points
    assertEq(pointsBalanceAfterSwap - pointsBalanceOriginal, 2 * 10 ** 14);
}

    function test_referralBonus() public {
    uint256 poolIdUint = uint256(PoolId.unwrap(key.toId()));
    
    address user = address(0x1234);
    address referrer = address(0x5678);
    
    // Give user some ETH for swap
    vm.deal(user, 1 ether);
    
    // Encode hookData with referrer
    bytes memory hookData = abi.encode(user, referrer);
    
    // User swaps 0.001 ETH
    vm.prank(user);
    swapRouter.swap{value: 0.001 ether}(
        key,
        SwapParams({
            zeroForOne: true,
            amountSpecified: -0.001 ether,
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        }),
        PoolSwapTest.TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        }),
        hookData
    );
    
    // Base points = 20% of 0.001 ETH = 2 * 10**14
    uint256 basePoints = 2 * 10 ** 14;
    uint256 bonus = (basePoints * 10) / 100; // 10% bonus
    
    // User should have base + bonus
    assertEq(hook.balanceOf(user, poolIdUint), basePoints + bonus);
    
    // Referrer should have bonus
    assertEq(hook.balanceOf(referrer, poolIdUint), bonus);
}

// FUZZ TEST: Random ETH amounts always give 20% points
function testFuzz_PointsAre20Percent(uint256 ethAmount) public {
    
    // Bound ethAmount between 0.001 ETH and 1 ETH (no 0.0001)
    ethAmount = bound(ethAmount, 0.001 ether, 1 ether);
    
    uint256 poolIdUint = uint256(PoolId.unwrap(key.toId()));
    bytes memory hookData = abi.encode(address(this), address(0));
    
    // Give ourselves enough ETH
    vm.deal(address(this), ethAmount);
    
    uint256 pointsBefore = hook.balanceOf(address(this), poolIdUint);
    
    // Swap random amount of ETH
    swapRouter.swap{value: ethAmount}(
        key,
        SwapParams({
            zeroForOne: true,
            amountSpecified: -int256(ethAmount),
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        }),
        PoolSwapTest.TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        }),
        hookData
    );
    
    uint256 pointsAfter = hook.balanceOf(address(this), poolIdUint);
    uint256 pointsReceived = pointsAfter - pointsBefore;
    
    // Should always be 20% (divide by 5)
    assertEq(pointsReceived, ethAmount / 5);
}

// TEST: First referrer wins, second referrer is ignored
function test_onlyFirstReferrerCounts() public {
    uint256 poolIdUint = uint256(PoolId.unwrap(key.toId()));
    
    address user = address(0xABCD);
    address referrer1 = address(0x1111);
    address referrer2 = address(0x2222);
    
    vm.deal(user, 2 ether);
    
    // First swap with referrer1
    bytes memory hookData1 = abi.encode(user, referrer1);
    
    vm.prank(user);
    swapRouter.swap{value: 0.001 ether}(
        key,
        SwapParams({
            zeroForOne: true,
            amountSpecified: -0.001 ether,
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        }),
        PoolSwapTest.TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        }),
        hookData1
    );
    
    // Check referrer1 got bonus
    uint256 basePoints = 2 * 10 ** 14;
    uint256 bonus = (basePoints * 10) / 100;
    assertEq(hook.balanceOf(referrer1, poolIdUint), bonus);
    
    // Second swap with different referrer2
    bytes memory hookData2 = abi.encode(user, referrer2);
    
    vm.prank(user);
    swapRouter.swap{value: 0.001 ether}(
        key,
        SwapParams({
            zeroForOne: true,
            amountSpecified: -0.001 ether,
            sqrtPriceLimitX96: TickMath.MIN_SQRT_PRICE + 1
        }),
        PoolSwapTest.TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        }),
        hookData2
    );
    
    // referrer1 should have bonus from BOTH swaps (still the referrer)
    assertEq(hook.balanceOf(referrer1, poolIdUint), bonus * 2);
    
    // referrer2 should have NOTHING (ignored)
    assertEq(hook.balanceOf(referrer2, poolIdUint), 0);
    
    // Check referredBy mapping
    assertEq(hook.referredBy(user), referrer1);
    assertEq(hook.referralCount(referrer1), 1);
    assertEq(hook.referralCount(referrer2), 0);
}

}