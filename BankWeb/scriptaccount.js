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

  });


  
    async function updateInfo(email) {
      const namePlaceholder = document.getElementById('name-placeholder');
      const accountNumberPlaceholder = document.getElementById('account-number-placeholder');
      const currentBalancePlaceholder = document.getElementById('balance-placeholder');
  
      try {
        const userDetails = await retrieveUserDetails(email);
  
        if (userDetails) {
          const fullName = userDetails[COLUMN_FNAME] + ' ' + userDetails[COLUMN_LNAME];
  
          namePlaceholder.textContent = fullName;
          accountNumberPlaceholder.textContent = userDetails[COLUMN_ACCOUNT_NUMBER];
        }
  
        const currentBalance = await retrieveCurrentBalance(db, transactiontable);
        currentBalancePlaceholder.textContent = currentBalance !== null ? currentBalance : '0';
      } catch (error) {
        console.error('Error:', error);
      }
    }
  
    // Function to retrieve user details using the email address
    async function retrieveUserDetails(email) {
      const transaction = db.transaction([TABLE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(TABLE_NAME);
      const index = objectStore.index('email');
  
      const request = index.get(email);
  
      try {
        const event = await new Promise(function(resolve, reject) {
          request.onsuccess = function(event) {
            resolve(event);
          };
  
          request.onerror = function(event) {
            reject(event.target.error);
          };
        });
  
        const user = event.target.result;
  
        if (user) {
          return user;
        } else {
          throw new Error('User not found');
        }
      } catch (error) {
        throw error;
      }
    }
  
    // Function to retrieve transactions for a user
    async function retrieveTransactions() {
      const transaction = db.transaction([transactiontable], 'readwrite');
      const objectStore = transaction.objectStore(transactiontable);
  
      const request = objectStore.getAll();
  
      try {
        const event = await new Promise(function(resolve, reject) {
          request.onsuccess = function(event) {
            resolve(event);
          };
  
          request.onerror = function(event) {
            reject(event.target.error);
          };
        });
  
        const transactions = event.target.result;
        return transactions;
      } catch (error) {
        console.log('Error retrieving transactions:', error);
        throw error;
      }
    }
  
    async function retrieveCurrentBalance(db, transactiontable) {
        const transaction = db.transaction([transactiontable], 'readonly');
        const objectStore = transaction.objectStore(transactiontable);
        const request = objectStore.openCursor(null, 'prev');
      
        return new Promise(function(resolve, reject) {
          request.onsuccess = function(event) {
            const cursor = event.target.result;
            const zeroBalance = 0.0;
      
            if (cursor) {
              const transaction = cursor.value;
              const currentBalance = transaction.balance;
              resolve(currentBalance);
            } else {
              resolve(zeroBalance);
            }
          };
      
          request.onerror = function(event) {
            reject(event.target.error);
          };
        });
      }
      
      

// ...

// Function to handle deposit
async function deposit(email, transactiontable) {
    const transaction = db.transaction([transactiontable], 'readwrite');
    const objectStore = transaction.objectStore(transactiontable);
  
    const amount = document.getElementById('input-amount').value;
    console.log(amount + ' retrieved from input');
  
    const balance = await retrieveCurrentBalance(db, transactiontable) || 0;
    const newBalance = balance + parseFloat(amount); // Make sure to parse the amount as a float
  
    const newTransaction = {
      transaction_type: 'deposit',
      amount: parseFloat(amount), // Parse the amount as a float
      timestamp: new Date().toISOString(),
      balance: newBalance,
    };
  
    const request = objectStore.add(newTransaction);
  
    try {
      await new Promise(function(resolve, reject) {
        transaction.oncomplete = function(event) {
          resolve(event);
        };
  
        transaction.onerror = function(event) {
          reject(event.target.error);
        };
      });
  
      const newTransactionId = request.result;
      newTransaction.transaction_id = newTransactionId;
  
      return newBalance;
    } catch (error) {
      console.log('Error depositing amount:', error);
      throw error;
    }
  }
  
  function logout() {
    window.location.href = 'index.html';
  }
  // ...
  
  


  });
  