require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var SmsFollowup = new Schema({
    sms_text:{
        type: String
    },
    order :{
        type : Number,
        required : true
    },
    sms_day :{
        type : Number,
        required : true
    },
    module_for :{
        type : String,
        enum : ["customer","lead","job","invoice","estimate"],
        required : true
    },
    created_by : {
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
    created_at : { 
        type: Date, default: Date.now 
    },
    modified_at : { 
        type: Date, default: Date.now 
    },
    modified_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default : null
    }
})

SmsFollowup.index({});
const model = mongoose.model('Sms_followup', SmsFollowup);
model.createIndexes()

module.exports = model;