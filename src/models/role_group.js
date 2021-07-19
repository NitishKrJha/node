require('../config/activerecord');
var mongoose = require('mongoose');
var ObjectID = require('mongodb').ObjectID;
var Schema = mongoose.Schema;

var RoleGroupSchema = new Schema({
    name : {
        type: String,
        default:''
    },
    value : {
        type: Object,
        default:{}
    }
	
})

RoleGroupSchema.index({});
const model = mongoose.model('role_group', RoleGroupSchema);
// model.createIndexes()

module.exports = model;