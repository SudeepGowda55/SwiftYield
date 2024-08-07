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

    IUniswapV2Router02 private constant uniswapRouter = IUniswapV2Router02(0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24); // Base Mainnet
    // IUniswapV2Router02 private constant uniswapRouter = IUniswapV2Router02(0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791);
    // IUniswapV2Router02 private constant sushiswapRouter = IUniswapV2Router02(0xeaBcE3E74EF41FB40024a21Cc2ee2F5dDc615791);
     
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

    function swapTokens( address _tokenOut, uint256 _amountOutMin ) external {
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

    function hello() public pure returns (string memory) {
        return string("Thank you so much, i am able to buy a coffee");
    }

    // function withdraw(params) {
    //     code
    // }
}
