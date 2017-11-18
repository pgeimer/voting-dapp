pragma solidity ^0.4.16;

contract VotingContract {
    address owner;
    
    uint public startTimestamp = 1509872400; // Change to offical start time
    uint public endTimestamp = 1589901200; // Change to official end time
    
    // Zweitstimme
    mapping (address => uint8) public zsValidVoters;
    mapping (bytes => bool) zsCoinCommitments;
    mapping (bytes32 => bool) zsHashedVotes;
    mapping (bytes => bool) zsSpendSerialNumbers;
    uint8[] public zsRevealedVotes;
    
    // Erststimme Wahlkreis 1
    mapping (address => uint8) public wk1ValidVoters;
    mapping (bytes => bool) wk1CoinCommitments;
    mapping (bytes32 => bool) wk1HashedVotes;
    mapping (bytes => bool) wk1SpendSerialNumbers;
    uint8[] public wk1RevealedVotes;
    

    function VotingContract() public {
        owner = msg.sender;
    }
    
    /**
    * Called from state for sending votes initially to voter (approve him to vote)
    */
    function validateVoter(address voter, uint8 constituency) public {
        require(msg.sender == owner);
        zsValidVoters[voter] = 1;
        
        if (constituency == 1) {
            wk1ValidVoters[voter] = 1;
        }
    }
    
    /**
     * Called from the voter
     */
    function mint(bytes coinCommitment, uint8 voteType) public returns (bool) {
        require(block.timestamp >= startTimestamp);
        require(block.timestamp <= endTimestamp);
        
        if (voteType == 0) {
            require(zsValidVoters[msg.sender] == 1);
            zsCoinCommitments[coinCommitment] = true;
            zsValidVoters[msg.sender] = 2; // Update status
        } 
        if (voteType == 1) {
            require(wk1ValidVoters[msg.sender] == 1);
            wk1CoinCommitments[coinCommitment] = true;
            wk1ValidVoters[msg.sender] = 2; // Update status
        }
        
        return true;
    }
    
    /**
     * Vote function, called from am new address
     */ 
    function spend(bytes serialNumber, bytes32 hashedVote, uint8 voteType) public returns (bool) {
        require(block.timestamp >= startTimestamp);
        require(block.timestamp <= endTimestamp);
        
        if (voteType == 0) {
            // TODO zkSNARK: Check if serialNumber has coinCommitment in zsCoinCommitments
            if (zsSpendSerialNumbers[serialNumber] != true) {
                zsHashedVotes[hashedVote] = true;
                zsSpendSerialNumbers[serialNumber] = true;
            }
            
        } 
        if (voteType == 1) {
            // TODO zkSNARK: Check if serialNumber has coinCommitment in wk1CoinCommitments
            if (wk1SpendSerialNumbers[serialNumber] != true) {
                wk1HashedVotes[hashedVote] = true;
                wk1SpendSerialNumbers[serialNumber] = true;
            }
        }
        
        return true;
    }
    
    /**
     * Reavels the vote
     */
    function reveal(uint8 vote, bytes32 salt, uint8 voteType) public returns (bool) {
        require(block.timestamp >= endTimestamp);
        
        bytes32 hashedVote = shaVote(msg.sender, vote, salt);
        
        if (voteType == 0) {
            if (zsHashedVotes[hashedVote] == true) {
                zsRevealedVotes.push(vote);
                zsHashedVotes[hashedVote] = false;
            }
        }
        if (voteType == 1) {
            if (wk1HashedVotes[hashedVote] == true) {
                wk1RevealedVotes.push(vote);
                wk1HashedVotes[hashedVote] = false;
            }
        }
        
        return true;
    }
    
    function shaVote(address voter, uint vote, bytes32 salt) constant returns (bytes32 sealedVote) {
        return keccak256(voter, vote, salt);
    }
}