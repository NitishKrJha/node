require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ContactDetailsSchema = new Schema({

    parent_id: { 
        type: Number,
        default : 0
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'business_details',
        index: true 
    },
    name: {
        type:String,
        default:''
    },
    gender: { 
        type:String,
        default:'' 
    },
    email_id: {
        type: String,
        trim: true,
        index: true
    },
    phone: {
        type: String, 
        trim: true, 
        index: true, 
        default : ''
    },
    address: {
        
            country: { type: String, trim: true, default : ''},
            state: { type: String, trim: true, default : ''},
            city: { type: String, trim: true, default : ''},
            zip: { type: String, trim: true, default : ''},
            address: { type: String, trim: true, default : ''},
    },
    relation_type: {
        type: String,
        default: null
    },
    relation: {
        type: String,
        enum : ["None","Customer","Leads","Job","Member"],
        default:'None'
    },
    relation_name: {
        type: String,
        default: null
    },
    relation_customer : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Lead_details',
        default: null,
        index: true
    },
    relation_job : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        default: null,
        index: true
    },
    relation_member : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    delstatus: {
        type : Number,
        default : 0
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
    }
})



ContactDetailsSchema.index({name: 'text',email_id:'text',phone:'text'});

const model = mongoose.model('Contact_details', ContactDetailsSchema);
model.createIndexes();
module.exports = model;