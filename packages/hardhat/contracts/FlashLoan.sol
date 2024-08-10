// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IVault} from "@balancer-labs/v2-interfaces/contracts/vault/IVault.sol";
import {IFlashLoanRecipient} from "@balancer-labs/v2-interfaces/contracts/vault/IFlashLoanRecipient.sol";
import {IERC20} from "@balancer-labs/v2-interfaces/contracts/solidity-utils/openzeppelin/IERC20.sol";
import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract FlashLoanRecipient is IFlashLoanRecipient {
    address public owner = msg.sender;

    IVault private constant vault = IVault(0xBA12222222228d8Ba445958a75a0704d566BF2C8);

    address private constant wethToken = 0x4200000000000000000000000000000000000006;
    uint256 private constant wethInput = 1000000000000000000; // 1 WETH Token

    // Deployments are on Base Mainnet

    IUniswapV2Router02 private constant uniswapRouter = IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24);
    IUniswapV2Router02 private constant sushiswapRouter = IUniswapV2Router02(0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891);
    IUniswapV2Router02 private constant pancakeswapRouter = IUniswapV2Router02(0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb);

    // add other routers

    function uniswapTokens( address _tokenIn, uint256 _amountIn, address _tokenOut, uint256 _amountOutMin ) public returns (uint256) {
        // require(msg.sender == owner, "Only the owner can initiate swaps");
        IERC20(_tokenIn).approve(address(uniswapRouter), _amountIn);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint256[] memory prices = uniswapRouter.swapExactTokensForTokens( _amountIn, _amountOutMin, path, address(this), block.timestamp );
        return prices[1];
    }

    function sushiswapTokens( address _tokenIn, uint256 _amountIn, address _tokenOut, uint256 _amountOutMin ) public returns (uint256) {
        // require(msg.sender == owner, "Only the owner can initiate swaps");
        IERC20(_tokenIn).approve(address(sushiswapRouter), _amountIn);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint256[] memory prices = sushiswapRouter.swapExactTokensForTokens( _amountIn, _amountOutMin, path, address(this), block.timestamp );
        return prices[1];
    }

    function pancakeswapTokens( address _tokenIn, uint256 _amountIn, address _tokenOut, uint256 _amountOutMin ) public returns (uint256) {
        // require(msg.sender == owner, "Only the owner can initiate swaps");
        IERC20(_tokenIn).approve(address(pancakeswapRouter), _amountIn);

        address[] memory path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;

        uint256[] memory prices = pancakeswapRouter.swapExactTokensForTokens( _amountIn, _amountOutMin, path, address(this), block.timestamp );
        return prices[1];
    }

    function hello() public pure returns (string memory) {
        return string("Your Contract is deployed successfully, connect it to the bot");
    }

    function makeFlashLoan( IERC20[] memory tokens, uint256[] memory amounts, bytes memory userData) external {
        vault.flashLoan(this, tokens, amounts, userData);
    }

    function receiveFlashLoan( IERC20[] memory tokens, uint256[] memory amounts, uint256[] memory feeAmounts, bytes memory userData ) external override {
        require(msg.sender == address(vault));
        // This contract now has the funds requested.

        swap(userData);

        // This contract now owes the flashloaned amounts + feeAmounts. Ensure the contract has enough to repay these amounts.

        // Return loan
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i].transfer(address(vault), amounts[i] + feeAmounts[i]);
        }
    }

    function swap( bytes memory userData) public {
        address swapTokenAddress;

        assembly {
            swapTokenAddress := mload(add(userData, 22))
        }

        // here this should be calculated properly like this should be in no of bytes that amount is equal to 
        // not the number of numbers, if its a odd number pad a zero in the beginning
        uint8 token1AmountLength = uint8(userData[22]); 
        uint8 token2AmountLength = uint8(userData[23]);

        bytes memory token1AmountBytes = new bytes(token1AmountLength);
        bytes memory token2AmountBytes = new bytes(token2AmountLength);    

        uint j = 0;

        for (uint i = (userData.length - token2AmountLength - token1AmountLength); i < (userData.length - token2AmountLength); i++) {
            token1AmountBytes[j] = userData[i];
            j++;
        }

        uint token1Amount;

        for(uint i = 0; i < token1AmountBytes.length; i++){
            token1Amount = token1Amount + uint(uint8(token1AmountBytes[i]))*(2**(8*(token1AmountBytes.length-(i+1))));
        }

        uint k = 0;

        for (uint i = (userData.length - token2AmountLength); i < (userData.length); i++) {
            token2AmountBytes[k] = userData[i];
            k++;
        }

        uint token2Amount;

        for(uint i = 0; i < token2AmountBytes.length; i++){
            token2Amount = token2Amount + uint(uint8(token2AmountBytes[i]))*(2**(8*(token2AmountBytes.length-(i+1))));
        }

        if (userData[0] == 0x01) {
            if (userData[1] == 0x02) {
                uint256 uniswapReturns = uniswapTokens( wethToken, wethInput, swapTokenAddress, token1Amount);
                sushiswapTokens(swapTokenAddress, uniswapReturns, wethToken, token2Amount);
            } else if (userData[1] == 0x03) {
                uint256 uniswapReturns = uniswapTokens( wethToken, wethInput, swapTokenAddress, token1Amount);
                pancakeswapTokens(swapTokenAddress, uniswapReturns, wethToken, token2Amount);
            }
        } else if (userData[0] == 0x02) {
            if (userData[1] == 0x01) {
                uint256 sushiswapReturns = sushiswapTokens( wethToken, wethInput, swapTokenAddress, token1Amount );
                uniswapTokens(swapTokenAddress, sushiswapReturns, wethToken, token2Amount);
            } else if (userData[1] == 0x03) {
                uint256 sushiswapReturns = sushiswapTokens( wethToken, wethInput, swapTokenAddress, token1Amount );
                pancakeswapTokens( swapTokenAddress, sushiswapReturns, wethToken, token2Amount );
            }
        } else if (userData[0] == 0x03) {
            if (userData[1] == 0x01) {
                uint256 pancakeReturns = pancakeswapTokens( wethToken, wethInput, swapTokenAddress, token1Amount );
                uniswapTokens(swapTokenAddress, pancakeReturns, wethToken, token2Amount);
            } else if (userData[1] == 0x02) {
                uint256 pancakeReturns = pancakeswapTokens( wethToken, wethInput, swapTokenAddress, token1Amount );
                sushiswapTokens(swapTokenAddress, pancakeReturns, wethToken, token2Amount);
            }
        }
    }

    // function withdraw(params) {
    //     code
    // }

    // To determine the First exchange where
    // 0x01 -> uniswap
    // 0x02 -> sushiswap
    // 0x03 -> pancakeswap

    // To determine the Second exchange where
    // 0x0101 -> uniswap
    // 0x0202 -> sushiswap
    // 0x0303 -> pancakeswap

    // 0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb -> Next 20 bytes/40 Hex characters is token out address

    // 0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb Till here 22 bytes will be over

    // Now from 23 bytes upto data.length

    // 0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb07 -> 1st conversion rate length 23th byte

    // 0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb0708 -> 2nd conversion rate length 24th byte

    // This expected values should be hex encoded 

    // 0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb070832240000000000 -> 1st conversion rate

    // 0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb0708322400000000008000000000000000 -> 2nd conversion rate

    // 0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb01010000
}

