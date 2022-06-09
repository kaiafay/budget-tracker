let db;
const request = indexedDB.open('budget_tracker', 1);

// trigger if database version changes
request.onupgradeneeded = function(e) {
    // save reference to database
    const db = e.target.result;
    // create object store
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(e) {
    db = e.target.result;

    // check to see if app is connected to the internet
    if(navigator.onLine) {
        // if connected, upload data
        uploadTransaction();
    }
};

// trigger if there's an issue with the database
request.onerror = function(e) {
    console.log(e.target.errorCode);
};

// save transaction if no internet connection exists
function saveRecord(record) {
    // open new transaction
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    // access object store for 'new_transaction'
    const transactionObjectStore = transaction.objectStore('new_transaction');
    // add record to object store
    transactionObjectStore.add(record);
};

// upload data once internet connection is restored
function uploadTransaction() {
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // set all records from the store to a variable
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        if(getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'post',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, test/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('new_transaction');

                // clear store
                transactionObjectStore.clear();
                alert('All saved transactions have been uploaded!');
            })
            .catch(err => console.log(err));
        }
    }
};

// listen for app coming online
window.addEventListener('online', uploadTransaction);
