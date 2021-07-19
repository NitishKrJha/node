require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tempUser = new Schema({
    email: {
        type: String,
        trim: true,
        index: true,
        required: true,
    },
	username: {
        type: String,
        trim: true,
        index: true,
        required: true
    },
    otp : {
        type : Number,
        required : true
    }
	
})

const model = mongoose.model('Temp_users', tempUser);
model.createIndexes();
module.exports = model