document.addEventListener('DOMContentLoaded', function() {
    const DATABASE_NAME = 'FTWDatabase.db';
    const TRANSACTION_TABLE_NAME = 'User_Transactions';
    const COLUMN_TRANSACTION_TYPE = 'transaction_type';
    const COLUMN_BALANCE = 'balance';
    const COLUMN_TIMESTAMP = 'timestamp';
    const COLUMN_TRANSACTION_AMOUNT = 'amount';
  
    const tableBody = document.getElementById('transactionTableBody');
    const currentUserEmail = sessionStorage.getItem('email');
  
    function goBack() {
      window.history.back();
    }
  
    document.getElementById('back').onclick = function() {
      goBack();
    }
  
    // Open the IndexedDB and retrieve the transactions for the current user
    if ('indexedDB' in window) {
      const request = window.indexedDB.open(DATABASE_NAME, 5);
  
      request.onerror = function(event) {
        console.error('Database error:', event.target.error);           
      };
  
      request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction([TRANSACTION_TABLE_NAME], 'readonly');
        const transactionStore = transaction.objectStore(TRANSACTION_TABLE_NAME);
        const accountIndex = transactionStore.index('email');
        const request = accountIndex.getAll(currentUserEmail);
  
        request.onsuccess = function(event) {
          const transactions = event.target.result;
          
          if (transactions.length === 0) {
            const row = tableBody.insertRow();
            const cell = row.insertCell();
            cell.colSpan = 4;
            cell.textContent = 'No transactions found.';
            return;
          }

          transactions.sort((a, b) => new Date(b[COLUMN_TIMESTAMP]) - new Date(a[COLUMN_TIMESTAMP]));
  
          // Iterate over the transactions and populate the table rows
          transactions.forEach(transaction => {
            const row = tableBody.insertRow();
            const typeCell = row.insertCell();
            const amountCell = row.insertCell();
            const balanceCell = row.insertCell();
            const timestampCell = row.insertCell();
  
            typeCell.textContent = transaction[COLUMN_TRANSACTION_TYPE];
            amountCell.textContent = transaction[COLUMN_TRANSACTION_AMOUNT];
            balanceCell.textContent = transaction[COLUMN_BALANCE];
            timestampCell.textContent = new Date(transaction[COLUMN_TIMESTAMP]).toLocaleString();
          });
        };
  
        request.onerror = function(event) {
          console.error('Error retrieving user transactions:', event.target.error);
        };
      };
    } else {
      console.error('IndexedDB is not supported.');
    }
  });
  