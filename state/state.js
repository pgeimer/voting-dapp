var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const stateAddress = '0x...';
const statePassword = 'ChangeMe';
const contractAddress = '0x...';

var abi = JSON.parse('[{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"zs1RevealedVotes","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"coinCommitment","type":"bytes"},{"name":"voteType","type":"uint16"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"voter","type":"address"},{"name":"constituency","type":"uint16"},{"name":"countryList","type":"uint8"}],"name":"validateVoter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"zs1ValidVoters","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"es1ValidVoters","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"vote","type":"uint8"},{"name":"salt","type":"bytes32"},{"name":"voteType","type":"uint16"}],"name":"reveal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"serialNumber","type":"bytes"},{"name":"hashedVote","type":"bytes32"},{"name":"voteType","type":"uint16"}],"name":"spend","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"endTimestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"es1RevealedVotes","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"voter","type":"address"},{"name":"vote","type":"uint256"},{"name":"salt","type":"bytes32"}],"name":"shaVote","outputs":[{"name":"sealedVote","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"startTimestamp","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');
var contractInstance = new web3.eth.Contract(abi, contractAddress);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors());
app.options('/validate', cors()); // enable pre-flight request
app.post('/validate', function(req, res) {
    var personalId = req.body.personal_id;
    var address = req.body.address;
    if (!checkPersonalId(personalId)) {
        res.statusCode = 403;
        res.json({
            "message": "Voter not valid"
        });
    } else {
        var constituency = getConstituency(personalId);
        var countryList = getCountryList(personalId);
        web3.eth.personal.unlockAccount(stateAddress, statePassword, 1000);
        contractInstance.methods.validateVoter(address, constituency, countryList).send({
            from: stateAddress
        }, function() {
            web3.eth.personal.unlockAccount(stateAddress, statePassword, 1000);
            var result = web3.eth.sendTransaction({
                from: stateAddress,
                to: address,
                value: 10000000000000000
            }, function(err, txHash) {
                if (!err) {
                    res.json({
                        "message": "Valid voter",
                        "constituency": constituency,
                        "country_list": countryList,
                        "tx": txHash
                    });
                } else {
                    res.statusCode = 500;
                    res.json({
                        "message": "Can't send eth to address"
                    });
                }
            });
        });
    }
});
app.listen(3002);
console.log("Server running on 3002 port");

function checkPersonalId(personalId) {
    // TODO Check if valid voter
    return true;
}

function getConstituency(personalId) {
    // TODO Get constituency for voter
    return 1;
}

function getCountryList(personalId) {
    // TODO Get country list for voter
    return 1;
}
