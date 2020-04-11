export interface Transaction {
    sender: string
    recipient: string
    amount: number
}

export interface Block {
    index: number
    timestamp: number
    transactions: Transaction[]
    proof: number
    previous_hash: string
}
