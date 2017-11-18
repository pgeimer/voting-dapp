if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

const contractAddress = '0x...';

abi = JSON.parse('[{"constant":false,"inputs":[{"name":"voter","type":"address"},{"name":"constituency","type":"uint8"}],"name":"validateVoter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"vote","type":"uint8"},{"name":"salt","type":"bytes32"},{"name":"voteType","type":"uint8"}],"name":"reveal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"coinCommitment","type":"bytes"},{"name":"voteType","type":"uint8"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"serialNumber","type":"bytes"},{"name":"hashedVote","type":"bytes32"},{"name":"voteType","type":"uint8"}],"name":"spend","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"endTimestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"wk1ValidVoters","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"zsValidVoters","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"wk1RevealedVotes","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"zsRevealedVotes","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"voter","type":"address"},{"name":"vote","type":"uint256"},{"name":"salt","type":"bytes32"}],"name":"shaVote","outputs":[{"name":"sealedVote","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startTimestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');
var votingContract = web3.eth.contract(abi);
var contractInstance = votingContract.at(contractAddress);

var firstAddress;
var secondAddress;

var constituency;

var erststimme;
var esRandom;
var esSerialNumber;
var esCoinCommitment;
var esSalt;

var zweitstimme;
var zsRandom;
var zsSerialNumber;
var zsCoinCommitment;
var zsSalt;

var passwordAddress1;
var passwordAddress2;


Ladda.bind('.ladda-button');

$("#btnStart").on("click", function(e) {
    e.preventDefault();
    generate();
});

$("#btnCheckVoter").on("click", function(e) {
    e.preventDefault();
    checkVoter();
});

$("#btnVote").on("click", function(e) {
    e.preventDefault();
    vote();
});

$("#btnRevealVote").on("click", function(e) {
    e.preventDefault();
    revealVote();
});

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
            constituency = data.constituency
            web3.eth.getTransactionReceiptMined(data.tx).then(function() {
                console.log("Ethers successfully sent to address 1");
                sendEthersToSecondAddress();
            });
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
        value: 5000000000000000
    }, function(err, txHash) {
        if (!err) {
            web3.eth.getTransactionReceiptMined(txHash).then(function() {
                console.log("Ethers successfully sent to address 2");
                mint();
            });
        }
    });
}

function mint() {
    if (!constituency) {
        alert('Wahlkreis konnte nicht ermittelt werden.');
        return;
    }

    esRandom = Math.floor(Math.random() * 100000000000);
    esSerialNumber = Math.floor(Math.random() * 100000000000);
    esCoinCommitment = sha256(esRandom.toString() + esSerialNumber.toString());

    zsRandom = Math.floor(Math.random() * 100000000000);
    zsSerialNumber = Math.floor(Math.random() * 100000000000);
    zsCoinCommitment = sha256(zsRandom.toString() + zsSerialNumber.toString());

    web3.personal.unlockAccount(firstAddress, passwordAddress1, 1000);
    contractInstance.mint.sendTransaction(esCoinCommitment, constituency, {
        from: firstAddress
    }, function(err, txHash) {
        if (!err) {
            web3.eth.getTransactionReceiptMined(txHash).then(function() {
                console.log("CointCommitment for Erststimme successfully sent to contract");
                web3.personal.unlockAccount(firstAddress, passwordAddress1, 1000);
                contractInstance.mint.sendTransaction(zsCoinCommitment, 0, {
                    from: firstAddress
                }, function(err, txHash) {
                    if (!err) {
                        web3.eth.getTransactionReceiptMined(txHash).then(function() {
                            console.log("CointCommitment for Zweitstimme successfully sent to contract");
                            $('#divValidation').hide();
                            $('#divVoting').show();
                        });
                    }
                });
            });
        }
    });
}

function vote() {
    erststimme = $('#inputErststimme').val();
    zweitstimme = $('#inputZweitstimme').val();

    esSalt = web3.toHex(Math.random().toString(36).slice(-10));
    esHashedVote = contractInstance.shaVote.call(secondAddress, erststimme, esSalt, {
        from: secondAddress
    });

    zsSalt = web3.toHex(Math.random().toString(36).slice(-10));
    zsHashedVote = contractInstance.shaVote.call(secondAddress, zweitstimme, zsSalt, {
        from: secondAddress
    });

    web3.personal.unlockAccount(secondAddress, passwordAddress2, 1000);
    contractInstance.spend.sendTransaction(esSerialNumber, esHashedVote, constituency, {
        from: secondAddress
    }, function(err, txHash) {
        if (!err) {
            web3.eth.getTransactionReceiptMined(txHash).then(function() {
                console.log("Erststimme successfully sent to contract");
                contractInstance.spend.sendTransaction(zsSerialNumber, zsHashedVote, 0, {
                    from: secondAddress
                }, function(err, txHash) {
                    if (!err) {
                        web3.eth.getTransactionReceiptMined(txHash).then(function() {
                            console.log("Zweitstimme successfully sent to contract");
                            $('#divVoting').hide();
                            $('#divRevelation').show();
                        });
                    }
                });
            });
        }
    });
}

function revealVote() {
    web3.personal.unlockAccount(secondAddress, passwordAddress2, 1000);
    contractInstance.reveal.sendTransaction(erststimme, esSalt, constituency, {
        from: secondAddress
    }, function(err, txHash) {
        if (!err) {
            web3.eth.getTransactionReceiptMined(txHash).then(function() {
                console.log("Erstimme successfully revealed");
                web3.personal.unlockAccount(secondAddress, passwordAddress2, 1000);
                contractInstance.reveal.sendTransaction(zweitstimme, zsSalt, 0, {
                    from: secondAddress
                }, function(err, txHash) {
                    if (!err) {
                        web3.eth.getTransactionReceiptMined(txHash).then(function() {
                            console.log("Zweitstimme successfully revealed");
                            $('#divRevelation').hide();
                            $('#divCompletion').show();
                        });
                    }
                });
            });
        }
    });
}

web3.eth.getTransactionReceiptMined = function(txHash, interval) {
    const self = this;
    const transactionReceiptAsync = function(resolve, reject) {
        self.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else if (receipt == null) {
                setTimeout(
                    () => transactionReceiptAsync(resolve, reject),
                    interval ? interval : 500);
            } else {
                resolve(receipt);
            }
        });
    };

    if (Array.isArray(txHash)) {
        return Promise.all(txHash.map(
            oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
    } else if (typeof txHash === "string") {
        return new Promise(transactionReceiptAsync);
    } else {
        throw new Error("Invalid Type: " + txHash);
    }
};
