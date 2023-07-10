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

    function createAccount() {
        const firstName = document.getElementById('firstname').value;
        const lastName = document.getElementById('lastname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password2').value;
        //const deposit = parseFloat(document.getElementById('deposit').value);

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showMessage('Please complete all fields.');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match.');
        }


        const newAccount = db.transaction([TABLE_NAME], 'readwrite');

        const userStore = newAccount.objectStore(TABLE_NAME);

        const newUser = {
            [COLUMN_FNAME]: firstName,
            [COLUMN_LNAME]: lastName,
            [COLUMN_EMAIL]: email,
            [COLUMN_PASS]: password
        };

        const addUser = userStore.add(newUser);

        addUser.onsuccess = function() {
            showMessage('Account created successfully!');
            console.log('Account created successfully!');
            //firstTransaction(deposit);
            window.location.href = 'index.html';
        };

        addUser.onerror = function() {
            showMessage('Error creating account.');
            console.error('Error creating account.');
        };
    }

    function firstTransaction(deposit) {
        const transaction = db.transaction([TRANSACTION_TABLE_NAME], 'readwrite');
        const transactionStore = transaction.objectStore(TRANSACTION_TABLE_NAME);
        const newTransaction = {
            [COLUMN_TRANSACTION_TYPE]: TRANSACTION_TYPE_DEP,
            [COLUMN_BALANCE]: deposit,
            [COLUMN_TIMESTAMP]: new Date().getTime(),
            [COLUMN_TRANSACTION_AMOUNT]: deposit
        };

        const addTransaction = transactionStore.add(newTransaction);

        addTransaction.onsuccess = function() {
            console.log('First transaction added successfully!');
        };

        addTransaction.onerror = function() {
            console.error('Error adding first transaction.');
        };
    }



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
            document.getElementById('create').onclick = function() {
                createAccount();
            };
        };
    } else {
        console.error('IndexedDB is not supported.');
    }

});