require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSfGuard = new Schema({

	user_details_id: { 
		type: mongoose.SchemaTypes.ObjectId,
        ref: 'User_details',
        required: true
	},
    email: {
        type: String,
        trim: true,
        index: true,
        required: true,
        //unique: [true , "Email must be unique"]
    },
	username: {
        type: String,
        trim: true,
        index: true,
        sparse: true,
        required: false,
        default : '',
        unique: [true , "Username must be unique"]
    },
	password: {
        type: String,
        trim: true,
        default : '',
        //required: true 
    },
    status: {
        type:String, 
        enum:['Active','Inactive'], 
        default:'Active'
    },
    del_status: {
        type:String, 
        enum:['0','1'], 
        default:'0'
    },
    reset_password_token : {
        type: mongoose.SchemaTypes.ObjectId,
        default : null
    },
    reset_password_request : {
        type: Date, 
        default: null 
    },
    reset_password_on : {
        type: Date, 
        default: null 
    }
	
})

const model = mongoose.model('user_sf_guard', UserSfGuard);
model.createIndexes();
module.exports = model