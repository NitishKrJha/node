require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var InvoiceDetailsSchema = new Schema({

	invoice_id: { 
		type : Number,
        index:true
	},
	qbook_id: {
        type : Number
	},
	invoiceNumber: {
        type : String,
        index:true
    },
    bookmark_name: { type : String },
    invoice_from: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    invoice_to: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Lead_details',
        default: null,
        index: true
    },
    store_id : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Store_details',
        index: true
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    storelocation: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    invoice_date: {
        type: Date,
        default: null
    },
    due_date: {
        type: Date,
        default: null
    },
    total: {
        type: Number
    },
    vat : {
        type: Number
    },
    vat_percentage : {
        type: Number
    },
    vat_name : {
        type: String
    },
    allTotal : {
        type: Number
    },
    totDiscount : {
        type: Number
    },
    post_date : {
        type: Date, default: Date.now
    },
    status : {
        type: Number,
        default:1,
        index:true
    },
    paid_status : {
        type: String,
        enum:['created','pending','paid'], 
        default:'created'
    },
    total_paid : {
        type: Number,
        default:0
    },
    attachments : {
        type: Array,
        default : []
    },
    setremainder : {
        type: String,
        enum:['0','1'],
        default:'0'
    },
    mailidused : {
        type: String,
        default: ''
    },
    email_status : {
        type: String,
        enum:['0','1','2','3'],
        default:'0'
    },
    invoice_status : {
        type: String,
        enum:['0','1','2','3'],
        default:'0'
    },
    ship_status : {
        type: String,
        enum:['0','1','2','3'],
        default:'0'
    },
    is_accepted : {
        type: String,
        enum:['yes','no'],
        default:'no'
    },
    accepted_date : { 
        type: Date
    },
    payment_type : {
        type: String,
        default: ''
    },
    fixed_type : {
        type: String,
        default: ''
    },
    recurring_type : {
        type: String,
        default: ''
    },
    recurring_interval : {
        type: String,
        default: ''
    },
    recurring_interval_count : {
        type: Number
    },
    recurring_cycle : {
        type: Number,
        default: null
    },
    rec_flag : {
        type: Number,
        default:'0'
    },
    followup_status : {
        type: Number,
        default:'0'
    },
    followup_order : {
        type: Number,
        default:'0'
    },
    followup_date : {
        type: Date,
        default: ''
    },
    followup_sms_status: {
        type: Number,
        trim: true,
        default: 0
    },
    followup_sms_order: {
        type: Number,
        trim: true,
        default: 0
    },
    followup_sms_date: {
        type: Date,
        default: null
    },
    estimate_accept : {
        type: Number,
        default:'0'
    },
    note : {
        type: String,
        default : ''
    },
    is_converted:{
        type:Boolean,
        default : false
    },
    is_deleted:{
        type:Boolean,
        default : false
    },
    converted_date : { 
        type: Date, default: null
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default : null
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
    },
    item_details : {
        type : Array, default: []
    },
    refer_to : {
        type: String,
        default: ''
    },
    type_invoice : {
        type: String,
        enum: ['job',''],
        default: ''
    }
	
})

//module.exports = mongoose.model('Invoice_details', InvoiceDetailsSchema);

InvoiceDetailsSchema.index({invoiceNumber: 'text', allTotal: 'text', refer_to:'text',address:'text'});
const model = mongoose.model('Invoice_details', InvoiceDetailsSchema);
model.createIndexes()

module.exports = model;