require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var JobTypeSchema = new Schema({
    job_title:{
        type: String
    },
    job_duration: {
        type : String 
    },
    recurring_type: {
        type : String 
    },
    status: {
        type:String, 
        enum:['Active','Inactive'],
        default: 'Active'
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
    },
    is_deleted : {
        type : Boolean,
        default : false,
        index:true
    }
	
})

JobTypeSchema.index({});
const model = mongoose.model('Job_type', JobTypeSchema);
model.createIndexes()

module.exports = model;