require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var userActivity = new Schema({
    // _id : {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     default : ObjectID()
    // },
    refer_to : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    activity_type : {
        type : String,
        enum : ["chat","location","general_activity","notification","comment"],
        index: true
    },
    activity_from : {
        type : String,
        enum : ["default","invoice","job","calendar","estimate","leads","customer","contacts","inventory","call","sms","small_task","greeting","cloud_file"],
        index: true,
        default: "default"
    },
    module_id : {
        type: mongoose.SchemaTypes.ObjectId,
        default: null,
        index: true
    },
    client: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Lead_details',
        default: null,
        index: true
    },
    files : {
        type : Array, default: []
    },
    if_socket:{ //for chat, socket id
        type : String,
        default : null
    },
    read_status:{ //for chat
        type : String,
        enum : ['Yes','No'],
        default : "No"
    },
    activity_log : {
        type : String,
        default : null
    },
    location: { //useing for location track
        type: { type: String },
        coordinates: [],
        default : ''
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
    }
})

const model = mongoose.model('User_activity', userActivity);
model.createIndexes();

module.exports = model;