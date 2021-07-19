require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserDetailsSchema = new Schema({

	users_type: {
        type : String,
        enum:['Employee','Admin','Customer','Contractor','Supplier'], 
        default:'Admin'
	},
	parent_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        index: true
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    f_name: { type:String, required: true },
    l_name: { type:String, default : '' },
    email: {
        type: String,
        trim: true,
        index: true
    },
    mobile: {
        mobile_countrycode: { type: String, trim: true, default : ''},
        mobile_dialCode: { type: String, trim: true, default : ''},
        mobile: { type: String, trim: true, default : ''},
    },
    phone: {
        phone_countrycode: { type: String, trim: true, default : ''},
        phone_dialCode: { type: String, trim: true, default : ''},
        phone: { type: String, trim: true, default : ''},
    },
    affiliate_parent_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default : null,
        index: true
    },
    address: {
        country: { type: String, trim: true, default : ''},
        state: { type: String, trim: true, default : ''},
        city: { type: String, trim: true, default : ''},
        zip: { type: String, trim: true, default : ''},
        address: { type: String, trim: true, default : ''},
        street : { type: String, trim: true, default : ''}
    },
    loc: {
        type: { type: String },
        coordinates: [],
        default : ''
    },
    subcription_id: {
        type: String,
        trim: true,
        default : ''
    },
    payment_status : { 
        type : String,
        enum : ["Active","Suspended","Cancelled","Terminated","Failed"],
        default:'Active'
    },
    subscriptionType : {
        type: Number,
        trim: true,
        default : 1
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
    date_of_birth : { type: Date, trim: true, default : ''},
    more_info : {
        billing_rate : { type: String, trim: true, default : ''},
        billing_type : { type: String, trim: true, default : ''},
        available_time : { type: String, trim: true, default : ''},
        employee_id : { type: String, trim: true, default : ''},
        hire_date : { type: Date, trim: true, default : ''},
        released : { type: Date, trim: true, default : ''},
        services : { type: Array, trim: true, default : []},
        employee_color : { type: String, trim: true, default : ''},
        notes : { type: String, trim: true, default : ''}
    },
    store_id : { type: Array, trim: true, default : []},
    created_at : { 
        type: Date, default: Date.now 
    },
    is_deleted : { 
        type : Boolean,
        default : false
    },
    status : {
        type: String,
        enum : ["Active","Inactive"],
        default:'Active'
    },
    device_type : {
        type: String,
        default:'web'
    },
    device_token : {
        type: String,
        default:''
    },
    department: {
        type: String,
        enum: ['Open', 'Attempting Contact', 'Not Engaged', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Disqualified'],
        default: 'Open'
    },
    if_super_user : {
        type: Boolean,
        default:false
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
	
},{strict:false})

UserDetailsSchema.set('toObject', { virtuals: true })
UserDetailsSchema.set('toJSON', { virtuals: true })

UserDetailsSchema.virtual('userFullname').get(function () {
    return this.f_name + ' ' + this.l_name;
}).set(function(newName) {
    var nameParts = newName.split(' ')
    this.f_name = nameParts[0]
    this.f_name = nameParts[1]
});

UserDetailsSchema.index({
    f_name: 'text'
},{ background: false });
const model = mongoose.model('User_details', UserDetailsSchema);
// model.createIndexes()

module.exports = model;