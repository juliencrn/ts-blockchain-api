import crypto from 'crypto'
import axios, { AxiosResponse } from 'axios'
import * as url from 'url'

import { Transaction, Block } from './types'

class Blockchain {
    chain: Block[] = []

    current_transactions: Transaction[] = []

    // Others nodes for mine decentralization
    nodes = []

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

    // Add a new node to the list of nodes
    register_node(address: string): void {
        const parsedUrl = url.parse(address)
        if (parsedUrl?.hostname) {
            const { hostname, port, protocol } = parsedUrl
            const addressUrl: string = port
                ? `${hostname}:${port}`
                : `${hostname}`

            const nodeUrl = `${protocol}//${addressUrl.replace(
                'localhost',
                '127.0.0.1'
            )}`
            if (!this.nodes.includes(nodeUrl as never)) {
                this.nodes.push(nodeUrl as never)
            }
        }
    }

    // Determine if a given blockchain is valid
    static valid_chain(chain: Block[]): boolean {
        let last_block = chain[0]

        // eslint-disable-next-line consistent-return
        chain.forEach((block: Block, index: number) => {
            // Jump first block
            if (index > 0) {
                // Check that the hash of the block is correct
                if (block.previous_hash !== Blockchain.hash(last_block)) {
                    return false
                }

                // Check that the Proof of Work is correct
                if (!Blockchain.valid_proof(last_block.proof, block.proof)) {
                    return false
                }

                last_block = block
            }
        })

        return true
    }

    // This is our Consensus Algorithm, it resolves conflicts
    // by replacing our chain with the longest one in the network.
    // :return: <bool> True if our chain was replaced, False if not
    async resolve_conflicts(): Promise<boolean> {
        const neighbors = this.nodes
        let new_chain

        // We're only looking for chains longer than ours
        let max_length = this.chain.length

        // Grab and verify the chains from all the nodes in our network
        for (let i = 0; i < neighbors.length; i += 1) {
            const neighbor: string = neighbors[i]

            interface ChainRes {
                chain: Block[]
                length: number
            }

            // eslint-disable-next-line no-await-in-loop
            const res: AxiosResponse<ChainRes> = await axios.get(
                `${neighbor}/chain`
            )

            if (res.status === 200) {
                const { chain, length } = res.data
                if (length > max_length && Blockchain.valid_chain(chain)) {
                    max_length = length
                    new_chain = chain
                }
            }
        }

        if (new_chain) {
            this.chain = new_chain
            return true
        }
        return false
    }
}

export default Blockchain
