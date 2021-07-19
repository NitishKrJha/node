require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CallscheduleDetailsSchema = new Schema({

	
    
    parent_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Callschedule_details',
        index: true,
        default: null
    },
    
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    job_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        index: true 
    },
    task_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Small_task',
        index: true 
    },
    customerid: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Lead_details',
        default: null,
        index: true
    },
    memberid: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    
    title: {
        type:String,
        default:''
    },

    riminder_type: {
        type:String,
        default:''
    },
    
    notes: { 
        type:String,
        default:'' 
    },
    reminder_type: {
        type: String,
        default:''
    },
    
    type: {
        type:String,
        enum : ['notes','reminder','todo','scheduler','job','event','meeting','task'],
        default:'notes'
    },
    
    is_deleted: {
        type : String,
        enum : ["0","1"],
        default : "0"
    },
    
    scheduledtime : { 
        type: Date, default: Date.now 
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    modified_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    end_date : { 
        type: Date, default: null 
    },
    created_at : { 
        type: Date, default: null 
    },
     modified_at : { 
        type: Date, default: null 
    }

    
})



CallscheduleDetailsSchema.index({title: 'text'});

const model = mongoose.model('Callschedule_details', CallscheduleDetailsSchema);
model.createIndexes();
module.exports = model;