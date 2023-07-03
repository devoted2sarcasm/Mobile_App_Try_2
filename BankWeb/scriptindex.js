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
        
        document.getElementById('login').addEventListener('click', function(event) {
          event.preventDefault();
          validateCredentials(db);
        });
        
      };
    
      request.onerror = function(event) {
        console.error('Database error:', event.target.error);
      };
    } else {
      console.error('IndexedDB is not supported by this browser.');
    }
  
  const messageElement = document.getElementById('message');
  

  
  // Function to display messages
  function showMessage(message) {
    messageElement.textContent = message;
  }

  
  function validateCredentials(db) {
    console.log('Validating credentials...');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(email);
    console.log(password);
  
    // Open a transaction to access the object store
    const transaction = db.transaction([TABLE_NAME], 'readonly');
    const objectStore = transaction.objectStore(TABLE_NAME);
  
    // Retrieve the user by username
    const request = objectStore.index(COLUMN_EMAIL).get(email);
  
    request.onsuccess = function(event) {
      const user = event.target.result;
  
      if (user && user[COLUMN_PASS] === password) {
        // Successful login
        showMessage('Login successful!');
        sessionStorage.setItem('email', user[COLUMN_EMAIL])
        // Redirect to the dashboard or other page
        window.location.href = 'accountinfo.html';
      } else {
        // Invalid credentials
        showMessage('Invalid email or password.');
      }
    };
  
    request.onerror = function(event) {
      showMessage('Error accessing the database.');
      console.error(event.target.error);
    };
  }
  

});