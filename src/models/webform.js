require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserWebFormSchema = new Schema({

    form_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'custom_fields',
        index: true
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
    }
}, { strict: false })

const model = mongoose.model('web_form_data', UserWebFormSchema);
model.createIndexes();
module.exports = model;