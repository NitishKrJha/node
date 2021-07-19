require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CallDetailsSchema = new Schema({

	user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    call_sid: {
         type : String,
         unique : true
    },
    direction : {
        type: String
    },
    from: { 
        type: String
    },
    to: { 
        type: String
    },
    duration: {
        type : String,
    },
    status: {
        type: String
    },
    recording_sid: {
        type: String,
        default : null
    },
    created_at : { 
        type: Date, default: Date.now 
    }
})

CallDetailsSchema.index({from: 'text', to: 'text'});
const model = mongoose.model('Call_recordes', CallDetailsSchema);
model.createIndexes()

module.exports = model;