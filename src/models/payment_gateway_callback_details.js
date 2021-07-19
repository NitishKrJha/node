require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TransactionsSchema = new Schema({
	eventType : {
		type : String
	},
	eventDate : {
		type : Date
	},
	name : {
		type : String,
		default : null,
	},
	amount : {
		type : Number
	},
	customerProfileId : {
		type : Number,
		index : true
	},
	customerPaymentProfileId : {
		type : Number,
		index : true
	},
	subscription_id : {
		type : Number,
		index : true
	},
	entityName : {
		type : String
	},
	error : {
		type : String,
		default:null
	},
	transId : {
		type : Number,
		default:null
	}
});

const model = mongoose.model('Payment_gateway_callback_details', TransactionsSchema);
model.createIndexes();
module.exports = model;