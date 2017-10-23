var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

const stateAddress = '0x...';
const statePassword = 'ChangeMe';
const contractAddress = '0x...';

var abi = JSON.parse('[{"constant":false,"inputs":[{"name":"serialNumber","type":"bytes"},{"name":"hashedVote","type":"bytes32"}],"name":"spend","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"validVoters","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"vote","type":"uint8"},{"name":"salt","type":"bytes32"}],"name":"reveal","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"revealedVotes","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"coinCommitment","type":"bytes"}],"name":"mint","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"voter","type":"address"}],"name":"validateVoter","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"voter","type":"address"},{"name":"vote","type":"uint256"},{"name":"salt","type":"bytes32"}],"name":"shaVote","outputs":[{"name":"sealedVote","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]');
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
        web3.eth.personal.unlockAccount(stateAddress, statePassword, 1000);
        contractInstance.methods.validateVoter(address).send({
            from: stateAddress
        }, function() {
            web3.eth.personal.unlockAccount(stateAddress, statePassword, 1000);
            var result = web3.eth.sendTransaction({
                from: stateAddress,
                to: address,
                value: 100000000000000000
            }, function(result) {
                res.json({
                    "message": "Valid voter"
                });
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
