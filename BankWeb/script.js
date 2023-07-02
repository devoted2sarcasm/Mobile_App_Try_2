const SQL = require('sql.js');

const DATABASE_NAME = 'BankingAppDatabase.db';

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

const messageElement = document.getElementById('message');


let db = null;

function retrieveDatabase() {
  if (db === null) {
    // Check if the database file exists
    if (fs.existsSync(DATABASE_NAME)) {
      // Open the existing database
      db = new SQL.Database(DATABASE_NAME);
    } else {
      // The database file doesn't exist, create a new database
      db = new SQL.Database(DATABASE_NAME);

      // Create the accounts table
      const createTableAccounts = `
        CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          ${COLUMN_ACCOUNT_NUMBER} INTEGER PRIMARY KEY AUTOINCREMENT,
          ${COLUMN_FNAME} TEXT,
          ${COLUMN_LNAME} TEXT,
          ${COLUMN_EMAIL} TEXT,
          ${COLUMN_PASS} TEXT
        )
      `;
      db.run(createTableAccounts, (err) => {
        if (err) {
          console.error('Error creating accounts table:', err.message);
        } else {
          console.log('Accounts table created successfully.');
        }
      });
    }
  }

  return db;
}



function insertAccount(fname, lname, email, password) {
  const values = {
    [COLUMN_FNAME]: fname,
    [COLUMN_LNAME]: lname,
    [COLUMN_EMAIL]: email,
    [COLUMN_PASS]: password,
  };

  const columns = Object.keys(values).join(', ');
  const placeholders = Object.keys(values).map(() => '?').join(', ');
  const insertStatement = `
    INSERT INTO ${TABLE_NAME} (${columns})
    VALUES (${placeholders})
  `;

  const params = Object.values(values);

  db.run(insertStatement, params);
}

// Usage example:
insertAccount('John', 'Doe', 'johndoe@example.com', 'password');

function createNewAccount() {
    db = retrieveDatabase();
    const fname = document.getElementById('firstname').value;
    const lname = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if(password != password2) {
        messageElement.textContent = 'Passwords do not match';
        return;
    }
  
    // Check if all fields are filled
    if (!fname || !lname || !email || !password) {
        messageElement.textContent = 'Please fill all fields.';
        return;
    }
  
    // Insert account details
    const values = {
      [COLUMN_FNAME]: fname,
      [COLUMN_LNAME]: lname,
      [COLUMN_EMAIL]: email,
      [COLUMN_PASS]: password,
    };
  
    const columns = Object.keys(values).join(', ');
    const placeholders = Object.keys(values).map(() => '?').join(', ');
    const insertStatement = `
      INSERT INTO ${TABLE_NAME} (${columns})
      VALUES (${placeholders})
    `;
  
    const params = Object.values(values);
  
    db.run(insertStatement, params);
  
    // Create transactions table
    const createTransactionsTableQuery = `
      CREATE TABLE IF NOT EXISTS ${TRANSACTION_TABLE_PREFIX}${email} (
        ${COLUMN_TRANSACTION_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${COLUMN_TRANSACTION_TYPE} TEXT,
        ${COLUMN_TRANSACTION_AMOUNT} DOUBLE,
        ${COLUMN_BALANCE} REAL,
        ${COLUMN_TIMESTAMP} TIMESTAMP
      )
    `;
  
    db.run(createTransactionsTableQuery);
  
    alert('Account created successfully.');
  }
  
  document.getElementById('create').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission
    createNewAccount();
    window.location.href = 'index.html'; // Redirect to index.html
  });



// Save the database to a file
const data = db.export();
const buffer = Buffer.from(data);
fs.writeFileSync(DATABASE_NAME, buffer);

// To load the database from a file
const fileData = fs.readFileSync(DATABASE_NAME);
const loadedDb = new SQL.Database(fileData);

// Run queries on the loaded database as needed
const query = `SELECT * FROM ${TABLE_NAME}`;
const result = loadedDb.exec(query);
console.log(result);


class MainActivity {
  constructor() {
    const loginButton = document.getElementById('login');
    const newAccountButton = document.getElementById('new_account');

    const databaseHelper = new DatabaseHelper();

    loginButton.addEventListener('click', () => {
      databaseHelper.loginButtonClicked();
    });

    newAccountButton.addEventListener('click', () => {
      databaseHelper.newAccountButtonClicked();
    });
  }
}

