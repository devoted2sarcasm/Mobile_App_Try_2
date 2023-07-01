package com.example.ftwbank

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity


class MainActivity : AppCompatActivity() {

    private lateinit var inflater: LayoutInflater

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        inflater = LayoutInflater.from(this)

        val loginButton = findViewById<Button>(R.id.login)
        val newAccountButton = findViewById<Button>(R.id.new_account)

        val databaseHelper = DatabaseHelper(this)

        loginButton.setOnClickListener {
            databaseHelper.loginButtonClicked()
        }

        newAccountButton.setOnClickListener {
            databaseHelper.newAccountButtonClicked()
        }
    }
}

class DatabaseHelper(private val context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        const val DATABASE_VERSION = 1
        const val DATABASE_NAME = "BankingAppDatabase.db"
        const val TABLE_NAME = "FTWaccounts"
        const val COLUMN_ACCOUNT_NUMBER = "account_number"
        const val COLUMN_FNAME = "first_name"
        const val COLUMN_LNAME = "last_name"
        const val COLUMN_EMAIL = "email"
        const val COLUMN_PASS = "pass"

        //constants for transactions tables
        const val COLUMN_TRANSACTION_ID = "transaction_id"
        const val TRANSACTION_TABLE_PREFIX = "Transactions_"
        const val COLUMN_TRANSACTION_TYPE = "transaction_type"
        const val COLUMN_BALANCE = "balance"
        const val COLUMN_TIMESTAMP = "timestamp"
        const val COLUMN_TRANSACTION_AMOUNT = "amount"
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createTableAccounts = "CREATE TABLE IF NOT EXISTS $TABLE_NAME ($COLUMN_ACCOUNT_NUMBER INTEGER PRIMARY KEY AUTOINCREMENT, $COLUMN_FNAME TEXT, $COLUMN_LNAME TEXT, $COLUMN_EMAIL TEXT, $COLUMN_PASS TEXT)"
        db.execSQL(createTableAccounts)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Handle database upgrades if needed
    }

    private fun insertAccount(fname: String, lname: String, email: String, password: String) {
        val values = ContentValues().apply {
            put(COLUMN_FNAME, fname)
            put(COLUMN_LNAME, lname)
            put(COLUMN_EMAIL, email)
            put(COLUMN_PASS, password)
        }
        val db = writableDatabase
        db.insertOrThrow(TABLE_NAME, null, values)

        // Create transactions table
        val createTransactionsTableQuery = "CREATE TABLE IF NOT EXISTS " +
                "$TRANSACTION_TABLE_PREFIX$email (" +
                "$COLUMN_TRANSACTION_ID INTEGER PRIMARY KEY AUTOINCREMENT," +
                "$COLUMN_TRANSACTION_TYPE TEXT," +
                "$COLUMN_TRANSACTION_AMOUNT DOUBLE," +
                "$COLUMN_BALANCE REAL," +
                "$COLUMN_TIMESTAMP TIMESTAMP)"
        db.execSQL(createTransactionsTableQuery)

        db.close()
    }

    fun loginButtonClicked() {
        accountLoginDialog { email, password ->
            if (validateCredentials(email, password)) {
                launchAccountActivity(email)
            } else {
                showToast("Login Failed")
            }
        }
    }


    private fun launchAccountActivity(email: String) {
        val intent = Intent(context, AccountActivity::class.java)
        intent.putExtra("email", email)
        context.startActivity(intent)
    }

    fun newAccountButtonClicked() {
        accountCreationDialog()
    }

    private fun validateCredentials(email: String, password: String): Boolean {
        val db = readableDatabase
        val selection = "$COLUMN_EMAIL = ? AND $COLUMN_PASS = ?"
        val selectionArgs = arrayOf(email, password)
        val cursor = db.query(
            TABLE_NAME,
            null,
            selection,
            selectionArgs,
            null,
            null,
            null,
            null
        )

        val isValid = cursor.count > 0

        cursor.close()
        db.close()

        return isValid
    }



    private fun accountLoginDialog(callback: (String, String) -> Unit) {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.account_login_dialog, null)

        val dialogBuilder = AlertDialog.Builder(context)
            .setView(dialogView)
            .setTitle("Login to Your Account")
            .setPositiveButton("Login") { dialog, _ ->
                val loginEmailEntered = dialogView.findViewById<EditText>(R.id.edit_email_login)
                val loginPassEntered = dialogView.findViewById<EditText>(R.id.edit_pass_login)

                val email = loginEmailEntered.text.toString()
                val password = loginPassEntered.text.toString()

                dialog.dismiss()
                callback(email, password)
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }

        val dialog = dialogBuilder.create()
        dialog.show()
    }


    private fun accountCreationDialog() {
        val dialogView = LayoutInflater.from(context).inflate(R.layout.dialog_account_creation, null)

        val dialogBuilder = AlertDialog.Builder(context)
            .setView(dialogView)
            .setTitle("Create New Account")
            .setPositiveButton("Create") { dialog, _ ->
                val firstName = dialogView.findViewById<EditText>(R.id.edit_fname).text.toString()
                val lastName = dialogView.findViewById<EditText>(R.id.edit_lname).text.toString()
                val enterEmail = dialogView.findViewById<EditText>(R.id.edit_email).text.toString()
                val enterPass = dialogView.findViewById<EditText>(R.id.edit_pass).text.toString()

                insertAccount(firstName, lastName, enterEmail, enterPass)

                Toast.makeText(context, "Account created successfully", Toast.LENGTH_SHORT).show()

                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }

        val dialog = dialogBuilder.create()
        dialog.show()
    }

    private fun showToast(message: String) {
        Toast.makeText(context, message, Toast.LENGTH_LONG).show()
    }
}
