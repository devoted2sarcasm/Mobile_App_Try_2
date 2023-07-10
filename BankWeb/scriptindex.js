document.addEventListener('DOMContentLoaded', function() {

    const DATABASE_NAME = 'FTWDatabase.db';
    const TABLE_NAME = 'User_Accounts';
    const COLUMN_ACCOUNT_NUMBER = 'account_number';
    const COLUMN_FNAME = 'first_name';
    const COLUMN_LNAME = 'last_name';
    const COLUMN_EMAIL = 'email';
    const COLUMN_PASS = 'pass';
    const TRANSACTION_TABLE_NAME = 'User_Transactions';
    const COLUMN_TRANSACTION_ID = 'transaction_id';
    const COLUMN_TRANSACTION_TYPE = 'transaction_type';
    const COLUMN_BALANCE = 'balance';
    const COLUMN_TIMESTAMP = 'timestamp';
    const COLUMN_TRANSACTION_AMOUNT = 'amount';
    const TRANSACTION_TYPE_DEP = 'Deposit';
    const TRANSACTION_TYPE_WD = 'Withdrawal';

    const messageElement = document.getElementById('message');

    let db;

  // Check if IndexedDB is supported by the browser
  if ('indexedDB' in window) {
    const request = window.indexedDB.open(DATABASE_NAME, 5);

    request.onupgradeneeded = function(event) {
        db = event.target.result;

        if(!db.objectStoreNames.contains(TABLE_NAME)) {
            const objectStore = db.createObjectStore(TABLE_NAME, { keyPath: COLUMN_ACCOUNT_NUMBER, autoIncrement: true });
            objectStore.createIndex('emailIndex', COLUMN_EMAIL, { unique: true });
            objectStore.createIndex('passIndex', COLUMN_PASS, { unique: false });
            objectStore.createIndex('fnameIndex', COLUMN_FNAME, { unique: false });
            objectStore.createIndex('lnameIndex', COLUMN_LNAME, { unique: false });                
        }

        if (!db.objectStoreNames.contains(TRANSACTION_TABLE_NAME)) {
            const transactionStore = db.createObjectStore(TRANSACTION_TABLE_NAME, { keyPath: COLUMN_TRANSACTION_ID, autoIncrement: true });
            transactionStore.createIndex(COLUMN_ACCOUNT_NUMBER, COLUMN_ACCOUNT_NUMBER, { unique: false });
            transactionStore.createIndex(COLUMN_TRANSACTION_TYPE, COLUMN_TRANSACTION_TYPE, { unique: false });
            transactionStore.createIndex(COLUMN_TRANSACTION_AMOUNT, COLUMN_TRANSACTION_AMOUNT, { unique: false });
            transactionStore.createIndex(COLUMN_BALANCE, COLUMN_BALANCE, { unique: false });
            transactionStore.createIndex(COLUMN_TIMESTAMP, COLUMN_TIMESTAMP, { unique: false });
        }

        console.log('Database upgraded successfully!');
    };

    request.onerror = function(event) {
        console.error('Database error:', event.target.error);           
    };

    request.onsuccess = function(event) {
        db = event.target.result;
        console.log('Database opened successfully!');
        document.getElementById('create').onclick = function() {
            createAccount();
        };
    };
} else {
    console.error('IndexedDB is not supported.');
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