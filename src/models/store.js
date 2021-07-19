var { db,recordSet } = require('../config/db');
var DashboardModel = require('../models/dashboard_setting');
var InvoiceModel = require('../models/invoice_details');
var StoreModel = require('../models/store_details');
var common = require('../common');
var moment = require('moment');
var forEach = require('async-foreach').forEach;


	get_big_widgets : async function(req, res){
		const user_id = req.params.user_id;
		var return_array = {}; var user_settings = {};

		await StoreModel.find({user_id:parseInt(user_id)}).select('-__v').exec().then( response=>{
			if(response[0])
				user_settings = response[0];
		})


	
	}
}
