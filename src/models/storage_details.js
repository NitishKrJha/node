require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StorageDetailsSchema = new Schema({

	
    admin_user_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'business_details',
        index: true 
    },

    record_type : {
        type : String,
        enum : ["Debit","Credit"],
        default : "Debit"
    },

    use_area: {
        type:Number,
        default:0
    },
    
    file_path: { 
        type:String,
        default:'' 
    },
    type: {
        type: String,
        default:'' 
    },
    file_related: {
        type: String, 
        default:'' 
    },
    file_name: {
        type:String,
        default:''
    },
    imgselector: {
        type:String,
        default:''
    },

    note : {
        type:String,
        default:''
    },
    
    delstatus: {
        type : Number,
        default : 0
    },
    
    created_at : { 
        type: Date, default: Date.now 
    },
    update_at : { 
        type: Date, default: Date.now 
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
   
})



StorageDetailsSchema.index({file_name: 'text',type:'text'});

const model = mongoose.model('Storage_details', StorageDetailsSchema);
model.createIndexes();
module.exports = model;