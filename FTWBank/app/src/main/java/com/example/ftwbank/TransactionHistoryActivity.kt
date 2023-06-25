package com.example.ftwbank

import android.annotation.SuppressLint
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import android.widget.ListView
class TransactionHistoryActivity : AppCompatActivity() {

    private lateinit var listView: ListView
    private lateinit var transactionAdapter: TransactionAdapter
    private lateinit var dbHelper: DatabaseHelper


    @SuppressLint("MissingInflatedId")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_transaction_history)

        listView = findViewById(R.id.transactionListView)

        val intent = intent
        if (intent != null && intent.hasExtra("accountNumber")) {
            val accountNumber = intent.getStringExtra("accountNumber")

            // Pass the account number to your database query function
            val transactionData = retrieveTransactionData(accountNumber)

            transactionAdapter = TransactionAdapter(this, transactionData)
            listView.adapter = transactionAdapter

            registerForContextMenu(listView)
        }
    }

    private fun retrieveTransactionData(accountNumber: String?): List<Transaction> {
        val TRANSACTION_TABLE_PREFIX = "Transactions_"
        val COLUMN_TRANSACTION_ID = "transaction_id"
        val COLUMN_TRANSACTION_TYPE = "transaction_type"
        val COLUMN_BALANCE = "balance"
        val COLUMN_TIMESTAMP = "timestamp"
        val COLUMN_AMOUNT = "amount"

        val transactionData = mutableListOf<Transaction>()

        val actualAccountNumber = accountNumber ?: ""
        val transactionsTableName = "$TRANSACTION_TABLE_PREFIX$actualAccountNumber"

        val db = dbHelper.readableDatabase
        val query = "SELECT * FROM $transactionsTableName ORDER BY $COLUMN_TIMESTAMP DESC LIMIT 10"
        val cursor = db.rawQuery(query, null)

        if (cursor.moveToFirst()) {
            do {
                val transactionTypeStr = cursor.getString(cursor.getColumnIndex(COLUMN_TRANSACTION_TYPE))
                val transactionType = TransactionType.valueOf(transactionTypeStr)
                val transactionAmount = cursor.getDouble(cursor.getColumnIndex(COLUMN_AMOUNT))
                val balance = cursor.getDouble(cursor.getColumnIndex(COLUMN_BALANCE))
                val timestamp = cursor.getString(cursor.getColumnIndex(COLUMN_TIMESTAMP))

                val transaction = Transaction(transactionType, transactionAmount, timestamp, balance)
                transactionData.add(transaction)
            } while (cursor.moveToNext())
        } else {
            Toast.makeText(this, "No transactions yet.", Toast.LENGTH_LONG).show()
        }

        cursor.close()
        db.close()

        return transactionData
    }




}
