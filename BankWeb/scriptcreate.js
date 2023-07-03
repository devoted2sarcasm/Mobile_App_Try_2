document.addEventListener('DOMContentLoaded', function() {

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

// Check if IndexedDB is supported by the browser
if ('indexedDB' in window) {
    // Open or create a database
    const request = window.indexedDB.open(DATABASE_NAME, 2);
    let db;
  
    // Handle database upgrade, success, and error events
    request.onupgradeneeded = function(event) {
      db = event.target.result;
  
      // Create the object store if it doesn't exist
      if (!db.objectStoreNames.contains(TABLE_NAME)) {
        const objectStore = db.createObjectStore(TABLE_NAME, { keyPath: COLUMN_ACCOUNT_NUMBER, autoIncrement: true });
        objectStore.createIndex(COLUMN_EMAIL, COLUMN_EMAIL, { unique: true });
      }
    };
  
    request.onsuccess = function(event) {
      db = event.target.result;
      console.log('Database opened successfully!');
      //console.log(document.getElementById('create'));
      document.getElementById('create').onclick = function() {
        createAccount(db);
      };
      document.getElementById('login').onclick = function() {
        validateCredentials(db);
      }    
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
    const objectStore = transaction.objectStore(TABLE_NAME);
  
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
      [COLUMN_FNAME]: firstName,
      [COLUMN_LNAME]: lastName,
      [COLUMN_EMAIL]: email,
      [COLUMN_PASS]: password
    };
  
    const request = objectStore.add(account);
  
    request.onsuccess = function(event) {
      console.log('Account created successfully!');
      showMessage('Account created successfully!');
      createUserTransactionsTable(db); 
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
function createUserTransactionsTable(db) {
    const email = document.getElementById('email').value;
  
    const createQuery = `CREATE TABLE IF NOT EXISTS ${TRANSACTION_TABLE_PREFIX}${email} (
      ${COLUMN_TRANSACTION_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${COLUMN_TRANSACTION_TYPE} TEXT NOT NULL,
      ${COLUMN_BALANCE} REAL NOT NULL,
      ${COLUMN_TIMESTAMP} TEXT NOT NULL,
      ${COLUMN_TRANSACTION_AMOUNT} REAL NOT NULL
    )`;
  
    const transaction = db.transaction([TABLE_NAME], 'readwrite');
    transaction.oncomplete = function(event) {
      console.log(`User transactions table created for ${email}`);
    };
  
    transaction.onerror = function(event) {
      console.error(`Failed to create user transactions table for ${email}`);
    };
  
    const objectStore = transaction.objectStore(TABLE_NAME);
    const request = objectStore.get(email);
  
    request.onsuccess = function(event) {
      const user = event.target.result;
      if (user) {
        const transactionTableRequest = db.transaction([], 'readwrite').objectStore(`${TRANSACTION_TABLE_PREFIX}${email}`).createIndex(COLUMN_TRANSACTION_ID, COLUMN_TRANSACTION_ID, { unique: true });
        transactionTableRequest.onsuccess = function() {
          console.log(`User transactions table created for ${email}`);
        };
        transactionTableRequest.onerror = function() {
          console.error(`Failed to create user transactions table for ${email}`);
        };
      } else {
        console.error(`User not found for email ${email}`);
      }
    };
  
    request.onerror = function(event) {
      console.error(`Failed to retrieve user for email ${email}`);
    };
  }