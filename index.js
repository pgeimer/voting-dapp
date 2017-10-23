if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

const contractAddress = '0x...';

abi = JSON.parse('[{"constant":false,"inputs":[{"name":"serialNumber","type":"bytes"},{"name":"hashedVote","type":"bytes32"}],"name":"spend","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"validVoters","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"vote","type":"uint8"},{"name":"salt","type":"bytes32"}],"name":"reveal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"revealedVotes","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"coinCommitment","type":"bytes"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"voter","type":"address"}],"name":"validateVoter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"voter","type":"address"},{"name":"vote","type":"uint256"},{"name":"salt","type":"bytes32"}],"name":"shaVote","outputs":[{"name":"sealedVote","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');
var votingContract = web3.eth.contract(abi);
var contractInstance = votingContract.at(contractAddress);

var random;
var serialNumber;
var coinCommitment;
var firstAddress;
var secondAddress;
var passwordAddress1;
var passwordAddress2;
var vote;
var salt;

function generate() {
    passwordAddress1 = Math.random().toString(36).slice(-10);
    passwordAddress2 = Math.random().toString(36).slice(-10);
    web3.personal.newAccount(passwordAddress1, function() {
        firstAddress = web3.eth.accounts[web3.eth.accounts.length - 1];
        web3.personal.newAccount(passwordAddress2, function() {
            secondAddress = web3.eth.accounts[web3.eth.accounts.length - 1];
            $('#divStart').hide();
            $('#divValidation').show();
        });
    });
}

function checkVoter() {
    personalId = $('#personalId').val();
    $.ajax({
        type: "POST",
        url: "http://localhost:3002/validate",
        data: {
            personal_id: personalId,
            address: firstAddress
        },
        dataType: 'json',
        success: function(data) {
            $('#divValidation').hide();
            $('#divVoting').show();
        },
        error: function(request, status, error) {
            console.log(request);
            console.log(status);
            console.log(error);
            alert('State Server send an error! Please try again.');
        }
    });
}

function sendEthersToSecondAddress() {
    // TODO: This has to be done via encrypted/invisible transaction
    web3.personal.unlockAccount(firstAddress, passwordAddress1, 1000);
    web3.eth.sendTransaction({
        from: firstAddress,
        to: secondAddress,
        value: 50000000000000000
    }, function() {
        console.log("Ethers successfully sent to address 2");
    });
}

function mint() {
    random = Math.floor(Math.random() * 100000000000);
    serialNumber = Math.floor(Math.random() * 100000000000);
    coinCommitment = sha256(random.toString() + serialNumber.toString());

    web3.personal.unlockAccount(firstAddress, passwordAddress1, 1000);
    var result = contractInstance.mint.sendTransaction(coinCommitment, {
        from: firstAddress
    });
}

function vote() {
    vote = $('#vote').val();
    salt = web3.toHex(Math.random().toString(36).slice(-10));
    hashedVote = contractInstance.shaVote.call(secondAddress, vote, salt, {
        from: secondAddress
    });

    web3.personal.unlockAccount(secondAddress, passwordAddress2, 1000);
    var result = contractInstance.spend.sendTransaction(serialNumber, hashedVote, {
        from: secondAddress
    }, function() {
        $('#divVoting').hide();
        $('#divRevelation').show();
    });
}

function revealVote() {
    web3.personal.unlockAccount(secondAddress, passwordAddress2, 1000);
    var result = contractInstance.reveal.sendTransaction(vote, salt, {
        from: secondAddress
    });
}
