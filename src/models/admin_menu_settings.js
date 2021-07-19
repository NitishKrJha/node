require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuSchema = new Schema({
	subscription_type : {
		type: Number,
		index : true
	},
	user_type : {
		type : String,
		enum : ['Admin','Employee','Customer','Contructor']
	},
	modules : {
		type: Object,
		index : true
	},
	created_at : {
		type: Date, default: Date.now 
	}
});

const model = mongoose.model('admin_menu_settings', MenuSchema);
model.createIndexes();
module.exports = model;