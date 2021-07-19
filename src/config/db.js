var Db = require('mysql-activerecord');

var db;
var state = {
    db: null,
}

function connectDatabase() {
    if (!db) {
        db = new Db.Adapter({
            server: process.env.DB_SERVER,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE_NAME,
            reconnectTimeout: 2000
        });
        state.db = db; 
    }
    return db;
}

exports.close = function (done) {
    if (state.db) {
        state.db.releaseConnection(function (err, result) {
            state.db = null
            state.mode = null
            done(err)
        })
    }
}

exports.recordSet = function(record){
    return JSON.parse(JSON.stringify(record))
}
exports.db = connectDatabase();