require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SupplierInfoSchema = new Schema({

	supplier_id: { 
		type : Number
	},
	title: {
         type : String ,
         require : true
    },
    first_name: { 
        type: String,
        require : [true,'Eta dite hobe']
    },
    middle_name: { 
        type: String
    },
    last_name: {
        type : String,
    },
    suffix: {
        type: String
    },
    company: {
        type: String
    },
    display_name_as: {
        type: String
    },
    address_map: {
        type: String
    },
    street: {
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
    pincode : {
        type: Number
    },
    pan_number : {
        type: String
    },
    apply_tds_for_this_supplier : {
        type: String
    },
    notes : {
        type: String
    },
    attachments : {
        type: String
    },
    emails : {
        type: String
    },
    phone : {
        type: String
    },
    mobile_countrycode : {
        type: String
    },
    mobile_dialCode : {
        type: String
    },
    phone_countrycode : {
        type: String
    },
    phone_dialCode : {
        type: String
    },
    mobile : {
        type: String
    },
    fax : {
        type: String
    },
    website : {
        type: String
    },
    billing_rate : {
        type: String
    },
    terms : {
        type: String
    },
    opening_balance : {
        type: String
    },
    account_no : {
        type: String
    },
    tax_registration_number : {
        type: String
    },
    effective_date : {
        type: String
    },
    store_id : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Store_details',
        default: null,
    },
    status : {
        type: String,
    },
    delstatus: {
        type : Number,
        default : 0
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    created_by: {
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
SupplierInfoSchema.index({title: 'text', first_name: 'text', middle_name: 'text', last_name: 'text', company: 'text'});
//module.exports = mongoose.model('Supplier_info', SupplierInfoSchema);
const model = mongoose.model('Supplier_info', SupplierInfoSchema);
model.createIndexes()

module.exports = model;