require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FileSchema = new Schema({
    file_name: {
        type: String
    },
    mime_type: {
        type: String,
        default:''
    },
    created_at: {
        type: Date,
        default: Date.now
    }
})

//JobDetailsSchema.index({ drop_location: "2dsphere" });
const model = mongoose.model('Temp_files', FileSchema);
model.createIndexes()

module.exports = model;