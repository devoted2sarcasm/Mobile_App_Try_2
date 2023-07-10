document.addEventListener('DOMContentLoaded', function() {

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

// Check if IndexedDB is supported by the browser
if ('indexedDB' in window) {
    // Open or create a database
    const request = window.indexedDB.open(DATABASE_NAME, 5);
  
    // Handle database upgrade, success, and error events
    request.onupgradeneeded = function(event) {
      db = event.target.result;
  
      // Create the object store if it doesn't exist
      if (!db.objectStoreNames.contains(TABLE_NAME)) {
        const objectStore = db.createObjectStore(TABLE_NAME, { keyPath: COLUMN_ACCOUNT_NUMBER, autoIncrement: true });
        objectStore.createIndex('emailIndex', COLUMN_EMAIL, { unique: true },);
      }
    };
  
    request.onsuccess = function(event) {
      db = event.target.result;
      console.log('Database opened successfully!');
      //console.log(document.getElementById('create'));
      document.getElementById('create').onclick = function() {
        createAccount(db);
      };
    };
  
    request.onerror = function(event) {
      console.error('Database error:', event.target.error);
    };
  } else {
    console.error('IndexedDB is not supported by this browser.');
  }

const messageElement = document.getElementById('message');

function createAccount(db) {
    const transaction = db.transaction([TABLE_NAME], 'readwrite');

    if (!db.objectStoreNames.contains(TABLE_NAME)) {
      const objectStore = db.createObjectStore(TABLE_NAME, { keyPath: COLUMN_ACCOUNT_NUMBER, autoIncrement: true });
      objectStore.createIndex('emailIndex', COLUMN_EMAIL, { unique: true },);
    }
    const objectStore = transaction.objectStore(TABLE_NAME);
  
    // Get form field values
    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password2').value;
    const deposit = parseFloat(document.getElementById('deposit').value);
  
    // Validate form fields
    if (!firstName || !lastName || !email || !deposit || !password || !confirmPassword) {
      showMessage('Please complete all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      showMessage('Passwords do not match.');
      return;
    }
  
    // Create a new account object
    const account = {
      [COLUMN_FNAME]: firstName,
      [COLUMN_LNAME]: lastName,
      [COLUMN_EMAIL]: email,
      [COLUMN_PASS]: password
    };
  
    const request = objectStore.add(account);
  
    request.onsuccess = function(event) {
      console.log('Account created successfully!');
      showMessage('Account created successfully!');
      createUserTransactionsTable(db, deposit, email); 
      window.location.href = 'index.html';
    };
  
    request.onerror = function(event) {
      showMessage('Account creation failed!');
    };
  
    // Clear form fields
    document.getElementById('firstname').value = '';
    document.getElementById('lastname').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password2').value = '';
  }
  

// Function to display messages
function showMessage(message) {
  messageElement.textContent = message;
}

// Function to create user transactions table
function createUserTransactionsTable(db, deposit, email) {
    const timestamp = new Date().getTime();
    const transactionType = 'Deposit';
    const transactionTable = TRANSACTION_TABLE_PREFIX + email;
    console.log(transactionTable);

    const transaction = db.transaction([transactionTable], 'readwrite');

    if (!transaction.objectStoreNames.contains(transactionTable)) {
      const objectStore = db.createObjectStore(transactionTable, { keyPath: COLUMN_TRANSACTION_ID, autoIncrement: true });
      objectStore.createIndex('timestampIndex', COLUMN_TIMESTAMP, { unique: true },);
  }
    const objectStore = transaction.objectStore(transactionTable);

    const transactionData = {
      [COLUMN_TRANSACTION_TYPE]: transactionType,
      [COLUMN_TRANSACTION_AMOUNT]: deposit,
      [COLUMN_TIMESTAMP]: timestamp,
      [COLUMN_BALANCE]: deposit
    }
  
    const request = objectStore.add(transactionData);
  
    request.onsuccess = function(event) {
      console.log(`User transactions table created for ${email}`);
      const transactionRow = event.target.result;
      console.log(`Transaction row: `, transactionRow);
    };
  
    request.onerror = function(event) {
      console.error(`Failed to retrieve user for email ${email}`);
    };
}
});