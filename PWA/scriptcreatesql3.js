const sqlite = require('sqlite');
const fs = require('fs');

const DATABASE_NAME = 'FTWDatabase.db';
const TABLE_NAME = 'FTWaccounts';
const COLUMN_ACCOUNT_NUMBER = 'account_number';
const COLUMN_FNAME = 'first_name';
const COLUMN_LNAME = 'last_name';
const COLUMN_EMAIL = 'email';
const COLUMN_PASS = 'pass';
const TRANSACTION_TABLE_PREFIX = 'Transactions_';
const COLUMN_TRANSACTION_ID = 'transaction_id';
const COLUMN_TRANSACTION_TYPE = 'transaction_type';
const COLUMN_BALANCE = 'balance';
const COLUMN_TIMESTAMP = 'timestamp';
const COLUMN_TRANSACTION_AMOUNT = 'amount';

const OPEN_OR_CREATE = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
  ${COLUMN_ACCOUNT_NUMBER} INTEGER PRIMARY KEY AUTOINCREMENT,
  ${COLUMN_FNAME} TEXT NOT NULL,
  ${COLUMN_LNAME} TEXT NOT NULL,
  ${COLUMN_EMAIL} TEXT UNIQUE NOT NULL,
  ${COLUMN_PASS} TEXT NOT NULL
)`;

let db;

function showMessage(message) {
  console.log(message);
}

function createAccount() {
  const transactionTable = TRANSACTION_TABLE_PREFIX + email;

  const db = new sqlite3.Database(DATABASE_NAME, (error) => {
    if (error) {
      console.error('Error opening DB:', error);
      return;
    }

    db.run(OPEN_OR_CREATE, (error) => {
      if (error) {
        console.error('Error creating table:', error);
        return;
      }

    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password2').value;
    const deposit = parseFloat(document.getElementById('deposit').value);
    
    const transactionTable = TRANSACTION_TABLE_PREFIX + email;

      // Validate form fields
      if (!firstName || !lastName || !email || !deposit || !password || !confirmPassword) {
        showMessage('Please complete all fields.');
        return;
      }

      if (password !== confirmPassword) {
        showMessage('Passwords do not match.');
        return;
      }

      const account = {
        [COLUMN_FNAME]: firstName,
        [COLUMN_LNAME]: lastName,
        [COLUMN_EMAIL]: email,
        [COLUMN_PASS]: password
      };

      db.run(`INSERT INTO ${TABLE_NAME} (${COLUMN_FNAME}, ${COLUMN_LNAME}, ${COLUMN_EMAIL}, ${COLUMN_PASS}) VALUES (?, ?, ?, ?)`, [firstName, lastName, email, password], function(error) {
        if (error) {
          console.log('Account creation failed:', error);
          return;
        }

        showMessage('Account created successfully!');

        const firstUserTransaction = {
          [COLUMN_TRANSACTION_TYPE]: 'Deposit',
          [COLUMN_TRANSACTION_AMOUNT]: deposit,
          [COLUMN_TIMESTAMP]: new Date().toLocaleString(),
          [COLUMN_BALANCE]: deposit
        };

        db.run(`CREATE TABLE IF NOT EXISTS ${transactionTable} (
          ${COLUMN_TRANSACTION_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${COLUMN_TRANSACTION_TYPE} TEXT NOT NULL,
          ${COLUMN_TRANSACTION_AMOUNT} REAL NOT NULL,
          ${COLUMN_TIMESTAMP} TEXT NOT NULL,
          ${COLUMN_BALANCE} REAL NOT NULL
        )`, (error) => {
          if (error) {
            console.error('Error creating transaction table:', error);
            return;
          }

          db.run(`INSERT INTO ${transactionTable} (${COLUMN_TRANSACTION_TYPE}, ${COLUMN_TRANSACTION_AMOUNT}, ${COLUMN_TIMESTAMP}, ${COLUMN_BALANCE}) VALUES (?, ?, ?, ?)`, [firstUserTransaction[COLUMN_TRANSACTION_TYPE], firstUserTransaction[COLUMN_TRANSACTION_AMOUNT], firstUserTransaction[COLUMN_TIMESTAMP], firstUserTransaction[COLUMN_BALANCE]], function(error) {
            if (error) {
              console.log('Error adding first transaction:', error);
              return;
            }

            console.log('First transaction added successfully!');
            db.close();
          });
        });
      });
    });
  });
}

