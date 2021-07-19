var { db,recordSet } = require('../config/db');
var InvoiceModel = require("../models/invoice_details");
var InvoiceNumberModel = require("../models/invoicenumber");
var ObjectID = require('mongodb').ObjectID;
var common_helper = require("../helpers/common_helper");
var fs = require('fs'); 

module.exports = {

	check_invoice_number : async function(req,res){

		var user_type = req.token_data.user_type;
		if(user_type=='Employee')
		{
			var id = req.token_data.parent_id;
		}else{
			var id = req.token_data.id;
		}
		
		var search_array = {};
		if(req.params.id){
			search_array['user_id'] = id;
		}

		try{

		var inv_num = await InvoiceNumberModel.findOne(search_array);

		if(inv_num=="")
		{
			res.status(400).send({
					'error':1,
					'message':'Failed!',
					'data' :[],
				})
		}else{
			res.status(200).send({
					'error':0,
					'message':'Sucess',
					'data' :inv_num
			})
		}

		}catch(e){
			 	return res.status(400).send({
					'error':1,
					'message':'Failed!',
					'data' :[],
					'additional_message' : e
				})
		}
		

	},

	create_invoice_number : async function(req,res){

		var user_type = req.token_data.user_type;
		if(user_type=='Employee')
		{
			var id = req.token_data.parent_id;
		}else{
			var id = req.token_data.id;
		}

		if(!!req.body.my_invoice_number)
		{
			var my_invoice_number=req.body.my_invoice_number;
		}else{
			var my_invoice_number=1000;
		}
		
		var search_array = {};
		if(req.params.id){
			search_array['user_id'] = id;
		}

		try{

			var inv_num = await InvoiceNumberModel.findOne(search_array);

		if(inv_num)
		{
			
			var inv_num_details = await InvoiceNumberModel.findOneAndUpdate({ user_id: id },{$inc : {invoiceID:1}});
			var newinvoice_num=inv_num_details.invoiceID;

		}else{

			var invoic_num = new InvoiceNumberModel({
					user_id : id,
					invoiceID : my_invoice_number
			});
			 var newinvoice_num;
			 try{
			 	await invoic_num.save().then( response=>{
						newinvoice_num = response.invoiceID;
			 	})
			 	}catch(e){
			 	return res.status(400).send({
					'error':1,
					'message':'Failed!',
					'data' :[],
					'additional_message' : e
				})
			 }
		}

		if(newinvoice_num=="")
		{
			res.status(400).send({
					'error':1,
					'message':'Failed!',
					'data' :[],
				})
		}else{
			res.status(200).send({
					'error':0,
					'message':'Inserted Successfully',
					'data' :newinvoice_num
			})
		}

		}catch(e){
			 	return res.status(400).send({
					'error':1,
					'message':'Failed!',
					'data' :[],
					'additional_message' : e
				})
		}
		

	},

	details : async function(req,res){
		var id = req.params.id;
		var search_array = {};
		if(req.params.id){
			search_array['_id'] = id;
		}

		try{
			var details = await InvoiceModel.findOne(search_array);

			if(details)
				res.status(200).send({
					'error':0,
					'message':'Invoice Details',
					'data' :details
				})
			else
				res.status(200).send({
					'error':1,
					'message':'No Record found',
					'data' :[]
				})
		}catch(e){
			res.status(401).send({
				'error':1,
				'message':e,
				'data' :[]
			})
		}
	},

	update_details_invoice : async function(req,res){

		var item_array = [];
		var proDetails = {};

		var uniformed_item_data = (req.body.item)
		var uniformed_price_data = (req.body.price)
		var uniformed_prvid = (req.body.prvid)
		var uniformed_description = (req.body.description)
		var uniformed_pro_qty = (req.body.pro_qty)
		var uniformed_service_id = (req.body.service_id)
		var uniformed_variation_id = (req.body.variation_id)
		var uniformed_service_img = (req.body.service_img)
		var uniformed_taxable = (req.body.taxable)
		var uniformed_discount = (req.body.discount)
		var uniformed_imei = (req.body.imei)

		for(var i in uniformed_item_data){
			
			item_array.push({
				prvid : uniformed_prvid[i]?uniformed_prvid[i]:'',
				pro_item : uniformed_item_data[i]?uniformed_item_data[i]:'',
				description : uniformed_description[i]?uniformed_description[i]:'',
				pro_qty : uniformed_pro_qty[i]?parseInt(uniformed_pro_qty[i]):'',
				pro_amount : uniformed_price_data[i]?parseFloat(uniformed_price_data[i]):'',
				service_id : uniformed_service_id[i]?uniformed_service_id[i]:'',
				variation_id : uniformed_variation_id[i]?uniformed_variation_id[i]:'',
				service_img : uniformed_service_img[i]?uniformed_service_img[i]:'',
				taxable : uniformed_taxable[i]?uniformed_taxable[i]:'',
				discount : uniformed_discount[i]?parseInt(uniformed_discount[i]):'',
				imei : uniformed_imei[i]?uniformed_imei[i]:'',
			})
			

		}

		var attachments_array = [];

		if(req.files && req.files.attachments)
		{
			let filesAmount = req.files.attachments.length;

          	for (i = 0; i < filesAmount; i++) {
			
			
			var attachments_file = common_helper.get_file_name(req.files.attachments[i],true,['jpg','jpeg','png']);
			//console.log(logo_file);
			let attachments = req.files.attachments[i];

			attachments_array.push({attachments});

			if(attachments_file){
				attachments.mv(process.env.FILE_UPLOAD_PATH+'uploads/'+attachments_file);
			}else{
				res.send({
					'file_upload_error':1
				})
			}

		}


		}else{
			var attachments_file="";
		}

			var invoicedetails = {
					qbook_id: req.body.qbook_id,
					bookmark_name : req.body.bookmark_name,
					invoice_to : req.body.invoice_to,
					storelocation : req.body.storelocation,
					address : req.body.address,
					invoice_date : req.body.invoice_date,
					due_date : req.body.due_date,
					total : req.body.total,
					vat : req.body.vat,
					vat_percentage : req.body.vat_percentage,
					vat_name : req.body.vat_name,
					allTotal : req.body.allTotal,
					totDiscount : req.body.totDiscount,
					paid_status : req.body.paid_status==''?'pending':req.body.paid_status,
					payment_type : req.body.payment_type,
					fixed_type : req.body.fixed_type,
					recurring_type : req.body.recurring_type,
					recurring_interval : req.body.recurring_interval,
					recurring_interval_count : req.body.recurring_interval_count,
					recurring_cycle : req.body.recurring_cycle,
					rec_flag : req.body.rec_flag,
					note : req.body.note,
					item_details :item_array,
					attachments : req.body.attached_files
				};
			
			 try{
			 	
			 	var new_invoice_details = await InvoiceModel.findOneAndUpdate({_id:req.params.id},invoicedetails,{
			 		new : true
			 	});
			 	res.status(200).send({
					'error':0,
					'message':'Updated Successfully.',
					'data' :new_invoice_details
				})
			 }catch(e){
			 	res.status(200).send({
					'error':1,
					'message':'Failed!',
					'data' :[]
				})
			 }

		
	},

	insert_details_invoice : async function(req,res){
		//["sony ty","Dell Mouse","Mobile"]
		var item_array = [];
		var proDetails = {};

		var uniformed_item_data = (req.body.item)
		var uniformed_price_data = (req.body.price)
		var uniformed_prvid = (req.body.prvid)
		var uniformed_description = (req.body.description)
		var uniformed_pro_qty = (req.body.pro_qty)
		var uniformed_service_id = (req.body.service_id)
		var uniformed_variation_id = (req.body.variation_id)
		var uniformed_service_img = (req.body.service_img)
		var uniformed_taxable =(req.body.taxable)
		var uniformed_discount = (req.body.discount)
		var uniformed_imei = (req.body.imei)

		for(var i in uniformed_item_data){
			
			item_array.push({
				prvid : uniformed_prvid[i]?uniformed_prvid[i]:'',
				pro_item : uniformed_item_data[i]?uniformed_item_data[i]:'',
				description : uniformed_description[i]?uniformed_description[i]:'',
				pro_qty : uniformed_pro_qty[i]?parseInt(uniformed_pro_qty[i]):'',
				pro_amount : uniformed_price_data[i]?parseFloat(uniformed_price_data[i]):'',
				service_id : uniformed_service_id[i]?uniformed_service_id[i]:'',
				variation_id : uniformed_variation_id[i]?uniformed_variation_id[i]:'',
				service_img : uniformed_service_img[i]?uniformed_service_img[i]:'',
				taxable : uniformed_taxable[i]?uniformed_taxable[i]:'',
				discount : uniformed_discount[i]?parseInt(uniformed_discount[i]):'',
				imei : uniformed_imei[i]?uniformed_imei[i]:'',
			})
			

		}
		var attachments_array = [];

		console.log('req.files',req.files);

		if(req.files && req.files['attachments[]'])
		{
			let filesAmount = req.files['attachments[]'].length;

			//console.log('yyyyy....',req.files['attachments[]'][0]);

          	for (i = 0; i < filesAmount; i++) {
			
			/*fs.unlink(process.env.FILE_UPLOAD_PATH+'uploads/'+details.logo, function (err) {            
	              if (err) {                                                 
	                  console.error(err);                                    
	              }                                                          
	             	console.log('File has been Deleted');                           
	          	  });    */ 
			
			var attachments_file = common_helper.get_file_name(req.files['attachments[]'][i],true,['jpg','jpeg','png']);
			//console.log(logo_file);
			let attachments = req.files['attachments[]'][i];

			attachments_array.push({attachments});

			if(attachments_file){
				attachments.mv(process.env.FILE_UPLOAD_PATH+'uploads/'+attachments_file);
			}else{
				res.send({
					'file_upload_error':1
				})
			}

		}


		}else{
			var attachments_file="";
		}

			 
			/* var inv_num_details = await InvoiceNumberModel.findOneAndUpdate({ user_id: req.token_data.id },{$inc : {invoiceID:1}});*/
			

			 var invoicedetails = new InvoiceModel({
					store_id : req.body.store_id,
					business_id : req.token_data.business_id,
					qbook_id: req.body.qbook_id,
					invoiceNumber : req.body.invoiceID,
					bookmark_name : req.body.bookmark_name,
					invoice_from : req.token_data.id,
					created_by : req.token_data.id,
					invoice_to : req.body.invoice_to,
					storelocation : req.body.storelocation,
					address : req.body.address,
					invoice_date : req.body.invoice_date,
					due_date : req.body.due_date,
					total : req.body.total,
					vat : req.body.vat,
					vat_percentage : req.body.vat_percentage,
					vat_name : req.body.vat_name,
					allTotal : req.body.allTotal,
					totDiscount : req.body.totDiscount,
					status : 2,
					paid_status : req.body.paid_status==''?'pending':req.body.paid_status,
					payment_type : req.body.payment_type,
					fixed_type : req.body.fixed_type,
					recurring_type : req.body.recurring_type,
					recurring_interval : req.body.recurring_interval,
					recurring_interval_count : req.body.recurring_interval_count,
					recurring_cycle : req.body.recurring_cycle,
					rec_flag : req.body.rec_flag,
					note : req.body.note,
					is_converted : true,
					attachments : req.body.attached_files
				});
			 var newinvoice;
			 try{
			 	await invoicedetails.save().then( response=>{
						newinvoice = response;
			 	})

			 			if(typeof newinvoice!=='undefined'){
							InvoiceModel.update(
								{_id : newinvoice._id },
								{ $push : { item_details :item_array }},
								()=>{
								}
							);
						}

			 }catch(e){
			 	return res.status(400).send({
					'error':1,
					'message':'Failed!',
					'data' :[],
					'additional_message' : e
				})
			 }

			 			

			if(newinvoice)
				res.status(200).send({
					'error':0,
					'message':'Inserted Successfully',
					'data' :newinvoice
				})
			else
				res.status(200).send({
					'error':1,
					'message':'Failed!',
					'data' :[]
				})
		
	},

	get_list : async function(req, res){

		var page = 0;
		if(req.body.page)
			page = req.body.page;

		var limit_val = parseInt(req.body.per_page?req.body.per_page:10);

		var skip_record = page*limit_val;

		var user_type = req.token_data.user_type;

		var invoice_type = 1;
		if(req.body.invoice_type=='Invoice'){
			invoice_type = 2;
		}
		var search_array = [{business_id : ObjectID(req.token_data.business_id) },{status : invoice_type }];

		var next_stage_search={};
		if(!!req.body.searchString){
				if(req.body.searchType=='invoicenumber' || req.body.searchType=="amount"){
					search_array.push({
					 	$text : { $search : req.body.searchString }
					 });
				}else{
					next_stage_search[req.body.searchType] = new RegExp(req.body.searchString,"i");
				}
		}

		/*searchString:9830270938
		searchType : invoice_to.phone.phone*/

		if(!!req.body.createdDateFrom){
			//search_array['invoice_date'] = { $gte : new Date(req.body.createdDateFrom) };	
			search_array.push({
					 	'invoice_date' : { $gte : new Date(req.body.createdDateFrom) }
					 });
		}
		if(!!req.body.createdDateTo){
			//search_array['invoice_date'] = { $lte : new Date(req.body.createdDateTo) };
			search_array.push({
					 	'invoice_date' : { $lte : new Date(req.body.createdDateTo) }
					 });
		}

		if(req.body.invoice_to){
			search_array.push({
				'invoice_to' : ObjectID(req.body.invoice_to) 
			});
		}



			var invoice_list = await InvoiceModel.aggregate([
				{$match : {$and : search_array}},
				{$lookup : {from: 'user_details', localField : 'invoice_from', foreignField : '_id',as : 'from'}},
				{$lookup : {from: 'lead_details', localField : 'invoice_to', foreignField : '_id',as : 'invoice_to'}},
				{$match : next_stage_search },
				{$sort:{'_id': -1}}
			]).skip(skip_record).limit(limit_val);

		if(invoice_list.length > 0 ){
			res.status(200).send({
				'error':0,
				'message':'Invoice Details',
				'data' :invoice_list
			})
		}else{
			res.status(200).send({
				'error':1,
				'message':'No Record Found',
				'data' :[]
			})
		}
	}
}