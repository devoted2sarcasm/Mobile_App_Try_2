package com.example.ftwbank

import android.content.Context
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView

class TransactionAdapter(
    context: Context,
    private val transactions: List<Transaction>
) : ArrayAdapter<Transaction>(context, 0, transactions) {

    override fun getView(position: Int, convertView: View?, parent: ViewGroup): View {
        var itemView = convertView
        val transaction = getItem(position)

        if (itemView == null) {
            itemView = LayoutInflater.from(context).inflate(R.layout.transaction_list_item, parent, false)
        }

        val textTransactionType = itemView?.findViewById<TextView>(R.id.textTransactionType)
        val textTransactionAmount = itemView?.findViewById<TextView>(R.id.textTransactionAmount)
        val textTimestamp = itemView?.findViewById<TextView>(R.id.textTimestamp)
        val textNewBalance = itemView?.findViewById<TextView>(R.id.textNewBalance)

        textTransactionType?.text = transaction?.transactionType?.toString()
        textTransactionAmount?.text = transaction?.transactionAmount.toString()
        textTimestamp?.text = transaction?.timestamp
        textNewBalance?.text = transaction?.balance.toString()

        return itemView!!
    }
}
