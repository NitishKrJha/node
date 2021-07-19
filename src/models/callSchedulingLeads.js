require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var CallSchedulingLeadsSchema = new Schema({
    // _id :{
    //     type: mongoose.SchemaTypes.ObjectId,
    //     default : ObjectID()
    // },
	userid : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    isEmployee: {
        type: Number
    },
    usertype: {
        type: Number
    },
    customerid: {
        type: String
    },
    scheduledtime : { 
        type: Date, default: Date.now 
    },
    end_date : { 
        type: Date, default: Date.now 
    },
    type: {
        type: Number
    },
    title: {
        type: String
    },
    notes: {
        type: String
    },
    status: {
        type : String 
    },
    riminder_type: {
        type: String
    }
	
})

CallSchedulingLeadsSchema.index({title: 'text', contact_person: 'text'});
const model = mongoose.model('CallSchedulingLeads', CallSchedulingLeadsSchema);
model.createIndexes()

module.exports = model;