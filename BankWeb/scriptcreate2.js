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

    const OPEN_OR_CREATE_USERS = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      ${COLUMN_ACCOUNT_NUMBER} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${COLUMN_FNAME} TEXT NOT NULL,
      ${COLUMN_LNAME} TEXT NOT NULL,
      ${COLUMN_EMAIL} TEXT UNIQUE NOT NULL,
      ${COLUMN_PASS} TEXT NOT NULL
    )`;

    let db;

    const messageElement = document.getElementById('message');

    function showMessage(message) {
        messageElement.textContent = message;
    }

    function createAccount(e) {
        e.preventDefault();

        // Get form field values
        const firstName = document.getElementById('firstname').value;
        const lastName = document.getElementById('lastname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password2').value;
        const deposit = parseFloat(document.getElementById('deposit').value);
        const transactionTable = TRANSACTION_TABLE_PREFIX + email;

        const openOrCreateDB = window.indexedDB.open(DATABASE_NAME, 5);

        openOrCreateDB.addEventListener('error', () => console.error('Error opening DB'));

        openOrCreateDB.addEventListener('success', () => {
            console.log('Database opened successfully!');
            db = openOrCreateDB.result;

            // Validate form fields
            if (!firstName || !lastName || !email || !deposit || !password || !confirmPassword) {
                showMessage('Please complete all fields.');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Passwords do not match.');
                return;
            }

            const account = {
                [COLUMN_FNAME]: firstName,
                [COLUMN_LNAME]: lastName,
                [COLUMN_EMAIL]: email,
                [COLUMN_PASS]: password
            };

            const transaction = db.transaction([TABLE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(TABLE_NAME);
            const query = objectStore.add(account);

            query.addEventListener('success', () => {
                showMessage('Account created successfully!');
            });

            transaction.addEventListener('error', () => {
                console.log('Account creation failed!');
            });

            // Clear form fields
            document.getElementById('firstname').value = '';
            document.getElementById('lastname').value = '';
            document.getElementById('email').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password2').value = '';
            document.getElementById('deposit').value = '';

            

            const firstUserTransaction = {
                [COLUMN_TRANSACTION_TYPE]: 'Deposit',
                [COLUMN_TRANSACTION_AMOUNT]: deposit,
                [COLUMN_TIMESTAMP]: new Date().toLocaleString(),
                [COLUMN_BALANCE]: deposit
            };

            const transaction2 = db.transaction([transactionTable], 'readwrite');
            const objectStore2 = transaction2.objectStore(transactionTable);
            const query2 = objectStore2.add(firstUserTransaction);

            query2.addEventListener('success', () => {
                console.log('First transaction added successfully!');
                window.location.href = 'index.html';
            });
        });

        openOrCreateDB.addEventListener('upgradeneeded', init => {
            db = init.target.result;

            db.onerror = () => {
                console.error('Error creating DB');
            }

            const table = db.createObjectStore(TABLE_NAME, {
                keyPath: COLUMN_ACCOUNT_NUMBER,
                autoIncrement: true
            });

            table.createIndex(COLUMN_EMAIL, COLUMN_EMAIL, {
                unique: true
            });
            table.createIndex(COLUMN_PASS, COLUMN_PASS, {
                unique: false
            });
            table.createIndex(COLUMN_FNAME, COLUMN_FNAME, {
                unique: false
            });
            table.createIndex(COLUMN_LNAME, COLUMN_LNAME, {
                unique: false
            });

            if (!db.objectStoreNames.contains(transactionTable)) {
                const versionChangeTransaction = openOrCreateDB.result;
                const userTable = versionChangeTransaction.createObjectStore(transactionTable, {
                    keyPath: COLUMN_TRANSACTION_ID,
                    autoIncrement: true
                });
    
                userTable.createIndex(COLUMN_TRANSACTION_TYPE, COLUMN_TRANSACTION_TYPE, {
                    unique: false
                });
                userTable.createIndex(COLUMN_TRANSACTION_AMOUNT, COLUMN_TRANSACTION_AMOUNT, {
                    unique: false
                });
                userTable.createIndex(COLUMN_TIMESTAMP, COLUMN_TIMESTAMP, {
                    unique: false
                });
                userTable.createIndex(COLUMN_BALANCE, COLUMN_BALANCE, {
                    unique: false
                });
            }
        });
    }

    const createButton = document.getElementById('create');
    createButton.addEventListener('click', createAccount);

});
