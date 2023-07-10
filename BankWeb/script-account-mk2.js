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

    const currentUser = sessionStorage.getItem(COLUMN_ACCOUNT_NUMBER);

console.log('currentUser account number: ', currentUser);

    const namePlaceholder = document.getElementById('name-placeholder');
    const accountNumberPlaceholder = document.getElementById('account-number-placeholder');
    const balancePlaceholder = document.getElementById('balance-placeholder');

    const amount = document.getElementById('input-amount').value;

    let db;

    function showMessage(message) {
        messageElement.textContent = message;
    }

    function logout() {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }

    function userInfo(currentUser) {       
        const userData = db.transaction([TABLE_NAME], 'readonly');
        const userStore = userData.objectStore(TABLE_NAME);
        const request = userStore.get(currentUser);

        const fullName = request.result[COLUMN_FNAME] + ' ' + request.result[COLUMN_LNAME];
        const currentBalance = updateCurrentBalance(currentUser);
        
        namePlaceholder.textContent = fullName;
        balancePlaceholder.textContent = currentBalance;
        accountNumberPlaceholder.textContent = currentUser;
    }

    function retrieveTransactions(currentUser) {
        const transactions = db.transaction([TRANSACTION_TABLE_NAME], 'readonly');
        const transactionStore = transactions.objectStore(TRANSACTION_TABLE_NAME);
        const accountIndex = transactionStore.index(COLUMN_ACCOUNT_NUMBER);
        const request = accountIndex.getAll(currentUser);

        request.onsuccess = function(event) {
            const userTransactions = event.target.result.sort((a, b) => new Date(b[COLUMN_TIMESTAMP]) - new Date(a[COLUMN_TIMESTAMP]));
            console.log('transactions retrieved and sorted');
            return userTransactions;
        }
    }


    function updateCurrentBalance(currentUser) {
        var currentBalance = 0.0;
        const transactions = db.transaction([TRANSACTION_TABLE_NAME], 'readonly');
        const balanceStore = transactions.objectStore(TRANSACTION_TABLE_NAME);
        const balanceIndex = balanceStore.index(COLUMN_ACCOUNT_NUMBER);
        const request = balanceIndex.getAll(currentUser);

        request.onsuccess = function(event) {
            const userTransactions = event.target.result;
                for (let i=0; i<userTransactions.length; i++) {
                    currentBalance = userTransactions[i][COLUMN_BALANCE];
                }
                return currentBalance;            
        }
    }

    function makeDeposit(currentUser, amount) {
        const currentBalance = updateCurrentBalance(currentUser);
        const transaction = db.transaction([TRANSACTION_TABLE_NAME], 'readwrite');
        const transactionStore = transaction.objectStore(TRANSACTION_TABLE_NAME);
        const request = transactionStore.add({
            [COLUMN_ACCOUNT_NUMBER]: currentUser,
            [COLUMN_TRANSACTION_TYPE]: TRANSACTION_TYPE_DEP,
            [COLUMN_BALANCE]: amount + currentBalance,
            [COLUMN_TIMESTAMP]: new Date().getTime(),
            [COLUMN_TRANSACTION_AMOUNT]: amount
        });

        request.onsuccess = function(event) {
            showMessage('Deposit successful!');
            console.log('Deposit successful!');
            updateCurrentBalance(currentUser);
        };

        request.onerror = function(event) {
            showMessage('Deposit failed.');
            console.log('Deposit failed.');
        };
    }

    function makeWithdrawal(currentUser, amount) {
        const currentBalance = updateCurrentBalance(currentUser);
        const transaction = db.transaction([TRANSACTION_TABLE_NAME], 'readwrite');
        const transactionStore = transaction.objectStore(TRANSACTION_TABLE_NAME);
        const request = transactionStore.add({
            [COLUMN_ACCOUNT_NUMBER]: currentUser,
            [COLUMN_TRANSACTION_TYPE]: TRANSACTION_TYPE_WD,
            [COLUMN_BALANCE]: currentBalance - amount,
            [COLUMN_TIMESTAMP]: new Date().getTime(),
            [COLUMN_TRANSACTION_AMOUNT]: amount
        });

        request.onsuccess = function(event) {
            showMessage('Withdrawal successful!');
            console.log('Withdrawal successful!');
            updateCurrentBalance(currentUser);
        };

        request.onerror = function(event) {
            showMessage('Withdrawal failed.');
            console.log('Withdrawal failed.');
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

            userInfo(currentUser);

            document.getElementById('deposit').onclick = function() {
                makeDeposit();
            };
            document.getElementById('withdraw').onclick = function() {
                makeWithdrawal();
            };
            document.getElementById('logout').addEventListener('click', logout);
            document.getElementById('account-history').onclick = function() {
                const transactionList = retrieveTransactions(currentUser);
                sessionStorage.setItem('transactionList', transactionList);
                window.location.href = 'accounthistory.html';
            };
        };
    } else {
        console.error('IndexedDB is not supported.');
    } 

  });