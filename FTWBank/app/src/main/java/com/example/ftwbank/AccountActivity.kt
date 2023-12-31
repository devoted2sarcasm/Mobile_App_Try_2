package com.example.ftwbank

import android.annotation.SuppressLint
import android.content.ContentValues
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import java.text.SimpleDateFormat
import java.util.*
class AccountActivity : AppCompatActivity() {

    private lateinit var TABLE_TRANSACTIONS: String

    private lateinit var email: String
    private lateinit var accountNameTextView: TextView
    private lateinit var accountNumberTextView: TextView
    private lateinit var currentBalanceTextView: TextView

    private lateinit var depositButton: Button
    private lateinit var withdrawButton: Button
    private lateinit var transactionHistoryButton: Button
    private lateinit var logoutButton: Button

    private lateinit var databaseHelper: DatabaseHelper

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_account)

        databaseHelper = DatabaseHelper(this)

        email = intent.getStringExtra("email") ?: ""

        TABLE_TRANSACTIONS = "Transactions_$email"

        if(::email.isInitialized) {
            accountNameTextView = findViewById(R.id.acct_user)
            accountNumberTextView = findViewById(R.id.account_num_user)
            currentBalanceTextView = findViewById(R.id.current_bal_user)

            transactionHistoryButton = findViewById(R.id.trans_hist_button)
            depositButton = findViewById(R.id.deposit_button)
            withdrawButton = findViewById(R.id.withdraw_button)
            logoutButton = findViewById(R.id.logout_button)


            retrieveAccountInfo(email)


            depositButton.setOnClickListener {
                makeDeposit()
            }

            withdrawButton.setOnClickListener {
                makeWithdrawal()
            }

            transactionHistoryButton.setOnClickListener {
                transactionHistoryDialog(email)
            }

            logoutButton.setOnClickListener {
                finish()
            }
        } else {
            Toast.makeText(this, "Email is missing or invalid.", Toast.LENGTH_SHORT).show()
            finish()
        }



    }

    private fun makeDeposit() {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Make a Deposit")

        val inputView = LayoutInflater.from(this).inflate(R.layout.dialog_make_deposit, null)
        builder.setView(inputView)

        builder.setPositiveButton("Make Deposit") { dialog, _ ->
            val amountEditText = inputView.findViewById<EditText>(R.id.editDepositAmount)
            val amount = amountEditText.text.toString().toDoubleOrNull()

            if (amount != null && amount > 0) {
                // Retrieve the account number
                val email = intent.getStringExtra("email") ?: ""
                val accountNumber = retrieveAccountNumber(email)

                // Valid deposit amount entered, perform deposit action
                performDeposit(email, amount)
            } else {
                Toast.makeText(this, "Please enter a valid deposit amount.", Toast.LENGTH_SHORT).show()
            }

            dialog.dismiss()
        }

        builder.setNegativeButton("Cancel") { dialog, _ ->
            dialog.dismiss()
        }

        val dialog = builder.create()
        dialog.show()
    }

    @SuppressLint("Range")
    private fun retrieveAccountNumber(email: String): Int {
        val db = databaseHelper.readableDatabase

        val query = "SELECT ${DatabaseHelper.COLUMN_ACCOUNT_NUMBER} FROM ${DatabaseHelper.TABLE_NAME} WHERE ${DatabaseHelper.COLUMN_EMAIL} = ?"
        val cursor = db.rawQuery(query, arrayOf(email))

        var accountNumber = 0
        if (cursor.moveToFirst()) {
            accountNumber = cursor.getInt(cursor.getColumnIndex(DatabaseHelper.COLUMN_ACCOUNT_NUMBER))
        }

        cursor.close()
        db.close()

        return accountNumber
    }

    private fun performDeposit(email: String, amount: Double) {
        //val email = intent.getStringExtra("email") ?: ""

        // Get the current timestamp
        val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        // Retrieve the current balance
        val currentBalance = retrieveCurrentBalance(email)

        val newBalance = currentBalance + amount
        // Create a new Transaction object
        val transaction = Transaction(TransactionType.DP, amount, timestamp, newBalance)

        // Store the transaction in the database
        val db = databaseHelper.writableDatabase
        val tableName = "${DatabaseHelper.TRANSACTION_TABLE_PREFIX}$email"

        val values = ContentValues().apply {
            put(DatabaseHelper.COLUMN_TRANSACTION_TYPE, transaction.transactionType.toString())
            put(DatabaseHelper.COLUMN_TRANSACTION_AMOUNT, transaction.transactionAmount)
            put(DatabaseHelper.COLUMN_TIMESTAMP, transaction.timestamp)
            put(DatabaseHelper.COLUMN_BALANCE, newBalance)
        }

        db.insert(tableName, null, values)
        db.close()

        // You can also update the account balance based on the deposit amount
        //updateAccountBalance(amount)
        retrieveAccountInfo(email)
        // Display a success message or perform any other necessary actions
        Toast.makeText(this, "Deposit made successfully.", Toast.LENGTH_SHORT).show()
    }



    private fun getCurrentTimestamp(): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        val currentTime = Calendar.getInstance().time
        return dateFormat.format(currentTime)
    }



    @SuppressLint("Range")
    private fun fetchTransactionHistory(email: String): List<Transaction> {
        val transactions = mutableListOf<Transaction>()

        val databaseHelper = DatabaseHelper(this)
        val db = databaseHelper.readableDatabase

        val query = "SELECT * FROM ${DatabaseHelper.TRANSACTION_TABLE_PREFIX}$email ORDER BY ${DatabaseHelper.COLUMN_TRANSACTION_ID} DESC LIMIT 10"
        val cursor = db.rawQuery(query, null)

        if (cursor.moveToFirst()) {
            while(!cursor.isAfterLast) {
                val t_type = cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_TRANSACTION_TYPE))
                val t_amount = cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_TRANSACTION_AMOUNT))
                val balance = cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_BALANCE))
                val timestamp = cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_TIMESTAMP))

                val transaction = Transaction(
                    TransactionType.valueOf(t_type),
                    t_amount,
                    timestamp,
                    balance
                )
                transactions.add(transaction)
                cursor.moveToNext()
            }
        }
        return transactions
    }

    private fun transactionHistoryDialog(email: String) {
        val dialogView = LayoutInflater.from(this).inflate(R.layout.transaction_recycler, null)
        val dialogBuilder = AlertDialog.Builder(this)
            .setView(dialogView)
            .setTitle("Recent Transactions")

        val transactions = fetchTransactionHistory(email)

        val recyclerView = dialogView.findViewById<RecyclerView>(R.id.transactionRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)

        val adapter = TransactionAdapter(transactions)
        recyclerView.adapter = adapter

        val dialog = dialogBuilder.create()
        dialog.show()
    }


    @SuppressLint("Range")
    private fun retrieveTransactionHistory() {

        val inflater = LayoutInflater.from(this)
        val db = databaseHelper.readableDatabase

        val email = intent.getStringExtra("email") ?: ""
        val query = "SELECT * FROM ${DatabaseHelper.TRANSACTION_TABLE_PREFIX}$email"
        val cursor = db.rawQuery(query, null)

        val transactionList = mutableListOf<Transaction>()

        if (cursor.moveToFirst()) {
            while (!cursor.isAfterLast) {
                val transactionType =
                    cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_TRANSACTION_TYPE))
                val transactionAmount =
                    cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_TRANSACTION_AMOUNT))
                val timestamp =
                    cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_TIMESTAMP))
                val balance =
                    cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_BALANCE))

                val transaction = Transaction(
                    TransactionType.valueOf(transactionType),
                    transactionAmount,
                    timestamp,
                    balance
                )

                transactionList.add(transaction)
                cursor.moveToNext()
            }
        }

        cursor.close()
        db.close()

        // Now you have the transactionList containing all the transaction history
        // You can use this data as needed, such as displaying it in a ListView or RecyclerView
    }

    @SuppressLint("Range")
    private fun retrieveAccountInfo(email: String) {
        val inflater = LayoutInflater.from(this)
        val db = databaseHelper.readableDatabase

        val query = "SELECT * FROM ${DatabaseHelper.TABLE_NAME} WHERE ${DatabaseHelper.COLUMN_EMAIL} = ?"
        val cursor = db.rawQuery(query, arrayOf(email))

        if(cursor.moveToFirst()) {
            val accountName = "${cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_FNAME))} ${cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_LNAME))}"
            val accountNumber = cursor.getInt(cursor.getColumnIndex(DatabaseHelper.COLUMN_ACCOUNT_NUMBER))
            val currentBalance = retrieveCurrentBalance(email)

            accountNameTextView?.text = accountName
            accountNumberTextView?.text = accountNumber.toString()
            currentBalanceTextView?.text = currentBalance.toString()
        }

        cursor.close()
        db.close()

    }

    @SuppressLint("Range")
    private fun retrieveCurrentBalance(email: String): Double {
        val db = databaseHelper.readableDatabase

        val query = "SELECT ${DatabaseHelper.COLUMN_BALANCE} FROM ${DatabaseHelper.TRANSACTION_TABLE_PREFIX}$email ORDER BY ${DatabaseHelper.COLUMN_TRANSACTION_ID} DESC LIMIT 1"

        val cursor = db.rawQuery(query, null)

        var balance = 0.0

        if (cursor.moveToFirst()) {
            balance = cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_BALANCE))
        }

        cursor.close()
        db.close()

        return balance
    }


    //@SuppressLint("Range")
    /*private fun updateAccountBalance(depositAmount: Double) {
        val email = intent.getStringExtra("email") ?: ""

        val db = databaseHelper.writableDatabase
        val tableName = "${DatabaseHelper.TRANSACTION_TABLE_PREFIX}$email"

        // Retrieve the current balance
        val query = "SELECT $DatabaseHelper.COLUMN_BALANCE FROM $tableName ORDER BY $DatabaseHelper.COLUMN_TIMESTAMP DESC LIMIT 1"
        val cursor = db.rawQuery(query, null)

        var currentBalance = 0.0
        if (cursor.moveToFirst()) {
            currentBalance = cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_BALANCE))
        }
        cursor.close()

        // Calculate the new balance
        val newBalance = currentBalance + depositAmount

        if (cursor.count == 0) {
            // It's the first deposit, insert a new transaction record with the deposit amount
            val values = ContentValues().apply {
                put(DatabaseHelper.COLUMN_TRANSACTION_TYPE, TransactionType.DP.name)
                put(DatabaseHelper.COLUMN_BALANCE, depositAmount)
                put(DatabaseHelper.COLUMN_TIMESTAMP, getCurrentTimestamp())
                put(DatabaseHelper.COLUMN_TRANSACTION_AMOUNT, depositAmount)
            }

            db.insert(tableName, null, values)
        } else {
            // Create a ContentValues object with the new balance
            val values = ContentValues().apply {
                put(DatabaseHelper.COLUMN_BALANCE, newBalance)
            }

            // Update the account balance in the database
            db.update(tableName, values, null, null)
        }

        db.close()
    }*/

    private fun performWithdrawal(email: String, amount: Double) {
        //val email = intent.getStringExtra("email") ?: ""

        // Get the current timestamp
        val timestamp = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        // Retrieve the current balance
        val currentBalance = retrieveCurrentBalance(email)

        val newBalance = currentBalance - amount
        // Create a new Transaction object
        val transaction = Transaction(TransactionType.WD, amount, timestamp, newBalance)

        // Store the transaction in the database
        val db = databaseHelper.writableDatabase
        val tableName = "${DatabaseHelper.TRANSACTION_TABLE_PREFIX}$email"

        val values = ContentValues().apply {
            put(DatabaseHelper.COLUMN_TRANSACTION_TYPE, transaction.transactionType.toString())
            put(DatabaseHelper.COLUMN_TRANSACTION_AMOUNT, transaction.transactionAmount)
            put(DatabaseHelper.COLUMN_TIMESTAMP, transaction.timestamp)
            put(DatabaseHelper.COLUMN_BALANCE, newBalance)
        }

        db.insert(tableName, null, values)
        db.close()

        retrieveAccountInfo(email)

        // You can also update the account balance based on the deposit amount
        //updateAccountBalance(amount)

        // Display a success message or perform any other necessary actions
        Toast.makeText(this, "Withdrawal of \$$amount made successfully.", Toast.LENGTH_SHORT).show()
    }

    @SuppressLint("MissingInflatedId")
    private fun makeWithdrawal() {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Make a Withdrawal")

        val inputView = LayoutInflater.from(this).inflate(R.layout.dialog_make_withdrawal, null)
        builder.setView(inputView)

        val currentBalance = retrieveCurrentBalance(email)
        Toast.makeText(this, "Current Balance: $currentBalance", Toast.LENGTH_LONG).show()

        builder.setPositiveButton("Make Withdrawal") { dialog, _ ->
            val amountEditText = inputView.findViewById<EditText>(R.id.editWithdrawAmount)
            //Toast.makeText(this, "Text entered: $amountEditText", Toast.LENGTH_SHORT).show()
            var amount: Double? = null
            var isValidAmount = false

            while (!isValidAmount) {
                val amountText = amountEditText?.text?.toString()
                //Toast.makeText(this, "amountText = $amountText", Toast.LENGTH_SHORT).show()
                amount = amountText?.toDoubleOrNull()

                //Toast.makeText(this, "amount = $amount", Toast.LENGTH_SHORT).show()

                if (amount != null && amount > 0) {
                    isValidAmount = true
                } else {
                    Toast.makeText(this, "Please enter a valid withdrawal amount.", Toast.LENGTH_SHORT).show()
                    // Clear the EditText to allow the user to enter a valid amount
                    amountEditText?.text?.clear()
                }
            }

            // Retrieve the account number
            val withdrawalEmail = intent.getStringExtra("email") ?: ""

            // Valid withdrawal amount entered, perform withdrawal action
            performWithdrawal(withdrawalEmail, amount!!)
            retrieveAccountInfo(email)

            dialog.dismiss()
        }

        builder.setNegativeButton("Cancel") { dialog, _ ->
            dialog.dismiss()
        }

        val dialog = builder.create()
        dialog.show()
    }

}