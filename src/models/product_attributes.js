require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductAttributesSchema = new Schema({
    product_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product_details',
        required: true,
        index: true
    },
    attaributes_list : {
        type : Array,
        default: []
    }
})
const model = mongoose.model('Product_attributes', ProductAttributesSchema);
model.createIndexes()

module.exports = model;