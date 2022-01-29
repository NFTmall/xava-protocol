pragma solidity ^0.6.12;

/**
 * IDexalotPortfolio contract.
 * Date created: 28.1.22.
 */
contract IDexalotPortfolio {
    function depositTokenFromContract(address _from, bytes32 _symbol, uint _quantity) external;
}
