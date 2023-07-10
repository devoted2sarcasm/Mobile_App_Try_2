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

    const messageElement = document.getElementById('message');
    const email = sessionStorage.getItem('email');
    const transactiontable = TRANSACTION_TABLE_PREFIX + email;

    console.log(email, transactiontable);
  
    let db;
  
    // Check if IndexedDB is supported by the browser
    if ('indexedDB' in window) {
        // Open or create a database
        const request = window.indexedDB.open(DATABASE_NAME, 4);
    
        // Handle database upgrade, success, and error events
        request.onupgradeneeded = function(event) {
          db = event.target.result;
    
          // Create the accounts object store if it doesn't exist
          createObjectStore(db, TABLE_NAME, COLUMN_ACCOUNT_NUMBER, true);
    
          // Create the transactions object store for the user if it doesn't exist
          const accounts = event.target.transaction.objectStore(TABLE_NAME).getAll();
          accounts.onsuccess = function(event) {
            const users = event.target.result;
            for (const user of users) {
              const transactionTableName = TRANSACTION_TABLE_PREFIX + user.email;
              createObjectStore(db, transactionTableName, COLUMN_TRANSACTION_ID, true);
            }
          };
        };
    
        request.onsuccess = function(event) {
          db = event.target.result;
          console.log('Database opened successfully!');
          updateInfo(email);
          document.getElementById('deposit').addEventListener('click', function(event) {
            event.preventDefault();
            deposit(email, transactiontable);
          });
        };
    
        request.onerror = function(event) {
          console.error('Database error:', event.target.error);
        };
      } else {
        console.error('IndexedDB is not supported by this browser.');
      } 

    // Function to create object stores
    function createObjectStore(database, objectStore, key, indexIsUnique = true) {
        const transaction = database.transaction([objectStore], 'readwrite');
        const store = transaction.objectStore(objectStore);

    // Create the object store if it doesn't exist
    if (!database.objectStoreNames.contains(objectStore)) {
      const collection = database.createObjectStore(objectStore, { keyPath: key });
      collection.createIndex(key, key, { unique: indexIsUnique });
    }
  }


    // Function to display messages
    function showMessage(message) {
      messageElement.textContent = message;
    }
  
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
  