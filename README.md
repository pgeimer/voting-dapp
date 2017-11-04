# Voting DApp

A decentralized voting app running on ethereum blockchain.

## Setup
Deploy smart contract

1. Change timestamps in contract/voting-contract.sol
2. Deploy contract/voting-contract.sol on Ropsten
3. Change consts in index.js and state/state.js

Start local ethereum node

    geth --testnet --rpc --rpccorsdomain "*" --rpcapi="db,eth,net,web3,personal"

Install and run state server

    cd state
    npm install
    node state.js
