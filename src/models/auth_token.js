require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TokenSchema = new Schema({
	token : {
		type:String,
		index : true
	},
	user_id : {
		type: mongoose.SchemaTypes.ObjectId,
		index : true
	},
	created_at : {
		type: Date, default: Date.now 
	}
});

const model = mongoose.model('auth_token', TokenSchema);
model.createIndexes();
module.exports = model;