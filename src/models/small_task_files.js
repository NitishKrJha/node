require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var TaskFileSchema = new Schema({
    business_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true
    },
    file_name: {
        type: String
    },
    task_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Small_task',
        default: null,
        index: true
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
    }
})

//JobDetailsSchema.index({ drop_location: "2dsphere" });
const model = mongoose.model('Small_task_files', TaskFileSchema);
model.createIndexes()

module.exports = model;