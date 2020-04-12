import express, { Request, Response } from 'express'
import { v4 as uuidV4 } from 'uuid'
import Blockchain from './blockchain'

const PORT = process.env.PORT || 3000

const app = express()
app.use(express.json())

// Generate a globally unique address for this node
// Used as recipient for mine
const node_identifier = uuidV4()

const blockchain = new Blockchain()

app.get('/mine', (req: Request, res: Response) => {
    // We run the proof of work algorithm to get the next proof...
    const { last_block } = blockchain
    const last_proof = last_block.proof
    const proof = Blockchain.proof_of_work(last_proof)

    // We must receive a reward for finding the proof.
    // The sender is "0" to signify that this node has mined a new coin.
    blockchain.new_transaction({
        sender: '0',
        recipient: node_identifier,
        amount: 1
    })

    // Forge the new Block by adding it to the chain
    const previous_hash = Blockchain.hash(last_block)
    const block = blockchain.new_block(proof, previous_hash)

    res.status(200).json({
        message: 'New Block Forged',
        block
    })
})

app.post('/transactions/new', (req: Request, res: Response) => {
    const { sender, recipient, amount } = req.body

    if (!(sender && recipient && amount)) {
        res.status(400).json({ message: 'Missing values' })
    }

    // Create the new transaction
    const index = blockchain.new_transaction({ sender, recipient, amount })

    res.status(201).json({
        message: `Transaction will be added to Block ${index}`
    })
})

app.get('/chain', (req: Request, res: Response) => {
    res.status(200).json({
        chain: blockchain.chain,
        length: blockchain.chain.length
    })
})

app.post('/nodes/register', (req: Request, res: Response) => {
    const { nodes } = req.body

    if (!nodes) {
        res.status(400).json({
            message: 'Error: Please supply a valid list of nodes'
        })
    }

    nodes.forEach((node: string) => {
        blockchain.register_node(node)
    })

    res.status(201).json({
        message: 'New nodes haves been added',
        total_nodes: blockchain.nodes.length,
        nodes: blockchain.nodes
    })
})

app.get('/nodes/resolve', (req: Request, res: Response) => {
    blockchain.resolve_conflicts().then((replaced) => {
        console.log({ replaced, nodes: blockchain.nodes })
        if (replaced) {
            res.status(200).json({
                message: 'Our chain was replaced',
                new_chain: blockchain.chain
            })
        } else {
            res.status(200).json({
                message: 'Our chain is authoritative',
                chain: blockchain.chain
            })
        }
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
