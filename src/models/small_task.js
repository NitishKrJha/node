require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var TaskDetailsSchema = new Schema({
    business_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true
    },
    title: {
        type: String
    },
    relation_customer: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Lead_details',
        default: null,
        index: true
    },
    category: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Small_task_category',
        default: null,
        index: true
    },
    customer_name: {
        type: String
    },
    description: {
        type: String
    },
    start_date: {
        type: Date,
        default: Date.now
    },
    end_date: {
        type: Date,
        default: Date.now
    },
    task_status: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Task_status',
        default: null,
        index: true
    },
    task_type: {
        type: String,
        enum: ['One Time', 'Recurring'], //0=initialized,1=accepted,2=startted,3=paused,4=stop 
        default: 'One Time'
    },
    recurring_type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'annually',''], //0=initialized,1=accepted,2=startted,3=paused,4=stop 
        default: ''
    },
    priority: {
        type: String,
        enum: ['High', 'Medium', 'Low'], //0=initialized,1=accepted,2=startted,3=paused,4=stop 
        default: 'High'
    },
    member_assign: {
        type : Array, default: []
    },
    files : {
        type : Array, default: []
    },
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date,
        default: Date.now
    },
    modified_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null
    },
    is_deleted: {
        type: Boolean,
        default: false,
        index: true
    }
})

TaskDetailsSchema.index({ title: "text", description: "text" });
//JobDetailsSchema.index({ drop_location: "2dsphere" });
const model = mongoose.model('Small_task', TaskDetailsSchema);
model.createIndexes()

module.exports = model;