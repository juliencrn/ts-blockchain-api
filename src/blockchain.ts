import crypto from 'crypto'

import { Transaction, Block } from './types'

class Blockchain {
    chain: Block[] = []

    current_transactions: Transaction[] = []

    constructor() {
        this.chain = []
        this.current_transactions = []

        // Create the genesis block
        this.new_block(1, 'initial_genesis_hash')
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
        const block_string = JSON.stringify(block)
        return crypto.createHash('sha256').update(block_string).digest('hex')
    }

    get last_block(): Block {
        return this.chain[this.chain.length - 1]
    }

    // Simple proof of work
    static proof_of_work(last_proof: number): number {
        let proof = 0
        while (!Blockchain.valid_proof(last_proof, proof)) {
            proof += 1
        }
        return proof
    }

    // Validates the proof: Does hash(last_proof, proof) contain 4 leading 0
    static valid_proof(last_proof: number, proof: number): boolean {
        const guess = JSON.stringify(`${last_proof}${proof}`)
        const guess_hash = crypto
            .createHash('sha256')
            .update(guess)
            .digest('hex')
        const lastFourChars = guess_hash.slice(
            guess_hash.length - 5,
            guess_hash.length - 1
        )
        return lastFourChars === '0000'
    }
}

export default Blockchain
