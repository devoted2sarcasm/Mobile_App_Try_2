package com.example.ftwbank

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}

class DatabaseMod(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_VERSION = 1
        private const val DATABASE_NAME = "BankingAppDatabase.db"
        private const val TABLE_NAME = "FTWaccounts"
        private const val COLUMN_ACCOUNT_NUMBER = "account_number INTEGER PRIMARY KEY AUTOINCREMENT"
        private const val COLUMN_FNAME = "first_name"
        private const val COLUMN_LNAME = "last_name"
        private const val COLUMN_DOB = "dob"

        //constants for transactions tables
        private const val COLUMN_TRANSACTION_ID = "transaction_id"
        private const val TRANSACTION_TABLE_PREFIX = "Transactions_"
        private const val COLUMN_TRANSACTION_TYPE = "transaction_type"
        private const val COLUMN_BALANCE = "balance"
        private const val COLUMN_TIMESTAMP = "timestamp"
    }

    override fun onCreate(db: SQLiteDatabase) {
        val createTableAccounts = "CREATE TABLE $TABLE_NAME (" +
                "$COLUMN_ACCOUNT_NUMBER INTEGER PRIMARY KEY," +
                "$COLUMN_FNAME TEXT," +
                "$COLUMN_LNAME TEXT," +
                "$COLUMN_DOB TEXT)"
        db.execSQL(createTableAccounts)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Handle database upgrades if needed
    }

    fun insertAccount(fname: String, lname: String, dob: String) {
        val values = ContentValues().apply {
            put(COLUMN_FNAME, fname)
            put(COLUMN_LNAME, lname)
            put(COLUMN_DOB, dob)
        }
        val db = writableDatabase
        val accountNumber = db.insert(TABLE_NAME, null, values)

        //create transactions table
        val createTransactionsTableQuery = "CREATE TABLE IF NOT EXISTS" +
                "$TRANSACTION_TABLE_PREFIX$accountNumber (" +
                "$COLUMN_TRANSACTION_ID INTEGER PRIMARY KEY AUTOINCREMENT," +
                "$COLUMN_TRANSACTION_TYPE TEXT," +
                "$COLUMN_BALANCE REAL," +
                "$COLUMN_TIMESTAMP TIMESTAMP)"
        db.execSQL(createTransactionsTableQuery)

        db.close()
    }

}
