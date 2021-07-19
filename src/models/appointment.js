require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuSchema = new Schema({
	color : {
		type: String
	}
},{ strict: false });

const model = mongoose.model('appointment_setup', MenuSchema);
//model.createIndexes();
module.exports = model;