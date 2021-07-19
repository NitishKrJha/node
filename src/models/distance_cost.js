require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var DistanceCostSchema = new Schema({
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
    start_location: {
        type: { type: String },
        coordinates: [],
        default: ''
    },
    end_location: {
        type: Array,
        default: []
    },
    cost: { 
        type:Number,
        default: 0
    },
    distance:  { 
        type:Number,
        default: 0
    },
    date : { 
        type: Date, default: Date.now 
    }
	
}, { strict: false })

//DistanceCostSchema.index({});

DistanceCostSchema.index({ start_location: "2dsphere" });
const model = mongoose.model('Distance_cost', DistanceCostSchema);
model.createIndexes()

module.exports = model;