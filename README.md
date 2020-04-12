# TS Blockchain API

Creation of a blockchain by following the super tutorial de @vdf sur [hackermoon](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46)

The aim of this project was twofold:
- Better understand how a blockchain works
- Practice the OOP

I used Typescript, Node.js, Express.js, Axios & Eslint to carry out this project.

The code is divided into two parts:
- index.ts: Input file and Express.js application (REST API)
- blockchain.ts: Blockchain class containing logic

### Installation
Download the project

`git clone https://github.com/Junscuzzy/ts-blockchain-api`

Enter the project

`cd ts-blockchain-api`

Install the dependencies

`yarn`

or

`npm install`

Build the app

`yarn build`

Launch the app

`yarn start`

Launch the app on different ports

`env PORT=3001 node dist /index.js`

### Usage

You can interact with the blockchain via the API (with Postman or insomnia for example)

Mining a block (create a block)

`GET /mine`

Add a transaction

`POST /transactions/new`

Body (JSON):

```js
{
    sender: string, 
    recipient: string, 
    amount: number
}
```

See the full channel

`GET /chain`

With multiple nodes

Register one or more new nodes

`POST /nodes/register`

Body (JSON):

```js
{
    nodes: ['https://127.0.0.1:3001', ... ]
}
```

This is our Consensus Algorithm, it resolves conflicts by replacing our chain with the longest one in the network.

`GET /nodes/resolve`
