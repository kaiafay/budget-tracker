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
