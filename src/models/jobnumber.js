require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var JobNumberSchema = new Schema({
	user_id: { 
		type : String,
		required: true
	},
	job_id: {
        type: Number,
        required: true
    }
	
})

module.exports = mongoose.model('jobnumber', JobNumberSchema);