require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var SmallTaskCategory = new Schema({
    name:{
        type: String
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

SmallTaskCategory.index({});
const model = mongoose.model('Small_task_category', SmallTaskCategory);
model.createIndexes()

module.exports = model;