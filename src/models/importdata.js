var { db,recordSet } = require('../config/db');
var UserdetailsModel = require('../models/user_details');
var UserSfGuardModel = require('../models/user_sf_guard');
var InvoiceModel = require('../models/invoice_details');
var StoreModel = require('../models/store_details');
var SupplierModel = require('../models/supplier_info');
var InvoiceProduct = require('../models/invoice_product');
var InvoiceNumber = require('../models/invoicenumber');
var moment = require('moment');
var async = require("async");
const { forEach } = require('async-foreach');

module.exports = {
	
	importUser : async function(req, res){
		var recordSet = await db.select('*')
						.getRecord('tbl_users');

		//return res.send({recordSet})
		var promises = recordSet.map(async function(singleUser, key){

			var Userdetails = new UserdetailsModel({
				user_id: singleUser.user_id,
				users_type: 'Admin',
				title : singleUser.title,
				f_name : singleUser.f_name,
				l_name : singleUser.l_name,
				address : singleUser.address,
				country : singleUser.country,
				state : singleUser.state,
				city : singleUser.city,
				zip : singleUser.zip,
				subcription_id : singleUser.subcription_id,
				subscriptionType : singleUser.subscriptionType,
				referal_code : singleUser.referal_code
			});
			var newuser ;
			try{
				await Userdetails.save().then( response=>{
					newuser = response;
				})
			}catch(e){
				//callback();
			}

			var UserSfGuard = new UserSfGuardModel({
				user_details_id:newuser._id,
				username : singleUser.username,
				mobile: singleUser.mobile,
				email: singleUser.email,
				status : singleUser.status,
				del_status : '0',
				password: singleUser.password,
			})
			try{
				await UserSfGuard.save();
			}catch(e){
				//callback()
			}
		})
		
		await Promise.all(promises);

		var userList;
		await UserdetailsModel.find().select('-__v').exec().then( response=>{
			userList = response;
		})

		res.send({'done':'done','userList':userList});

	},
	getUsers : async function(req, res){
		await UserSfGuardModel.find().populate({path:'user_details_id',select:'f_name l_name'}).select('-__v').exec().then( response=>{
			userList = response;
		})
		res.send({'done':'done','userList':userList});
	},
	importEmployee : async function(req, res){
		var recordSet = await db.select('*')
						.getRecord('tbl_users');

		//return res.send({recordSet})
		var promises = recordSet.map(async function(singleUser, key){
			if(singleUser.username!='' && singleUser.password!=''){
				
				var Userdetails = new UserdetailsModel({
					user_id: singleUser.user_id,
					users_type: 'Admin',
					f_name : singleUser.f_name,
					l_name : singleUser.l_name,
					address : singleUser.address,
					country : singleUser.country,
					state : singleUser.state,
					city : singleUser.city,
					zip : singleUser.zip,
					status : singleUser.status+'',
					subcription_id : singleUser.subcription_id,
					subscriptionType : singleUser.subscriptionType,
					referal_code : singleUser.referal_code
				});
				var newuser ;
				try{
					await Userdetails.save().then( response=>{
						newuser = response;
					})
				}catch(e){
					//callback();
				}

				var UserSfGuard = new UserSfGuardModel({
					user_details_id:newuser._id,
					username : singleUser.username,
					mobile: singleUser.mobile,
					email: singleUser.email,
					password: singleUser.password,
				})
				try{
					await UserSfGuard.save();
				}catch(e){
					//callback()
				}
			}
		})
		
		await Promise.all(promises);

		var userList;
		await UserSfGuardModel.find().select('-__v').exec().then( response=>{
			userList = response;
		})

		res.send({'done':'done','userList':userList});

	},

	add_store: async function(req,res){

		var recordSet = await db.select('*')
				.getRecord('storedetails');

		var promises = recordSet.map(async function(vlaue, key){

			if(vlaue.is_employee!='0')
			{
				var uid=vlaue.is_employee;
				var pid=vlaue.createdby;
				console.log(uid);
			}else{
				var uid=vlaue.createdby;
				var pid=0;
			}
			
			var storedetails = new StoreModel({
				storeid: vlaue.storeid,
				parent_id : pid,
				createdby : uid,
				title : vlaue.title,
				country : vlaue.country,
				location : vlaue.location,
				latitude : vlaue.latitude,
				longitude : vlaue.longitude,
				contact_person : vlaue.contact_person,
				email : vlaue.email,
				countrycode : vlaue.countrycode,
				dialCode : vlaue.dialCode,
				contact_number : vlaue.contact_number,
				status : vlaue.status,
				country : vlaue.country,
				city : vlaue.city,
				state : vlaue.state,
				zip : vlaue.zip,
				is_default : vlaue.is_default,
				createdate : vlaue.createdate,
				modifydate : vlaue.modifydate
			});

			var newstore;
			try{
				await storedetails.save().then( response=>{
					newstore = response;
				})
			}catch(e){
					//callback();
			}
			
		})
		await Promise.all(promises);
		res.send(recordSet)
	},

	add_supplier: async function(req,res){

		var recordSet = await db.select('*')
				.getRecord('supplierinfo');

		var promises = recordSet.map(async function(vlaue, key){

			if(vlaue.is_employee!='0')
			{
				var uid=vlaue.isEmployee;
				var pid=vlaue.parent_id;
				console.log(uid);
			}else{
				var uid=vlaue.parent_id;
				var pid=0;
			}
			
			var SupplierDetails = new SupplierModel({
				supplier_id: vlaue.supplier_id,
				parent_id : pid,
				user_id : uid,
				title : vlaue.title,
				first_name : vlaue.first_name,
				middle_name : vlaue.middle_name,
				last_name : vlaue.last_name,
				suffix : vlaue.suffix,
				company : vlaue.company,
				display_name_as : vlaue.display_name_as,
				address_map : vlaue.address_map,
				street : vlaue.street,
				city : vlaue.city,
				state : vlaue.state,
				pincode : vlaue.pincode,
				country : vlaue.country,
				pan_number : vlaue.pan_number,
				apply_tds_for_this_supplier : vlaue.apply_tds_for_this_supplier,
				notes : vlaue.notes,
				attachments : vlaue.attachments,
				emails : vlaue.emails,
				phone : vlaue.phone,
				mobile_dialCode : vlaue.mobile_dialCode,
				phone_countrycode : vlaue.phone_countrycode,
				phone_dialCode : vlaue.phone_dialCode,
				mobile : vlaue.mobile,
				fax : vlaue.fax,
				website : vlaue.website,
				billing_rate : vlaue.billing_rate,
				terms : vlaue.terms,
				opening_balance : vlaue.opening_balance,
				account_no : vlaue.account_no,
				tax_registration_number : vlaue.tax_registration_number,
				effective_date : vlaue.effective_date,
				store_id : vlaue.store_id,
				status : vlaue.status,
			});

			var newsupplier;
			try{
				await SupplierDetails.save().then( response=>{
					newsupplier = response;
				})
			}catch(e){
					//callback();
			}
			
		})
		await Promise.all(promises);
		res.send(recordSet)
	},

	add_invoice: async function(req,res){
		
		var recordSet = await db.select('*')
		.where('invoice_id >=8913')
				.getRecord('invoiceDetails');

		for(const value of recordSet){
			var Invoicedetails_vars = new InvoiceModel({
				invoice_id: value.invoice_id,
				qbook_id: value.qbook_id,
				invoiceNumber : value.invoiceNumber,
				bookmark_name : value.bookmark_name,
				invoicefrom : value.invoicefrom,
				invoiceto : value.invoiceto,
				store_id : value.store_id,
				storelocation : value.storelocation,
				address : value.address,
				invoiceDate : value.invoiceDate=='0000-00-00'?'':value.invoiceDate,
				dueDate : value.dueDate=='0000-00-00'?'':value.dueDate,
				total : value.total,
				vat : value.vat,
				vat_percentage : value.vat_percentage,
				vat_name : value.vat_name,
				allTotal : value.allTotal,
				totDiscount : value.totDiscount,
				post_date : value.post_date=='0000-00-00'?'':value.post_date,
				status : value.status,
				paid_status : value.paid_status,
				attachments : JSON.parse(JSON.stringify(value.attachments)),
				setremainder : value.setremainder,
				mailidused : value.mailidused,
				email_status : value.email_status,
				invoice_status : value.invoice_status,
				ship_status : value.ship_status,
				payment_type : value.payment_type,
				fixed_type : value.fixed_type,
				recurring_type : value.recurring_type,
				recurring_interval : value.recurring_interval,
				recurring_interval_count : value.recurring_interval_count,
				recurring_cycle : value.recurring_cycle,
				rec_flag : value.rec_flag,
				followup_status : value.followup_status,
				followup_order : value.followup_order,
				followup_date : value.followup_date=='0000-00-00'?'':value.followup_date, 
				estimate_accept : value.estimate_accept,
				note : value.note
			});
			var newinvoice ;
			try{
				await Invoicedetails_vars.save().then(response=>{
					newinvoice = response;
				});
			}catch(e){
				console.log(e);
			}

			if(value.item!="")
			{
				if(value.service_id!="")
				{
					var pro_service_id = JSON.parse(value.service_id);
				}else{
					var pro_service_id = "";
				}
				
				if(value.variation_id!="")
				{
					var pro_variation_id = JSON.parse(value.variation_id);
				}else{
					var pro_variation_id = "";
				}
				
				if(value.prvid!="")
				{
					var pro_prvid = JSON.parse(value.prvid);
				}else{
					var pro_prvid = "";
				}

				if(value.service_img!=""){
					console.log(value.service_img);
					var pro_service_img = JSON.parse(value.service_img);
				}else{
					var pro_service_img = "";
				}
				
				if(value.taxable!=""){
					var pro_taxable = JSON.parse(value.taxable);
				}else{
					var pro_taxable = "";
				}
				
				if(value.discount!="")
				{
					var pro_discount = JSON.parse(value.discount);
				}else{
					var pro_discount = "";
				}

				if(value.item!="")
				{
					var pro_item = JSON.parse(value.item);
				}else{
					var pro_item = "";
				}
				
				if(value.description!="")
				{
					var pro_description = JSON.parse(value.description);
				}else{
					var pro_description = "";
				}
				
				if(value.qty!="")
				{
					var pro_qty = JSON.parse(value.qty);
				}else{
					var pro_qty = "";
				}
				
				if(value.amount!="")
				{
					var pro_amount = JSON.parse(value.amount);
				}else{
					var pro_amount = "";
				}


				if(value.imei!="")
				{
					var imei = value.imei!=''?JSON.parse(value.imei):'';
				}else{
					var imei = "";
				}
				
				if(value.invoice_id > 8913){
					console.log('pro_item',pro_item);
				}
				
				console.log('ok..')

				forEach(pro_item,function(valuel,key){
					var proDetails = {};
					//proDetails.id = newinvoice._id;
					proDetails.service_id = pro_service_id[key]?pro_service_id[key]:'';
					proDetails.variation_id = pro_variation_id[key]?pro_variation_id[key]:'';
					proDetails.prvid = pro_prvid[key]?pro_prvid[key]:'';
					proDetails.service_img = pro_service_img[key]?pro_service_img[key]:'';
					if(pro_taxable !== null)
						proDetails.taxable = pro_taxable[key]?pro_taxable[key]:'';

					if(pro_discount !== null)
						proDetails.discount = pro_discount[key]?parseInt(pro_discount[key]):'';
					
					if(pro_item !== null)
						proDetails.item = pro_item[key]?pro_item[key]:'';
					
					if(pro_description !== null)
						proDetails.description = pro_description[key]?pro_description[key]:'';

					proDetails.pro_qty = pro_qty[key]?parseInt(pro_qty[key]):'';
					proDetails.pro_amount = pro_amount[key]?parseFloat(pro_amount[key]):'';
					
					if(imei !== null)
						proDetails.imei = imei[key]?imei[key]:'';
					//console.log(proDetails);

					if(typeof newinvoice!=='undefined'){
						InvoiceModel.update(
							{_id : newinvoice._id },
							{ $push : { item_details :proDetails }},
							()=>{
								//console.log('Inserted....');
							}
						);
					}
					//Invoicepro.save();
				})
				// pro_item.map(async function(valpro,key){
				// 	//console.log(pro_description[key]);
				// 	var Invoicepro = new InvoiceProduct({
				// 		invoice_id: newinvoice._id,
				// 		item: pro_item,
				// 		description: pro_description[key],
				// 		qty : pro_qty[key],
				// 		amount : pro_amount[key]
				// 	});

				// 	try{
				// 		await Invoicepro.save();
				// 	}catch(e){
						
				// 	}

				// })


				//.find({ 'item.price': 77})
				//.find({ $match : {'item.price': 77}} )
			}
		}


		res.send({"success":"success"});
	}
}



