require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var CurrenciesSchema = new Schema({
    // _id :{
    //     type: mongoose.SchemaTypes.ObjectId,
    //     default : ObjectID()
    // },
    id: {
        type: Number,
        default: 0
    },
    country: {
        type: String,
		default: ''
    },
    currency: {
        type: String,
		default: ''
    },
    code: {
        type: String,
		default: ''
    },
    symbol: {
        type: String,
		default: ''
    },
    symbol_html_code: {
        type: String,
        default: ''
    },
	thousand_separator: {
        type: String,
        default: ''
    },
	decimal_separator: {
        type: String,
        default: ''
    }

}, { strict: false })

//JobDetailsSchema.index({ drop_location: "2dsphere" });
const model = mongoose.model('Currencies', CurrenciesSchema);
model.createIndexes()

module.exports = model;