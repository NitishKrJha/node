require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var ProductonfieldSchema = new Schema({
    // _id :{
    //     type: mongoose.SchemaTypes.ObjectId,
    //     default : ObjectID()
    // },
    jobid : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Job_details',
        default: null,
        index: true
    },
    productid : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product_details',
        default: null,
        index: true
    },
    imei: { type:String, required: true }
})

ProductonfieldSchema.index({});
const model = mongoose.model('Productonfield', ProductonfieldSchema);
// model.createIndexes()

module.exports = model;