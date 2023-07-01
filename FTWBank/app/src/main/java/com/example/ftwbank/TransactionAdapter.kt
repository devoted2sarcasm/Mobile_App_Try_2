package com.example.ftwbank

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class TransactionAdapter(private val transactions: List<Transaction>) : RecyclerView.Adapter<TransactionAdapter.TransactionViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TransactionViewHolder {
        val itemView = LayoutInflater.from(parent.context).inflate(R.layout.transaction, parent, false)
        return TransactionViewHolder(itemView)
    }

    override fun onBindViewHolder(holder: TransactionViewHolder, position: Int) {
        val transaction = transactions[position]
        holder.bind(transaction)
    }

    override fun getItemCount(): Int {
        return transactions.size
    }

    inner class TransactionViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        private val transactionTypeTextView: TextView = itemView.findViewById(R.id.transactionType)
        private val transactionAmountTextView: TextView = itemView.findViewById(R.id.transactionAmount)
        private val transactionTimestampTextView: TextView = itemView.findViewById(R.id.transactionTimestamp)
        private val transactionBalanceTextView: TextView = itemView.findViewById(R.id.transactionBalance)

        fun bind(transaction: Transaction) {
            transactionTypeTextView.text = transaction.transactionType.toString()
            transactionAmountTextView.text = transaction.transactionAmount.toString()
            transactionTimestampTextView.text = transaction.timestamp
            transactionBalanceTextView.text = transaction.balance.toString()
        }
    }
}
