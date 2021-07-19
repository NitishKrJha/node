require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var JobTrackerSchema = new Schema({
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
    jobid: { 
		type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        default: null,
        index: true
	},
    contructorId: { type:String},
    worktime: { type:Number},
    comment: { type: String},
    notes: { type: String},
    usertype: { type: String},
    created_at : { 
        type: Date, default: Date.now 
    },
    status : {
        type: String,
        default:'0'
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    modified_at : { 
        type: Date, default: Date.now 
    },
    modified_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    created_time : { 
        type: Date, default: Date.now 
    },
	
})

JobTrackerSchema.index({});
const model = mongoose.model('Job_tracker', JobTrackerSchema);
// model.createIndexes()

module.exports = model;