// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AirTracker {

    // Struct to store the attributes for each token
    struct TokenData {
        int encryptedLat;
        int encryptedLon;
        string ipfsCid;
        uint256 lastUpdated;
    }

    // Mapping from token ID to TokenData
    mapping(uint256 => TokenData) private _tokenData;

    // Mapping from token ID to existence
    mapping(uint256 => bool) private _tokenExists;

    // Total supply of tokens
    uint256 private _totalSupply;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event TokenDataUpdated(uint256 indexed tokenId, TokenData tokenData);

    // Token name
    string private _name = "AirTracker";

    // Token symbol
    string private _symbol = "AIR";

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Address cannot be zero");
        if (owner == address(0)) {
            return _totalSupply;
        } else {
            return 0;
        }
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return address(0);
    }

    function approve(address to, uint256 tokenId) public pure {
        revert("Approve operation is not supported");
    }

    function getApproved(uint256 tokenId) public pure returns (address) {
        revert("GetApproved operation is not supported");
    }

    function transferFrom(address from, address to, uint256 tokenId) public pure {
        revert("Transfers are not allowed");
    }

    function mintOrUpdate(int _encryptedLat, int _encryptedLon, string memory _ipfsCid, uint256 tokenId) public {
        if (!_exists(tokenId)) {
            _totalSupply += 1;
            _tokenExists[tokenId] = true;
        }
        _tokenData[tokenId] = TokenData(_encryptedLat, _encryptedLon, _ipfsCid, block.timestamp);
        emit TokenDataUpdated(tokenId, _tokenData[tokenId]);
        emit Transfer(msg.sender, address(0), tokenId);
    }

    function getTokenData(uint256 tokenId) public view returns (int, int, string memory, uint256) {
        require(_exists(tokenId), "Token does not exist");
        TokenData memory data = _tokenData[tokenId];
        return (data.encryptedLat, data.encryptedLon, data.ipfsCid, data.lastUpdated);
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _tokenExists[tokenId];
    }
}