class DatabaseHelper {
  constructor() {
    this.DATABASE_VERSION = 1;
    this.DATABASE_NAME = 'BankingAppDatabase.db';
    this.TABLE_NAME = 'FTWaccounts';
    this.COLUMN_ACCOUNT_NUMBER = 'account_number';
    this.COLUMN_FNAME = 'first_name';
    this.COLUMN_LNAME = 'last_name';
    this.COLUMN_EMAIL = 'email';
    this.COLUMN_PASS = 'pass';

    // Constants for transactions tables
    this.COLUMN_TRANSACTION_ID = 'transaction_id';
    this.TRANSACTION_TABLE_PREFIX = 'Transactions_';
    this.COLUMN_TRANSACTION_TYPE = 'transaction_type';
    this.COLUMN_BALANCE = 'balance';
    this.COLUMN_TIMESTAMP = 'timestamp';
    this.COLUMN_TRANSACTION_AMOUNT = 'amount';

    this.createTableAccounts();
  }

  createTableAccounts() {
    const createTableAccounts = `CREATE TABLE IF NOT EXISTS ${this.TABLE_NAME} (${this.COLUMN_ACCOUNT_NUMBER} INTEGER PRIMARY KEY AUTOINCREMENT, ${this.COLUMN_FNAME} TEXT, ${this.COLUMN_LNAME} TEXT, ${this.COLUMN_EMAIL} TEXT, ${this.COLUMN_PASS} TEXT)`;
    // Execute the SQL statement to create the table in the database
    // ...
  }

  /*function insertAccount(fname, lname, email, password) {
    const values = {
      [COLUMN_FNAME]: fname,
      [COLUMN_LNAME]: lname,
      [COLUMN_EMAIL]: email,
      [COLUMN_PASS]: password,
    };
  
    const db = getWritableDatabase(); // Assuming you have a function to get the writable database
  
    db.insertOrThrow(TABLE_NAME, null, values);
  
    // Create transactions table
    const createTransactionsTableQuery = `CREATE TABLE IF NOT EXISTS ${TRANSACTION_TABLE_PREFIX}${email} (${COLUMN_TRANSACTION_ID} INTEGER PRIMARY KEY AUTOINCREMENT, ${COLUMN_TRANSACTION_TYPE} TEXT, ${COLUMN_TRANSACTION_AMOUNT} DOUBLE, ${COLUMN_BALANCE} REAL, ${COLUMN_TIMESTAMP} TIMESTAMP)`;
    db.execSQL(createTransactionsTableQuery);
  
    db.close();
  }*/
  

  loginButtonClicked() {
    this.accountLoginDialog((email, password) => {
      if (this.validateCredentials(email, password)) {
        this.launchAccountActivity(email);
      } else {
        this.showToast('Login Failed');
      }
    });
  }

  launchAccountActivity(email) {
    // Launch the account activity
    // ...
  }

  validateCredentials(email, password) {
    // Validate the credentials
    // ...
  }

  accountLoginDialog(callback) {
    // Display the account login dialog
    // ...
  }

  accountCreationDialog() {
    // Display the account creation dialog
    // ...
  }

  showToast(message) {
    // Show a toast message
    // ...
  }
}

// Entry point
window.addEventListener('DOMContentLoaded', () => {
  new MainActivity();
});

const accountNamePlaceholder = document.getElementById("name-placeholder");
const accountNumberPlaceholder = document.getElementById("account-number-placeholder");
const balancePlaceholder = document.getElementById("balance-placeholder");
const inputAmount = document.getElementById("input-amount");

document.getElementById("deposit").addEventListener("click", makeDeposit);
document.getElementById("account-history").addEventListener("click", showTransactionHistory);
document.getElementById("withdraw").addEventListener("click", makeWithdrawal);
document.getElementById("logout").addEventListener("click", logout);

function retrieveAccountInfo(email) {
          // Retrieve the account name, number, and balance
    const accountName = retrieveAccountName(email);
    const accountNumber = retrieveAccountNumber(email);
    const balance = retrieveCurrentBalance(email);

          // Update the placeholders in the HTML
    accountNamePlaceholder.textContent = accountName;
    accountNumberPlaceholder.textContent = accountNumber;
    balancePlaceholder.textContent = balance;
}

function retrieveAccountName(email) {
    const query = `SELECT ${DatabaseHelper.COLUMN_ACCOUNT_NAME} FROM ${DatabaseHelper.TABLE_NAME} WHERE ${DatabaseHelper.COLUMN_EMAIL} = ?`;
    const cursor = db.rawQuery(query, [email]);

    let accountName = "";
    if (cursor.moveToFirst()) {
        accountName = cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_ACCOUNT_NAME));
    }

    cursor.close();

    return accountName;
}

