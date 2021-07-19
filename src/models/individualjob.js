require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var IndividualjobSchema = new Schema({
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
    type: {
        type: Number
    },
    customerid: {
        type: String
    },
    jobid: { 
		type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        default: null,
        index: true
	},
    status: {
        type : String 
    },
    jobstatus: {
        type: String
    },
    taskstatus: {
        type: String
    },
    post_date : { 
        type: Date, default: Date.now 
    },
	
})

IndividualjobSchema.index({userid:"text"});
const model = mongoose.model('Individualjob', IndividualjobSchema);
model.createIndexes()

module.exports = model;