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

const OPEN_OR_CREATE = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    ${COLUMN_ACCOUNT_NUMBER} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${COLUMN_FNAME} TEXT NOT NULL,
    ${COLUMN_LNAME} TEXT NOT NULL,
    ${COLUMN_EMAIL} TEXT UNIQUE NOT NULL,
    ${COLUMN_PASS} TEXT NOT NULL
  )`;

const messageElement = document.getElementById('message');

function createAccount() {
    // Get form field values
    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password2').value;
  
    // Validate form fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showMessage('Please complete all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      showMessage('Passwords do not match.');
      return;
    }
  
    // Create a new account object
    const account = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      pass: password
    };
  
    // Perform the necessary actions to create the account
    const db = new SQL.Database();
    db.run(OPEN_OR_CREATE);

    const insertQuery = `INSERT INTO ${TABLE_NAME} (${COLUMN_FNAME}, ${COLUMN_LNAME}, ${COLUMN_EMAIL}, ${COLUMN_PASS})
    VALUES (:firstName, :lastName, :email, :password)`;
    
    const insertStatement = db.prepare(insertQuery);
    insertStatement.run(account);
    insertStatement.free();
    createUserTransactionsTable(email);

    // Close the database
    const data = db.export();
    const Uint8Array = new Uint8Array(data);
    const blob = new Blob([Uint8Array], { type: 'application/octet-stream' });

    saveAs(blob, DATABASE_NAME);

    db.close();


    // Clear form fields
    document.getElementById('firstname').value = '';
    document.getElementById('lastname').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password2').value = '';
  
    showMessage('Account created successfully!');

    window.location.href = 'index.html';
  }
  
  // Function to display messages
  function showMessage(message) {
    messageElement.textContent = message;
  }
  
  // Function to create user transactions table
  function createUserTransactionsTable(email) {
    const db = new SQL.Database();
    db.run(OPEN_OR_CREATE);
  
    const createQuery = `CREATE TABLE IF NOT EXISTS ${TRANSACTION_TABLE_PREFIX}${email} (
      ${COLUMN_TRANSACTION_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${COLUMN_TRANSACTION_TYPE} TEXT NOT NULL,
      ${COLUMN_BALANCE} REAL NOT NULL,
      ${COLUMN_TIMESTAMP} TEXT NOT NULL,
      ${COLUMN_TRANSACTION_AMOUNT} REAL NOT NULL
    )`;
  
    db.run(createQuery);
  }