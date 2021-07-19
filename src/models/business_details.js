require('../config/activerecord');
var mongoose = require('mongoose');
//mongoose.set('debug', true);
var Schema = mongoose.Schema;

var BusinessDetails = new Schema({

	businessID: {
        type: Number,
        index: true,
        default : 0
    },
    business_name: { 
        type:String,
        default:''
    },
    business_email: { 
        type:String,
        default:''
    },
    currency: { 
        type: Number,
        index: true,
        default : 0
    },
    address: { 
        type:String,
        default:''
    },
    country: { 
        type:String,
        default:''
    },
    state: { 
        type:String,
        default:''
    },
    city: { 
        type:String,
        default:''
    },
    zip: { 
        type:String,
        default:''
    },
    business_phone: { 
        type:String,
        default:''
    },
    countrycode: { 
        type:String,
        default:''
    },
    dialCode: { 
        type:String,
        default:''
    },
    vat: { 
        type:Number,
        default:0
    },
    travel_cost: { 
        type:Number,
        default:0
    },
    logo: { 
        type:String,
        default:''
    },
    website: { 
        type:String,
        default:''
    },
    industry: { 
        type:String,
        default:''
    },
    service_type: { 
        type:String,
        default:''
    },
    business_type: { 
        type:String,
        default:''
    },
    business_age: { 
        type:Number,
        default:0
    },
    number_of_owner: { 
        type:Number,
        default:0
    },
    url: { 
        type:String,
        default:''
    },
    googlereviewurl: { 
        type:String,
        default:''
    },
    textarea1: { 
        type:String,
        default:''
    },
    social_name: { 
        type:String,
        default:''
    },
    social_link: { 
        type:String,
        default:''
    },
    textarea2: { 
        type:String,String
    },
    friend_name: { 
        type:String,
        default:''
    },
    friend_number: { 
        type:String,
        default:''
    },
    friend_intrest: { 
        type:String,
        default:''
    },
    delstatus: { 
        type:Number,
        default:0
    },
    post_date: { 
        type:Date,
        default: Date.now 
    },
    token: { 
        type:String,
        default:''
    },
    oauth_consumer_key: { 
        type:String,
        default:''
    },
    oauth_consumer_secret: { 
        type:String,
        default:''
    },
    code: { 
        type:String,
        default:''
    },
    realmId: { 
        type:String,
        default:''
    },
    refresh_token: { 
        type:String,
        default:''
    },
    qbook_webhook_token: { 
        type:String,
        default:''
    },
    templatesettings: { 
        type:String,
        default:''
    },
    is_testing: { 
        type:String,
        default:''
    },
    gclient_id: { 
        type:String,
        default:''
    },
    gclient_secret_key: { 
        type:String,
        default:''
    },
    gredircet_path: { 
        type:String,
        default:''
    },
    gis_testing: { 
        type:String,
        default:''
    },
    paypal_email_id: { 
        type:String,
        default:''
    },
    paypal_password: { 
        type:String,
        default:''
    },
    paypal_client_id: { 
        type:String,
        default:''
    },
    paypal_country: { 
        type:String,
        default:''
    },
    paypal_currency: { 
        type:String,
        default:''
    },
    pis_testing: { 
        type:String,
        default:''
    },
    stripe_publishable_key: { 
        type:String,
        default:''
    },
    stripe_secret_key: { 
        type:String,
        default:''
    },
    stripe_is_testing: { 
        type:String,
        default:''
    },
    authnet_client_id: { 
        type:String,
        default:''
    },
    authnet_transaction_key: { 
        type:String,
        default:''
    },
    authnet_is_testing: { 
        type:String,
        default:''
    },
    number_of_member_approved : {
        type: Number,
        default : 1
    },
    timezone : {
        type: String,
        default: 'America/New_York'
    },
    allowed_storage : {
        type: Number,
        default : 0
    },
    created_at : { 
        type: Date, default: Date.now 
    },
    job_sms: {
        omw_sms: {
            content: { type: String, trim: true, default: '[business_name] service expert is on his way to your location.Find technician details here [technician_details]' }
        },
        reached_sms: {
            content: { type: String, trim: true, default: '[business_name] service expert is on his way to your location.Find technician details here [technician_details]' }
        },
        eod_sms: {
            content: { type: String, trim: true, default: '[business_name] service expert ending the day.' }
        },
        job_sms: {
            content: { type: String, trim: true, default: 'You have an appointment with [businessName] on [jobStart_0] between [jobStart_1] to [arrivaltime] hour to change call:[business_phone]' }
        },
        job_notify_sms: {
            content: { type: String, trim: true, default: '[businessName]  assigned you new [serviceName] job Client Name:[customerName] Client Phone:[customerPhone]. Client Address:[location] [city] [zip]' }
        },
        drop_location_sms: {
            content: { type: String, trim: true, default: 'Your package has been delivered to this location:[location] [city] [zip]' }
        }
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

const model = mongoose.model('Business_details', BusinessDetails);
model.createIndexes();
module.exports = model;