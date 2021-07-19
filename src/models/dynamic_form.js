require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var DynamicFormSchema = new Schema({
    // _id :{
    //     type: mongoose.SchemaTypes.ObjectId,
    //     default : ObjectID()
    // },
    userid : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    formname: { type:String, required: true },
    fields_details: { type:String, required: true },
    permission: { type: Number},
    attachment: { type: Number},
    digitalSignature: { type: Number},
    clock: { type: Number },
    icon: {
        type: String
    },
    startdate: {
        type: Date, default: Date.now
    },
    created_at : { 
        type: Date, default: Date.now 
    },
    status : {
        type: String,
        enum : ["Active","Inactive"],
        default:'Active'
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    modified_at : { 
        type: Date, default: Date.now 
    },
    modified_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    }
	
})

DynamicFormSchema.index({});
const model = mongoose.model('Dynamic_form', DynamicFormSchema);
// model.createIndexes()

module.exports = model;