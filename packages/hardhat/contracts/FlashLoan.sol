//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// import "hardhat/console.sol";
import {IVault} from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import {IFlashLoanRecipient} from "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";
import {IERC20} from "@balancer-labs/v2-interfaces/contracts/solidity-utils/openzeppelin/IERC20.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract FlashLoanRecipient is IFlashLoanRecipient {
    address public owner = msg.sender;

    IVault private constant vault = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

    // Deployments are on Base Mainnet

    IUniswapV2Router02 private constant swapRouter = IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24); 
    IUniswapV2Router02 private constant uniswapRouter = IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24); 
    IUniswapV2Router02 private constant sushiswapRouter = IUniswapV2Router02(0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891);
    IUniswapV2Router02 private constant pancakeswapRouter = IUniswapV2Router02(0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb); 

    // add other routers

    function makeFlashLoan( IERC20[] memory tokens, uint256[] memory amounts, bytes memory userData ) external {
        vault.flashLoan(this, tokens, amounts, userData);
    }

    function receiveFlashLoan(IERC20[] memory tokens, uint256[] memory amounts, uint256[] memory feeAmounts, bytes memory userData) external override {
        require(msg.sender == address(vault));

        // IERC20(tokens[0]).transferFrom(msg.) // This contract now has the funds requested.
        // Your logic goes here... // At the end of your logic above, this contract owes the flashloaned amounts + feeAmounts.Therefore ensure your contract has enough to repay these amounts.
        
        // Return loan
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i].transfer(address(vault), amounts[i] + feeAmounts[i]);
        }
    }

    function uniswapTokens( address _tokenOut, uint256 _amountOutMin ) external {
        // require(msg.sender == owner, "Only the owner can initiate swaps");

        // Ensure that your contract has received the required tokenIn amount.
        // require(
        //     IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn),
        //     "Transfer of tokenIn failed"
        // );

        uint _amountIn = 1000000000000000000; // 1 DIA Tokens  // equivalent 39800000000000 WETH
        address _tokenIn = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb; // DIA Token Address

        IERC20(_tokenIn).approve(address(uniswapRouter), _amountIn);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uniswapRouter.swapExactTokensForTokens( _amountIn, _amountOutMin, path, address(this), block.timestamp);
        // You can now do something with the swapped tokens.
    }

    function sushiswapTokens( address _tokenIn, uint256 _amountIn ) external {
        // require(msg.sender == owner, "Only the owner can initiate swaps");

        // Ensure that your contract has received the required tokenIn amount.
        // require(
        //     IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn),
        //     "Transfer of tokenIn failed"
        // );

        uint _amountOutMin = 1000000000000000000; // 1 DIA Tokens  // equivalent 39800000000000 WETH
        address _tokenOut = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb; // DIA Token Address

        IERC20(_tokenIn).approve(address(sushiswapRouter), _amountIn);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        sushiswapRouter.swapExactTokensForTokens( _amountIn, _amountOutMin, path, address(this), block.timestamp);
        // You can now do something with the swapped tokens.
    }

    function pancakeswapTokens( address _tokenOut, uint256 _amountOutMin ) external {
        // require(msg.sender == owner, "Only the owner can initiate swaps");

        // Ensure that your contract has received the required tokenIn amount.
        // require(
        //     IERC20(_tokenIn).transferFrom(msg.sender, address(this), _amountIn),
        //     "Transfer of tokenIn failed"
        // );

        uint _amountIn = 1000000000000000000; // 1 DIA Tokens  // equivalent 39800000000000 WETH
        address _tokenIn = 0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb; // DIA Token Address

        IERC20(_tokenIn).approve(address(pancakeswapRouter), _amountIn);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        pancakeswapRouter.swapExactTokensForTokens( _amountIn, _amountOutMin, path, address(this), block.timestamp);
        // You can now do something with the swapped tokens.
    }

    function hello() public pure returns (string memory) {
        return string("Thank you so much");
    }

    // function withdraw(params) {
    //     code
    // }

      // require(data.length >= 20, "Input data is less than 20 bytes");

        // // Create a new bytes array to store the first 20 bytes
        // bytes memory first20Bytes = new bytes(20);

        // for (uint i = 0; i < 20; i++) {
        //     first20Bytes[i] = data[i];
        // }

        // To determine the First exchange where 
        // 0x01 -> uniswap
        // 0x02 -> sushiswap
        // 0x03 -> pancakeswap

        // To determine the Second exchange where 
        // 0x0101 -> uniswap
        // 0x0202 -> sushiswap
        // 0x0303 -> pancakeswap

        // 0x01024200000000000000000000000000000000000006 -> Next 20 bytes/40 Hex characters is token out address 

        // 0x01024200000000000000000000000000000000000006 Till here 22 bytes will be over

        // Now from 23 bytes upto data.length   
        
        // 0x0102420000000000000000000000000000000000000613 -> 1st conversion rate length

        // 0x010242000000000000000000000000000000000000061314 -> 2nd conversion rate length

        // 0x0102420000000000000000000000000000000000000613143250000000 -> 1st conversion rate

        // 0x01024200000000000000000000000000000000000006131432500000004567900000000000000000 -> 2nd conversion rate

        // uint diff = data.length - 22;

        // bytes memory tokenAmountOut = new bytes(diff);
}
