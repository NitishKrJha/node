require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
    product_id:{
        type : Number,
        default: 0
    },
	quickbook_id:{
        type : Number,
        default: 0
    },
    name:{
        type : String,
        required : [true, 'Name field is required'],
        default : null,
    },
    sku:{
        type : String,
        default : null,
    },
    has_imei:{
        type : String,
        enum:['Yes','No'],
        default:'No'
    },
    is_taxable:{
        type : String,
        enum:['Yes','No'],
        default:'No'
    },
    category:{
        type : String
    },
    product_type:{
        type : String,
        enum:['Service','Inventory','Non-inventory','On-Demand'],
        default:'Inventory'
    },
    quantity:{
        type : Number,
        default: 0
    },
    as_of_date:{
        type : Date,
        default: null
    },
    low_stock_alert : {
        type : Number,
        default: null
    },
    salesinfo:{
        type : String
    },
    salesprice:{
        type : Number,
        default: 0
    },
    retail_price:{
        type : Number,
        default: 0
    },
    brand:{
        type : String
    },
    image:{
        type : String,
        default : null,
    },
    specification_image:{
        type : String,
        default : null,
    },
    product_url:{
        type : String,
        default : null,
    },
    veriations : {
        type: Array,
        default : null
    },
    imei_numbers :[{
        _id : { type : mongoose.SchemaTypes.ObjectId },
        imei_number : { type : String },
        supplier : { type : mongoose.SchemaTypes.ObjectId },
        used : { type : String, enum: ['Yes','No'], default : 'No' }
    }],
    supplier:{
        type: mongoose.SchemaTypes.ObjectId,
        ref : "Supplier_info",
        default : null,
    },
    store_id : { type: Array, trim: true, default : []},
    is_sold : {
        type : Boolean,
        default: false
    },
    on_field : {
        type : Boolean,
        default: false
    },
    warrenty_time:{
        type : String,
        default : null,
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    created_at : { 
        type: Date, default: Date.now 
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    modified_at : { 
        type: Date, default: null
    },
    modified_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    is_deleted : {
        type : Boolean,
        default : false,
        index:true
    },
    is_returned : {
        type : Boolean,
        default: false,
        index:true
    }
	
})
ProductSchema.index({name: 'text', salesinfo: 'text', sku: 'text'});
const model = mongoose.model('Product_details', ProductSchema);
model.createIndexes()

module.exports = model;