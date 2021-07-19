require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Screenmonitoring = new Schema({
	employee_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
	screen_image : {
		type : String,
    },
    activity_percentage : {
        type: Number,
		default : 0
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
	created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default : null
    },
    created_at : { 
        type: Date, default: Date.now 
    }
});

const model = mongoose.model('screenmonitoring', Screenmonitoring);
model.createIndexes();
module.exports = model;