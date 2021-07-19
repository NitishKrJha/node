require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserAdditionalDetailsSchema = new Schema({

	user_details_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        index: true
    },
    address_map: { 
        type:String, 
        required: true,
        default : ''
    },
    l_name: { type:String },
    email: {
        type: String,
        trim: true,
        index: true
    },
    mobile: {
        type: String, 
        trim: true, 
        index: true, 
        //unique: [true , "Mobile must be unique"], 
        sparse: true,
        default : ''
    },
    affiliate_parent_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default : null,
        index: true
    },
    address: {
        type: String,
        trim: true,
        default : ''
    },
    country: {
        type: String,
        trim: true,
        default : ''
    },
    state: {
        type: String,
        trim: true,
        default : ''
    },
    city: {
        type: String,
        trim: true,
        default : ''
    },
    zip: {
        type: String,
        trim: true,
        default : ''
    },
    subcription_id: {
        type: String,
        trim: true,
        default : ''
    },
    subscriptionType : {
        type: Number,
        trim: true,
        default : 0
    },
    acount_status : {
        type: String,
        enum : ["Trial","Monthly","Yearly","Client"],
        default:'Trial'
    },
    referal_code : {
        type: String,
        trim: true
    },
    propic: {
        type: String,
        trim: true,
        default : ''
    },
    gender : {
        type: String,
        trim: true,
        default : ''
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
        type: Date, default: Date.now 
    },
    modified_by : {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    delstatus: {
        type : Number,
        default : 0
    },
	
})

UserDetailsSchema.set('toObject', { virtuals: true })
UserDetailsSchema.set('toJSON', { virtuals: true })

UserDetailsSchema.virtual('userFullname').get(function () {
    return this.f_name + ' ' + this.l_name;
}).set(function(newName) {
    var nameParts = newName.split(' ')
    this.f_name = nameParts[0]
    this.f_name = nameParts[1]
});

UserAdditionalDetailsSchema.index({ "loc": "2dsphere" });
const model = mongoose.model('User_additional_details', UserAdditionalDetailsSchema);
model.createIndexes();
module.exports = model;