function retrieveAccountNumber(email) {
    const query = `SELECT ${DatabaseHelper.COLUMN_ACCOUNT_NUMBER} FROM ${DatabaseHelper.TABLE_NAME} WHERE ${DatabaseHelper.COLUMN_EMAIL} = ?`;
    const cursor = db.rawQuery(query, [email]);

    let accountNumber = "";
    if (cursor.moveToFirst()) {
    accountNumber = cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_ACCOUNT_NUMBER));
    }

    cursor.close();

    return accountNumber;
}

function retrieveCurrentBalance(email) {
    const query = `SELECT ${DatabaseHelper.COLUMN_CURRENT_BALANCE} FROM ${DatabaseHelper.TABLE_NAME} WHERE ${DatabaseHelper.COLUMN_EMAIL} = ?`;
    const cursor = db.rawQuery(query, [email]);

    let currentBalance = 0;
    if (cursor.moveToFirst()) {
    currentBalance = cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_CURRENT_BALANCE));
    }

    cursor.close();

    return currentBalance;
}

function makeDeposit() {
    const amount = parseFloat(inputAmount.value);

    if (!isNaN(amount) && amount > 0) {
    const email = "user@example.com"; // Replace with the user's email
    performDeposit(email, amount);
    } else {
    alert("Please enter a valid deposit amount.");
    }
}

function performDeposit(email, amount) {
    const timestamp = new Date().toISOString();
    const currentBalance = retrieveCurrentBalance(email);
    const newBalance = currentBalance + amount;

    const transaction = new Transaction(TransactionType.DP, amount, timestamp, newBalance);

    const tableName = `${DatabaseHelper.TRANSACTION_TABLE_PREFIX}${email}`;
    const values = {
    [DatabaseHelper.COLUMN_TRANSACTION_TYPE]: transaction.transactionType.toString(),
    [DatabaseHelper.COLUMN_TRANSACTION_AMOUNT]: transaction.transactionAmount,
    [DatabaseHelper.COLUMN_TIMESTAMP]: transaction.timestamp,
    [DatabaseHelper.COLUMN_BALANCE]: newBalance
    };

    databaseHelper.insert(tableName, values);

    retrieveAccountInfo(email);

    alert("Deposit made successfully.");
}

function showTransactionHistory() {
    const email = "user@example.com"; // Replace with the user's email
    const transactions = fetchTransactionHistory(email);

    // Display the transaction history in a dialog or another suitable way
    console.log(transactions);
}

function fetchTransactionHistory(email) {
    const transactions = [];

    const query = `SELECT * FROM ${DatabaseHelper.TRANSACTION_TABLE_PREFIX}${email} ORDER BY ${DatabaseHelper.COLUMN_TRANSACTION_ID} DESC LIMIT 10`;
    const cursor = db.rawQuery(query, null);

    if (cursor.moveToFirst()) {
    while (!cursor.isAfterLast) {
        const t_type = cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_TRANSACTION_TYPE));
        const t_amount = cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_TRANSACTION_AMOUNT));
        const balance = cursor.getDouble(cursor.getColumnIndex(DatabaseHelper.COLUMN_BALANCE));
        const timestamp = cursor.getString(cursor.getColumnIndex(DatabaseHelper.COLUMN_TIMESTAMP));

        const transaction = new Transaction(
        TransactionType.valueOf(t_type),
        t_amount,
        timestamp,
        balance
        );
        transactions.push(transaction);

        cursor.moveToNext();
    }
    }

    return transactions;
}

function makeWithdrawal() {
    const amount = parseFloat(inputAmount.value);

    if (!isNaN(amount) && amount > 0) {
    const email = "user@example.com"; // Replace with the user's email
    const currentBalance = retrieveCurrentBalance(email);

    if (currentBalance >= amount) {
        performWithdrawal(email, amount);
    } else {
        alert("Insufficient funds.");
    }
    } else {
    alert("Please enter a valid withdrawal amount.");
    }
}

function performWithdrawal(email, amount) {
    const timestamp = new Date().toISOString();
    const currentBalance = retrieveCurrentBalance(email);
    const newBalance = currentBalance - amount;

    const transaction = new Transaction(TransactionType.WD, amount, timestamp, newBalance);

    const tableName = `${DatabaseHelper.TRANSACTION_TABLE_PREFIX}${email}`;
    const values = {
    [DatabaseHelper.COLUMN_TRANSACTION_TYPE]: transaction.transactionType.toString(),
    [DatabaseHelper.COLUMN_TRANSACTION_AMOUNT]: transaction.transactionAmount,
    [DatabaseHelper.COLUMN_TIMESTAMP]: transaction.timestamp,
    [DatabaseHelper.COLUMN_BALANCE]: newBalance
    };

    databaseHelper.insert(tableName, values);

    retrieveAccountInfo(email);

    alert("Withdrawal made successfully.");
}

function logout() {
    // Handle the logout functionality here
    console.log("Logout clicked.");
}