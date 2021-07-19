require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CustomFieldsSchema = new Schema({
    module: {
        type: String,
        required: [true, 'Module field is required'],
    },
    fields: {
        type: Array,
        default: null
    },
    business_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    modified_at: {
        type: Date,
        default: null
    },
    modified_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    }

})
const model = mongoose.model('custom_fields', CustomFieldsSchema);
model.createIndexes()

module.exports = model;