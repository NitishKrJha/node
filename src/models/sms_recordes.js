require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SMSDetailsSchema = new Schema({

	user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    business_id: { 
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Business_details',
        index: true 
    },
    direction : {
        type: String
    },
    from: { 
        type: String
    },
    to: { 
        type: String
    },
    body: { 
        type: String
    },
    status: {
        type: String
    },
    created_at : { 
        type: Date, default: Date.now 
    }
})

SMSDetailsSchema.index({from: 'text', to: 'text'});
const model = mongoose.model('Sms_recordes', SMSDetailsSchema);
model.createIndexes()

module.exports = model;