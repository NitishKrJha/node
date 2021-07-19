require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var TaskStatus = new Schema({
    business_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true
    },
    status_name: {
        type: String
    },
    status_color: {
        type: String
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

TaskStatus.index({ title: "text"});
//JobDetailsSchema.index({ drop_location: "2dsphere" });
const model = mongoose.model('Task_status', TaskStatus);
model.createIndexes()

module.exports = model;