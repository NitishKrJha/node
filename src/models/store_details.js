require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StoreDetailsSchema = new Schema({

	storeid: { 
		type : Number
	},
	parent_id: {
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
    title: {
         type : String 
    },
    country : {
        type: String
    },
    location: { 
        type: String,
        default : null
    },
    latitude: { 
        type: String,
        default : null
    },
    longitude: {
        type : String,
    },
    contact_person: {
        type: String
    },
    email: {
        type: String
    },
    countrycode: {
        type: String
    },
    dialCode: {
        type: String
    },
    contact_number: {
        type: String
    },
    status : {
        type: String
    },
    country : {
        type: String
    },
    city : {
        type: String
    },
    state : {
        type: String
    },
    zip : {
        type: Number
    },
    is_default : {
        type: Number
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
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
    }
	
})

StoreDetailsSchema.index({title: 'text', contact_person: 'text'});
const model = mongoose.model('Store_details', StoreDetailsSchema);
model.createIndexes()

module.exports = model;