require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DbLogSchema = new Schema({
    created_at : { 
        type: Date, default: Date.now 
    },
    created_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    belongs_to:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    log_message : {
        type : String
    },
    product_id : {
        type: mongoose.SchemaTypes.ObjectId,
        ref : 'Product_details',
        default: null,
        index: true
    },
    new_product_id : {
        type: mongoose.SchemaTypes.ObjectId,
        ref : 'Product_details',
        default: null,
        index: true
    },
    from_store : {
        type: mongoose.SchemaTypes.ObjectId,
        ref : 'Store_details',
        default: null,
        index: true
    },
    to_store : {
        type: mongoose.SchemaTypes.ObjectId,
        ref : 'Store_details',
        default: null,
        index: true
    },
    quantity :{
        type : Number,
        default : 0
    },
    log_type : {
        type : String,
        enum : ["store_transfer","general","payment","user_access","returned_to_suppliers"],
        index: true
    },
    serial_numbers : {
       type : Array,
       default : null
    }
})

const model = mongoose.model('Db_logs', DbLogSchema);
model.createIndexes();

module.exports = model;