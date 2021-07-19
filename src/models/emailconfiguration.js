require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EmailConfiguration = new Schema({
	email_code : {
		type: String,
		index : true
	},
	email_html : {
		type : String,
    },
    email_subject : {
        type: String
    }
});

const model = mongoose.model('Email_configuration', EmailConfiguration);
model.createIndexes();
module.exports = model;