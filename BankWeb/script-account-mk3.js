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

    const currentUserEmail = sessionStorage.getItem(COLUMN_EMAIL);

    const namePlaceholder = document.getElementById('name-placeholder');
    const accountNumberPlaceholder = document.getElementById('account-number-placeholder');
    const balancePlaceholder = document.getElementById('balance-placeholder');

    let db;

    console.log('currentUser email: ', currentUserEmail);

    function clearAmount() {
        document.getElementById('input-amount').value = '';
    }

    function logout() {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }

    function showMessage(message) {
        messageElement.textContent = message;
    }

    function getUserInfo(currentUserEmail) {
        console.log('currentUser email: ', currentUserEmail)
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([TABLE_NAME], 'readonly');
            const userStore = transaction.objectStore(TABLE_NAME);
            const username = userStore.index('emailIndex');
            const request = username.get(currentUserEmail);

            request.onsuccess = function(event) {
                console.log('request result', request.result);
                const fullName = request.result[COLUMN_FNAME] + ' ' + request.result[COLUMN_LNAME];
                const accountNumber = request.result[COLUMN_ACCOUNT_NUMBER];
                updateCurrentBalance(currentUserEmail)
                    .then(currentBalance => {
                        console.log('fullName: ', fullName);
                        console.log('currentBalance: ', currentBalance);
                        console.log('accountNumber: ', accountNumber);
                        namePlaceholder.textContent = fullName;
                        accountNumberPlaceholder.textContent = accountNumber;
                        balancePlaceholder.textContent = currentBalance;
                        resolve();
                    })
                    .catch(error => {
                        reject(error);
                    });       
            };

            request.onerror = function(event) {
                reject('Error retrieving user data.');
            };
        });
    }

    function retrieveTransactions(currentUserEmail) {
        return new Promise((resolve, reject) => {
            const transactions = db.transaction([TRANSACTION_TABLE_NAME], 'readonly');
            const transactionStore = transactions.objectStore(TRANSACTION_TABLE_NAME);
            const accountIndex = transactionStore.index(COLUMN_EMAIL);
            const request = accountIndex.getAll(currentUserEmail);

            request.onsuccess = function(event) {
                const userTransactions = event.target.result.sort((a, b) => new Date(b[COLUMN_TIMESTAMP]) - new Date(a[COLUMN_TIMESTAMP]));
                resolve(userTransactions);
            };

            request.onerror = function(event) {
                reject('Error retrieving user transactions.');
            };
        });
    }

    function updateCurrentBalance(currentUserEmail) {
        return new Promise((resolve, reject) => {
            const transactions = db.transaction([TRANSACTION_TABLE_NAME], 'readonly');
            const balanceStore = transactions.objectStore(TRANSACTION_TABLE_NAME);
            const balanceIndex = balanceStore.index(COLUMN_EMAIL);
            const request = balanceIndex.getAll(currentUserEmail);

            request.onsuccess = function(event) {
                const userTransactions = event.target.result;
                let currentBalance = 0.0;
                console.log('userTransactions: ', userTransactions);

                for (let i = 0; i < userTransactions.length; i++) {
                    if (userTransactions[i][COLUMN_TRANSACTION_TYPE] === TRANSACTION_TYPE_DEP) {
                        currentBalance += parseFloat(userTransactions[i][COLUMN_TRANSACTION_AMOUNT]);
                    } else if (userTransactions[i][COLUMN_TRANSACTION_TYPE] === TRANSACTION_TYPE_WD) {
                        currentBalance -= parseFloat(userTransactions[i][COLUMN_TRANSACTION_AMOUNT]);
                    }
                }

                resolve(currentBalance);
            };

            request.onerror = function(event) {
                reject('Error retrieving current balance.');
            };
        });
    }

    function makeDeposit(currentUserEmail) {
        return new Promise((resolve, reject) => {
            const amount = parseFloat(document.getElementById('input-amount').value);
            updateCurrentBalance(currentUserEmail)
                .then(currentBalance => {
                    const transaction = db.transaction([TRANSACTION_TABLE_NAME], 'readwrite');
                    const transactionStore = transaction.objectStore(TRANSACTION_TABLE_NAME);
                    const request = transactionStore.put({
                        [COLUMN_EMAIL]: currentUserEmail,
                        [COLUMN_TRANSACTION_TYPE]: TRANSACTION_TYPE_DEP,
                        [COLUMN_BALANCE]: amount + currentBalance,
                        [COLUMN_TIMESTAMP]: new Date().getTime(),
                        [COLUMN_TRANSACTION_AMOUNT]: amount
                    });

                    request.onsuccess = function(event) {
                        resolve('Deposit successful!');
                        clearAmount();
                        getUserInfo(currentUserEmail);
                    };

                    request.onerror = function(event) {
                        reject('Deposit failed.');
                    };
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    function makeWithdrawal(currentUserEmail) {
        return new Promise((resolve, reject) => {
            const amount = parseFloat(document.getElementById('input-amount').value);
            updateCurrentBalance(currentUserEmail)
                .then(currentBalance => {
                    const transaction = db.transaction([TRANSACTION_TABLE_NAME], 'readwrite');
                    const transactionStore = transaction.objectStore(TRANSACTION_TABLE_NAME);
                    const request = transactionStore.put({
                        [COLUMN_EMAIL]: currentUserEmail,
                        [COLUMN_TRANSACTION_TYPE]: TRANSACTION_TYPE_WD,
                        [COLUMN_BALANCE]: currentBalance - amount,
                        [COLUMN_TIMESTAMP]: new Date().getTime(),
                        [COLUMN_TRANSACTION_AMOUNT]: amount
                    });

                    request.onsuccess = function(event) {
                        resolve('Withdrawal successful!');
                        clearAmount();
                        getUserInfo(currentUserEmail);
                    };

                    request.onerror = function(event) {
                        reject('Withdrawal failed.');
                    };
                })
                .catch(error => {
                    reject(error);
                });
        });
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

            getUserInfo(currentUserEmail);

            document.getElementById('deposit').onclick = function() {
                makeDeposit(currentUserEmail);
            };
            document.getElementById('withdraw').onclick = function() {
                makeWithdrawal(currentUserEmail);
            };
            document.getElementById('logout').onclick = function() {
                logout();
            };
            document.getElementById('account-history').onclick = function() {
                sessionStorage.setItem(COLUMN_EMAIL, currentUserEmail);
                console.log(currentUserEmail, ' saved to session storage');
                window.location.href = 'accounthistory.html';
            };
        };
    } else {
        console.error('IndexedDB is not supported.');
    }
    });
