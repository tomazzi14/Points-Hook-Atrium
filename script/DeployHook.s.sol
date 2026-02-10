// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Script.sol";
import {PointsHook} from "../src/PointsHook.sol";
import {IPoolManager} from "v4-core/interfaces/IPoolManager.sol";
import {Hooks} from "v4-core/libraries/Hooks.sol";
import {HookMiner} from "../../lib/uniswap-hooks/lib/v4-periphery/src/utils/HookMiner.sol";

contract DeployHook is Script {
    // CREATE2 Deployer (same on all chains)
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;
    
    // Sepolia PoolManager - VERIFY THIS ADDRESS
    address constant POOL_MANAGER = 0x8C4BcBE6b9eF47855f97E675296FA3F6fafa5F1A;
    
    function run() external {
        // Specify which hook functions we use (only afterSwap)
        uint160 flags = uint160(Hooks.AFTER_SWAP_FLAG);
        
        // Encode constructor args
        bytes memory constructorArgs = abi.encode(POOL_MANAGER);
        
        console.log("Mining address for hook...");
        
        // Mine for valid address
        (address hookAddress, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER,
            flags,
            type(PointsHook).creationCode,
            constructorArgs
        );
        
        console.log("Hook will be deployed to:", hookAddress);
        console.log("Salt:", vm.toString(salt));
        
        // Deploy with mined salt
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(privateKey);
        
        PointsHook hook = new PointsHook{salt: salt}(IPoolManager(POOL_MANAGER));
        require(address(hook) == hookAddress, "Hook address mismatch");
        
        console.log("Hook deployed successfully!");
        
        vm.stopBroadcast();
    }
}