require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var JobFilesSchema = new Schema({
    // _id :{
    //     type: mongoose.SchemaTypes.ObjectId,
    //     default : ObjectID()
    // },
	jobid: { 
		type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        default: null,
        index: true
	},
	userid: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    username: {
        type: String
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    type: {
         type : String,
         default: ''
    },
    signature: {
         type : String 
    },
    files: {
        type : String 
    },
    path: {
        type : String 
    },
    notes: {
        type : String 
    },
    imageCaption: {
        type : String 
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    created_at : { 
        type: Date, default: Date.now 
    }
	
})

JobFilesSchema.index({jobid: 'text'});
const model = mongoose.model('Job_files', JobFilesSchema);
model.createIndexes()

module.exports = model;