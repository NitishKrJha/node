require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var JobAdditionalCostSchema = new Schema({
    job_tracker_id : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_tracker',
        default: null,
        index: true
    },
    business_id : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        default: null,
        index: true
    },
    jobid: { 
		type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        default: null,
        index: true
	},
    attachment: { type: String},
    notes: { type: String},
    cost: {
        type: Number,
        default: 0
    },
    created_at : { 
        type: Date, default: Date.now 
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
    }
	
})

JobAdditionalCostSchema.index({});
const model = mongoose.model('Job_additional_cost', JobAdditionalCostSchema);
// model.createIndexes()

module.exports = model;