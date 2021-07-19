require('../config/activerecord');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DashboardModelSchema = new Schema({
	user_id: { 
		type : mongoose.Schema.Types.ObjectId,
		ref: 'User_details',
        index: true
	},
	big_widgets: {
		type : Array,
	},
	small_widgets: {
		type : Array,
	},
	display_employee: { type:String, enum:['0','1'], default:'1'},
	report_type: { type:String, enum:['Weekly','Monthly','Quarterly','Half-yearly','Yearly'], default:'Quarterly'},
	updated_at : { type: Date, default: Date.now }
})

module.exports = mongoose.model('Dashboard_setting', DashboardModelSchema);