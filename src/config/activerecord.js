var mongoose = require('mongoose');

var db;
var state = {
    db: null,
}
function connectDatabase() {
    if (!db) {
        var connection_string='' ;
        if(process.env.MONGO_USERNAME!='' && process.env.MONGO_PASSWORD!=''){
            connection_string = process.env.MONGO_USERNAME+':'+process.env.MONGO_PASSWORD+'@';
        }
        mongoose.connect('mongodb://'+connection_string+process.env.MONGO_HOST+':'+process.env.MONGO_PORT+'/'+process.env.MONGO_DATABASE, { 
            useNewUrlParser: true ,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false 
        });
        mongoose.set('debug', true);
        db = mongoose.connection;
        state.db = db;  
        db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    }
    return db;
}
exports.close = function (done) {
    if (state.db) {
        state.db.close(function (err, result) {
            state.db = null
            state.mode = null
            done(err)
        })
    }
}
module.exports = connectDatabase();