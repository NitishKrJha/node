require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PaymentsSchema = new Schema({
    created_at : { 
        type: Date, 
        default: Date.now 
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    customer_id : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Lead_details',
        default: null,
        index: true
    },
    business_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        default: null,
        index: true
    },
    transaction_id:{
        type: String,
        default: null,
    },
    subscription_id:{
        type: String,
        default: null,
    },
    log_message : {
        type : String
    },
    payment_type : {
        type : String,
        enum : ["Debit","Credit"],
        default : "Credit"
    },
    invoice_number : {
        type : String
    },
    invoice_id :{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Invoice_details',
        default: null,
        index: true
    },
    job_id :{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        default: null,
        index: true
    },
    phone_number :{
        type : String
    },
    amount :{
        type : Number,
        required : true
    },
    payment_mode :{
        type : String,
        enum : ["cheque","cash","online"],
        required : true
    },
    gateway_used :{
        type : String,
        default: null
    },
    log_type : {
        type : String,
        enum : ["registration","invoice","job","number_purchase","administration","registration_recurring","unknown"],
        required : true,
        index: true
    }
})

const model = mongoose.model('Payment_details', PaymentsSchema);
model.createIndexes();

module.exports = model;