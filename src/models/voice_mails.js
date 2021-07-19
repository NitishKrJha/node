require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VoiceMailSchema = new Schema({
	user_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        default: null,
        index: true
    },
    call_sid: {
         type : String 
    },
    from: { 
        type: String
    },
    to: { 
        type: String
    },
    url: {
        type : String,
    },
    created_at : { 
        type: Date, default: Date.now 
    }
})

VoiceMailSchema.index({from: 'text', to: 'text'});
const model = mongoose.model('Voice_mails', VoiceMailSchema);
model.createIndexes()

module.exports = model;