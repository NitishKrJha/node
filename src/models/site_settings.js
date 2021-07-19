require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SiteSettings = new Schema({
    monthly_registration_fee : {
        type : Number,
        default : 35
    },
    yearly_registration_fee : {
        type : Number,
        default : 300
    },
    yearly_per_member_charge : {
        type : Number,
        default : 35
    },
    monthly_per_member_charge : {
        type : Number,
        default : 300
    },
    default_allowed_storage : {
        type : Number,
        default : 36700160
    },
    created_at : {
        type : Date,
        default : Date.now
    }
    
})

const model = mongoose.model('Site_settings', SiteSettings);
model.createIndexes();
module.exports = model