require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InvoiceNumberSchema = new Schema({
	user_id: { 
		type : String,
		required: true
	},
	invoiceID: {
        type: Number,
        required: true
    }
	
})

module.exports = mongoose.model('invoicenumber', InvoiceNumberSchema);