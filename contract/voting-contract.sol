pragma solidity ^0.4.16;

contract VotingContract {
    address owner;
    
    mapping (address => uint8) public validVoters;
    mapping (bytes => bool) coinCommitments;
    mapping (bytes32 => bool) hashedVotes;
    mapping (bytes => bool) spendSerialNumbers;
    
    uint8[] public revealedVotes;

    function VotingContract() public {
        owner = msg.sender;
    }
    
    /**
    * Called from state for sending votes initially to voter (approve him to vote)
    */
    function validateVoter(address voter) public {
        require(msg.sender == owner);
        validVoters[voter] = 1;
    }
    
    /**
     * Called from the voter
     */
    function mint(bytes coinCommitment) public returns (bool) {
        require(validVoters[msg.sender] == 1);
        
        // TODO: Check if coin is correct
        coinCommitments[coinCommitment] = true;
        validVoters[msg.sender] = 2; // Update status
        
        return true;
    }
    
    /**
     * Vote function, called from am new address
     */ 
    function spend(bytes serialNumber, bytes32 hashedVote) public returns (bool) {
        // TODO Check time
        // TODO zkSNARK: Check if serialNumber has coinCommitment in coinCommitments
        if (spendSerialNumbers[serialNumber] != true) {
            hashedVotes[hashedVote] = true;
            spendSerialNumbers[serialNumber] = true;
        }
        
        return true;
    }
    
    /**
     * Reavels the vote
     */
    function reveal(uint8 vote, bytes32 salt) public returns (bool) {
        // TODO Check time
        bytes32 hashedVote = shaVote(msg.sender, vote, salt);
        if (hashedVotes[hashedVote] == true) {
            revealedVotes.push(vote);
            hashedVotes[hashedVote] == false;
        }
        
        return true;
    }
    
    function shaVote(address voter, uint vote, bytes32 salt) constant returns (bytes32 sealedVote) {
        return keccak256(voter, vote, salt);
    }
}