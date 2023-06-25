package com.example.ftwbank

enum class TransactionType {
    WD, // Withdrawal
    DP // Deposit
}

data class Transaction(
    val transactionType: TransactionType,
    val transactionAmount: Double,
    val timestamp: String,
    val balance: Double
)
