let db;
const request = indexedDB.open('budget_tracker', 1);

// trigger if database version changes
request.onupgradeneeded = function(e) {
    // save reference to database
    const db = event.target.result;
    // create object store
    db.createObjectStore('new_transaction', { autoIncrement: true });
};