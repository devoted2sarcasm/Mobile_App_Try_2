//
//  DatabaseManager.swift
//  FTW_Bank
//
//  Created by user241217 on 7/18/23.
//

import Foundation
import SQLite

class DatabaseManager {
    static let shared = DatabaseManager()
    private var db: Connection?

    private let usersTable = Table("users")
    private let transactionsTable = Table("transactions")

    private let accountNumber = Expression<Int>("account_number")
    private let name = Expression<String>("name")
    private let email = Expression<String>("email")
    private let password = Expression<String>("password")

    private let transactionNumber = Expression<Int>("transaction_number")
    private let transactionEmail = Expression<String>("email")
    private let amount = Expression<Double>("amount")
    private let timestamp = Expression<Date>("timestamp")
    private let balance = Expression<Double>("balance")
    private let isDeposit = Expression<Bool>("transaction_type")

    private init() {
        connect()
        createTables()
    }

    private func connect() {
        do {
            let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
            db = try Connection("\(path)/BankingAppDatabase.sqlite")
        } catch {
            print("Error connecting to database: \(error)")
        }
    }

    private func createTables() {
        guard let db = db else {
            return
        }

        do {
            try db.run(usersTable.create { table in
                table.column(accountNumber, primaryKey: true)
                table.column(name)
                table.column(email, unique: true)
                table.column(password)
            })

            try db.run(transactionsTable.create { table in
                table.column(transactionNumber, primaryKey: true)
                table.column(transactionEmail)
                table.column(amount)
                table.column(timestamp)
                table.column(balance)
            })

        } catch {
            print("Error creating tables: \(error)")
        }
    }

    // MARK: - Users Table

    func insertUser(name: String, email: String, password: String) -> Bool {
        guard let db = db else {
            return false
        }

        do {
            let insert = usersTable.insert(self.name <- name, self.email <- email, self.password <- password)
            try db.run(insert)
            return true
        } catch {
            print("Error inserting user: \(error)")
            return false
        }
    }
    
    func isValidUser(email: String, password: String) -> Bool {
        guard let db = db else {
            return false
        }

        do {
            let query = usersTable.filter(self.email == email && self.password == password)
            let count = try db.scalar(query.count)

            return count > 0
        } catch {
            print("Error checking user credentials: \(error)")
            return false
        }
    }

    func getUser(email: String) -> User? {
        guard let db = db else {
            return nil
        }

        do {
            let query = usersTable.filter(self.email == email)
            guard let row = try db.pluck(query) else {
                return nil
            }

            let user = User(
                accountNumber: row[accountNumber],
                name: row[name],
                email: row[self.email],
                password: row[password]
            )
            return user
        } catch {
            print("Error fetching user: \(error)")
        }

        return nil
    }


    // MARK: - Transactions Table

    func insertTransaction(email: String, amount: Double, timestamp: Date, balance: Double, isDeposit: Bool) -> Bool {
        guard let db = db else {
            return false
        }

        do {
            let insert = transactionsTable.insert(
                transactionEmail <- email,
                self.amount <- amount,
                self.timestamp <- timestamp,
                self.balance <- balance,
                self.isDeposit <- isDeposit
            )
            try db.run(insert)

            print("Transaction inserted successfully.")
            return true
        } catch {
            print("Error inserting transaction: \(error)")
            return false
        }
    }


    func getRecentTransactions(email: String, limit: Int) -> [Transaction] {
        guard let db = db else {
            return []
        }

        var transactions: [Transaction] = []

        do {
            let query = transactionsTable
                .filter(transactionEmail == email)
                .order(transactionNumber.desc)
                .limit(limit)

            let rows = try db.prepare(query)

            for row in rows {
                let transaction = Transaction(
                    transactionNumber: row[transactionNumber],
                    email: row[transactionEmail],
                    amount: row[amount],
                    timestamp: row[timestamp],
                    balance: row[balance],
                    isDeposit: row[isDeposit]
                )
                transactions.append(transaction)
            }
        } catch {
            print("Error fetching recent transactions: \(error)")
        }

        return transactions
    }
    
    func getMostRecentTransaction(email: String) -> Transaction? {
        guard let db = db else {
            return nil
        }

        do {
            let query = transactionsTable
                .filter(transactionEmail == email)
                .order(timestamp.desc) // Order by timestamp in descending order to get the most recent transaction first
                .limit(1) // Limit to one result only

            if let row = try db.pluck(query) {
                let transaction = Transaction(
                    transactionNumber: row[transactionNumber],
                    email: row[transactionEmail],
                    amount: row[amount],
                    timestamp: row[timestamp],
                    balance: row[balance],
                    isDeposit: row[isDeposit]
                )
                return transaction
            }
        } catch {
            print("Error fetching most recent transaction: \(error)")
        }

        return nil
    }
}



struct User {
    let accountNumber: Int
    let name: String
    let email: String
    let password: String
}

struct Transaction {
    let transactionNumber: Int
    let email: String
    let amount: Double
    let timestamp: Date
    let balance: Double
    let isDeposit: Bool
}
