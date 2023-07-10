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

    function showMessage(message) {
        messageElement.textContent = message;
    }

    function validate(event) {
        var valid = false;
        event.preventDefault();
        const email = document.getElementById('email').value;
        console.log(email);
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showMessage('Please complete all fields.');
            return;
        }

        const transaction = db.transaction([TABLE_NAME], 'readonly');
        const userStore = transaction.objectStore(TABLE_NAME);
        const username = userStore.index('emailIndex');
        const request = username.get(email);

        console.log('transaction: ', transaction);
        console.log('userStore: ', userStore);
        console.log('request: ', request);
        console.log('password: ', password);

        request.addEventListener('success', function(event) {
            console.log('request success: ' , event);
            console.log('request values: ', request.result);
            if (!request.result) {
                showMessage('User does not exist.');
                return;
            }
            if (request.result.pass !== password) {
                showMessage('Incorrect password.');
                return;
            }
            if (request.result.pass === password) {
                showMessage('Login successful.');
                sessionStorage.setItem(COLUMN_EMAIL, request.result.email);
                console.log(request.result.email, ' stored in session storage');
                window.location.href = 'accountinfo.html';
            }

        });

    

        request.onerror = function(event) {
            console.error('Database error:', event.target.error);
            return;
        };
    }

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
                transactionStore.createIndex(COLUMN_EMAIL, COLUMN_EMAIL, { unique: false });
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
        };
    } else {
        console.error('IndexedDB is not supported.');
    }
  
  document.getElementById('loginForm').addEventListener('submit', validate);

  
});