# Voting DApp

A decentralized voting app running on ethereum blockchain.

## Setup
Deploy smart contract

1. Deploy contract/voting-contract.sol on Ropsten
2. Change consts in index.js and state/state.js

Start local ethereum node

    geth --testnet --rpc --rpccorsdomain "*" --rpcapi="db,eth,net,web3,personal"

Install and run state server

    cd state
    npm install
    node state.js
