require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LeadDetailsSchema = new Schema({

    customer_id: {
        type: Number,
        index: true,
        default: 0
    },
    quickbookid: {
        type: Number,
        default: 0
    },
    parent_id: {
        type: Number,
        default: 0
    },
    business_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'business_details',
        index: true
    },
    store_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Store_details',
        index: true,
        default: null
    },
    title: {
        type: String,
        default: ''
    },
    first_name: {
        type: String,
        default: ''
    },
    middle_name: {
        type: String,
        default: ''
    },
    last_name: {
        type: String,
        default: ''
    },
    gender: {
        type: String,
        default: ''
    },
    email_id: {
        type: String,
        trim: true,
        index: true
    },
    mobile: {
        type: String,
        trim: true,
        index: true,
        default: ''
    },
    phone: {
        phone_countrycode: { type: String, trim: true, default: '' },
        phone_dialCode: { type: String, trim: true, default: '' },
        phone: { type: String, trim: true, default: '' },
    },
    address: {
        billing_address: {
            country: { type: String, trim: true, default: '' },
            state: { type: String, trim: true, default: '' },
            city: { type: String, trim: true, default: '' },
            zip: { type: String, trim: true, default: '' },
            address: { type: String, trim: true, default: '' },
            street: { type: String, trim: true, default: '' },
            street2: { type: String, trim: true, default: '' },
            loc: {
                type: { type: String },
                coordinates: [],
                default: ''
            }
        },
        shipping_address: {
            country: { type: String, trim: true, default: '' },
            state: { type: String, trim: true, default: '' },
            city: { type: String, trim: true, default: '' },
            zip: { type: String, trim: true, default: '' },
            address: { type: String, trim: true, default: '' },
            street: { type: String, trim: true, default: '' },
            street2: { type: String, trim: true, default: '' },
            loc: {
                type: { type: String },
                coordinates: [],
                default: ''
            }
        },
        additional_addreses: { type: Object, default: null }
    },
    things_to_remember: {
        type: String,
        trim: true,
        default: ''
    },
    display_name: {
        type: String,
        trim: true,
        default: ''
    },
    customer_group: {
        type: String,
        trim: true,
        default: ''
    },
    followup_status: {
        type: Number,
        trim: true,
        default: 0
    },
    followup_order: {
        type: Number,
        trim: true,
        default: 0
    },
    followup_date: {
        type: Date,
        default: null
    },
    followup_sms_status: {
        type: Number,
        trim: true,
        default: 0
    },
    followup_sms_order: {
        type: Number,
        trim: true,
        default: 0
    },
    followup_sms_date: {
        type: Date,
        default: null
    },
    image: {
        type: String,
        trim: true,
        default: ''
    },
    attachments: { type: Object, default: null },
    assign_to: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        index: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    department: {
        type: String,
        enum: ['Open', 'Attempting Contact', 'Not Engaged', 'Qualified', 'Proposal Sent', 'Negotiation', 'Converted', 'Disqualified'],
        default: 'Open'
    },
    delstatus: {
        type: Number,
        default: 0
    },
    refered_by: {
        type: String,
        default: ''
    },
    company_name: {
        type: String,
        default: ''
    },
    is_converted_to_customer: {
        type: Boolean,
        default: false
    },
    generated_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    assigned_to: {
        type: Array,
        default: []
    },
    converted_date: {
        type: Date,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    created_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    modified_at: {
        type: Date,
        default: null
    },
    modified_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    }
}, { strict: false })

LeadDetailsSchema.set('toObject', { virtuals: true })
LeadDetailsSchema.set('toJSON', { virtuals: true })

LeadDetailsSchema.virtual('userFullname').get(function() {
    return this.first_name + ' ' + this.last_name;
}).set(function(newName) {
    var nameParts = newName.split(' ')
    this.first_name = nameParts[0]
    this.last_name = nameParts[1]
});

LeadDetailsSchema.index({ first_name: 'text', middle_name: 'text', last_name: 'text', company_name: 'text', email_id: 'text', mobile: 'text', 'phone.phone': 'text', 'address.billing_address.country': 'text', 'address.billing_address.state': 'text', 'address.billing_address.city': 'text', 'address.billing_address.address': 'text', things_to_remember: 'text' });

const model = mongoose.model('Lead_details', LeadDetailsSchema);
model.createIndexes();
module.exports = model;