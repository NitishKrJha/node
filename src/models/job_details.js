require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var JobDetailsSchema = new Schema({
    // _id :{
    //     type: mongoose.SchemaTypes.ObjectId,
    //     default : ObjectID()
    // },
    job_type: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_type',
        default: null
    },
    attached_invoice: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Invoice_details',
        default: null
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
    dynamic_form_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Dynamic_form',
    },
    title: {
        type: String
    },
    client: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Lead_details',
        default: null,
        index: true
    },
    description: {
        type: String
    },
    requirements: {
        type: String
    },
    jobfor: {
        type: String
    },
    starttime: {
        type: Date,
        default: Date.now
    },
    deadline: {
        type: Date,
        default: Date.now
    },
    job_id: {
        type: Number,
        default: 0
    },
    cost_as: {
        type: String
    },
    cost: {
        type: String
    },
    assignto: {
        type: String
    },
    status: {
        type: String,
        enum: ['0', '1', '2', '3', '4'], //0=initialized,1=accepted,2=startted,3=paused,4=stop 
        default: '0'
    },
    technician_status: {
        type: Number,
        default: 0
    },
    technitions_number: {
        type: String,
        default: ''
    },
    arrivaltime: {
        type: String
    },
    tripCharge: {
        type: Number,
        default: 0.00
    },
    location: {
        type: { type: String },
        coordinates: [],
        default: ''
    },
    drop_location: {
        type: { type: String },
        coordinates: [],
        default: ''
    },
    location_name: {
        type: String,
        default: ''
    },
    invoice_created: {
        type: Number,
        default: 0
    },
    has_invoice: {
        type: Number,
        default: 0
    },
    address: {
        type: String,
        default: ''
    },
    country: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    zip: {
        type: Number
    },
    latitude: {
        type: Number,
        default: 0
    },
    longitude: {
        type: Number,
        default: 0
    },
    drop_address: {
        type: String,
        default: ''
    },
    drop_country: {
        type: String
    },
    drop_city: {
        type: String
    },
    drop_state: {
        type: String
    },
    drop_zip: {
        type: Number
    },
    drop_latitude: {
        type: Number,
        default: 0
    },
    drop_longitude: {
        type: Number,
        default: 0
    },
    countrycode: {
        type: String
    },
    dialCode: {
        type: String
    },
    assigned_employee: {
        type: String
    },
    is_employee: {
        type: String
    },
    planid: {
        type: String,
        default: ''
    },
    post_date: {
        type: Date,
        default: Date.now
    },
    priority: {
        type: String
    },
    serive_lat: {
        type: String
    },
    job_workhour: {
        type: Number,
        default: 0.00
    },
    serive_long: {
        type: String
    },
    service: {
        type: String
    },
    job_more: {
        type: String
    },
    is_default: {
        type: Number
    },
    jobtime: {
        type: String,
        default: '',
    },
    progress: {
        type: Number,
        default: 0
    },
    is_dropped: {
        type: String,
        enum: ['no', 'yes'], 
        default: 'no'
    },
    end_drop_location: {
        type: { type: String },
        coordinates: [],
        default: ''
    },
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    modified_at: {
        type: Date,
        default: Date.now
    },
    modified_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null
    },
    is_deleted: {
        type: Boolean,
        default: false,
        index: true
    }

}, { strict: false })

JobDetailsSchema.index({ title: "text", description: "text", city: "text", country: "text", zip: "text", state: "text" });
JobDetailsSchema.index({ location: "2dsphere" });
//JobDetailsSchema.index({ drop_location: "2dsphere" });
const model = mongoose.model('Job_details', JobDetailsSchema);
model.createIndexes()

module.exports = model;