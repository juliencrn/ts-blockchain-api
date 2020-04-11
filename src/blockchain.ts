import crypto from 'crypto'

import { Transaction, Block } from './types'

class Blockchain {
    chain: Block[] = []

    current_transactions: Transaction[] = []

    constructor() {
        this.chain = []
        this.current_transactions = []

        // Create the genesis block
        this.new_block(1)
    }

    // Create a new Block in the Blockchain
    new_block(proof: number, previous_hash?: string): Block {
        const block: Block = {
            index: this.chain.length + 1,
            timestamp: new Date().getTime(),
            transactions: this.current_transactions,
            proof,
            previous_hash: previous_hash || Blockchain.hash(this.last_block)
        }

        // Reset the current list of transactions
        this.current_transactions = []

        this.chain.push(block)
        return block
    }

    // Creates a new transaction to go into the next mined Block
    new_transaction(transaction: Transaction): number {
        this.current_transactions.push(transaction)

        return this.last_block.index + 1
    }

    static hash(block: Block): string {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(block))
            .digest('hex')
    }

    get last_block(): Block {
        return this.chain[this.chain.length - 1]
    }
}

export default Blockchain
