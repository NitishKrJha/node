var { db,recordSet } = require('../config/db');
var UserdetailsModel = require('../models/user_details');
var UserActivityModel = require('../models/user_activity');
var UserSfGuardModel = require('../models/user_sf_guard');
var TempUserModel = require("../models/temp_users");
var BusinessModel = require("../models/business_details");
var SiteSettingsModel = require("../models/site_settings");
var PaymentModel = require("../models/payment_details");
var StorageModel = require("../models/storage_details");
const ApiContracts = require('authorizenet').APIContracts;
const ApiControllers = require('authorizenet').APIControllers;
const SDKConstants = require('authorizenet').Constants;
var ObjectID = require('mongodb').ObjectID;
var md5 = require("crypto-js/md5");
//var sendmail = require('sendmail')();
var nodemailer = require("nodemailer")
var common_helper = require("../helpers/common_helper");
var sendmail = require("../helpers/sendemail");
var constants = require("../config/constraint");
const io = require('socket.io');

module.exports = {
	details : async function(req,res){
		var id = req.params.id ? req.params.id : req.token_data.id;
		var search_array = {};
		var can_proceed = 1;
		
		search_array['_id'] = id;
		
		if(req.params.id){
			if(req.token_data.user_type=="Admin"){
				//search_array['parent_id'] = ObjectID(req.token_data.id);
			}else{
				search_array['parent_id'] = ObjectID(req.token_data.parent_id);
			}
				
		}

		try{
			var details = await UserdetailsModel.findOne(search_array).populate({path : 'parent_id', select: 'acount_status'});
			var userSfGuardDetails = await UserSfGuardModel.findOne({
				user_details_id:search_array['_id']
			},{username:1})
			if(details.parent_id){
				details.acount_status = details.parent_id.acount_status
			}
			details.username = userSfGuardDetails.username;

			if(details)
				res.status(200).send({
					'error':0,
					'message':'User Details',
					'data' :details
				})
			else
				res.status(400).send({
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
	get_list : async function(req, res){
		var user_type = req.token_data.user_type;

		var search_array = {};

		search_array['users_type'] = "Employee";
		search_array['is_deleted'] = false;

		if(user_type=='Admin'){
			search_array['parent_id'] = ObjectID(req.token_data.id);
		}else{
			search_array['parent_id'] = ObjectID(req.token_data.parent_id);
		}
		if(!!req.body.searchDojFrom){
			search_array['more_info.hire_date'] = { $gte : new Date(req.body.searchDojFrom) };
		}
		if(!!req.body.searchDojTo){
			search_array['more_info.hire_date'] = { $lte : new Date(req.body.searchDojFrom) };
		}
		if(!!req.body.releaseDateFrom){
			search_array['more_info.released'] = { $gte : req.body.releaseDateFrom };
		}
		if(!!req.body.releaseDateTo){
			search_array['more_info.released'] = { $lte : req.body.releaseDateTo };;
		}

		if(!!req.body.services){
			search_array['more_info.services'] = { $in : req.body.services.split(",") };
		}

		var regex = {};
		var user_name = {$addFields:{
			   name:{
			    $concat:[
			     '$f_name',
			     ' ',
			     '$l_name',
			    ]
			  }
			}
		}

		if(!!req.body.searchField && !!req.body.searchString){
			if(req.body.searchField=='memberid'){
				search_array['more_info.employee_id'] = { $eq: req.body.searchString } ;
			}
			if(req.body.searchField=='membername'){
				regex = {$match:{
					   name:{ $regex: ".*"+req.body.searchString+".*"}
				}}
			}
		}

		if(Object.keys(regex).length > 0 ){
			var users_list = await UserdetailsModel.aggregate([
				{$match : search_array},
				user_name,
				regex,
				{ $sort : { _id : -1 }}
			]).exec();
		}else{
			var users_list = await UserdetailsModel.aggregate([
				{$match : search_array},
				user_name,
				{ $sort : { _id : -1 }}
			]).exec();
		}

		var total_count = 0;
		// total_count = await UserdetailsModel.countDocuments({
		// 	$match : search_array
		// });

		if(users_list.length > 0 ){
			res.status(200).send({
				'error':0,
				'message':'User Details',
				'data' :users_list,
				total_count:total_count
			})
		}else{
			res.status(200).send({
				'error':1,
				'message':'No Record Found',
				'data' :[],
				total_count:total_count
			})
		}
	},

	do_register : async function(req,res){
		//module.exports.send_user_registration_mail();
		var mail = require("nodemailer").mail;

		var good_chars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
		let user_data = {'acount_status':'Trial'};
		user_data['number_user'] = 1;
		user_data['subscriptionType'] = 1; // trial users

		let amount_tobe_paid = 0;
		let error = {};
		var recurring_length = 1;
		if(!!req.body.type){
			if(req.body.type=='Monthly'){
				user_data['acount_status'] = 'Monthly';
				recurring_length=1;
			}
			if(req.body.type=='Yearly'){
				user_data['acount_status'] = 'Yearly';
				recurring_length=12;
			}
		}
		var site_settings = await SiteSettingsModel.find({}).exec();
		site_settings = site_settings[0];

		if(user_data['acount_status']!='Trial'){
			user_data['number_user'] = req.body.number_user;
			user_data['subscriptionType'] = 5;
			// var j = new SiteSettingsModel();
			// await j.save();

			var number_tobe_multiply = req.body.number_user-1;

			var registration_fee = 0;
			var per_member_charge = 0;
			if(user_data['acount_status'] == 'Monthly'){
				registration_fee = site_settings.monthly_registration_fee;
				per_member_charge = site_settings.monthly_per_member_charge;
			}else{
				registration_fee = site_settings.yearly_registration_fee;
				per_member_charge = site_settings.yearly_per_member_charge;
			}

			amount_tobe_paid = registration_fee + parseFloat(per_member_charge*number_tobe_multiply)
		}

		if(!req.body.f_name){
			error['f_name'] = 'First name is required';
		}else{
			if (!good_chars.test(req.body.f_name)){
				user_data['f_name'] = req.body.f_name;
			}else{
				error['f_name'] = 'Provide valid first name';
			}
		}

		if(!req.body.l_name){
			error['l_name'] = 'Last name is required';
		}else{
			if (!good_chars.test(req.body.l_name)){
				user_data['l_name'] = req.body.l_name;
			}else{
				error['l_name'] = req.body.l_name;
			}
		}

		if(!req.body.mobile){
			error['mobile'] = 'Mobile is required';
		}else{
			var phoneno = /^\d{10}$/;
			if((req.body.mobile).match(phoneno))
				user_data['mobile'] = req.body.mobile;
			else
				error['mobile'] = 'Provide valid mobile number';
		}

		if(!req.body.company_name){
			error['company_name'] = 'Company name is required';
		}else{
			user_data['company_name'] = req.body.company_name;
		}

		if(!req.body.address){
			error['address'] = 'Address is required';
		}else{
			user_data['address'] = req.body.address;
		}

		if(!req.body.city){
			error['city'] = 'City is required';
		}else{
			user_data['city'] = req.body.city;
		}

		if(!req.body.zip){
			error['zip'] = 'Zip is required';
		}else{
			user_data['zip'] = req.body.zip;
		}

		if(!req.body.country){
			error['country'] = 'Country is required';
		}else{
			user_data['country'] = req.body.country;
		}

		// if(!req.body.state){
		// 	error['state'] = 'State is required';
		// }else{
		// 	user_data['state'] = req.body.state;
		// }

		user_data['state'] = "";

		if(!req.body.email){
			error['email'] = 'Email is required';
		}else{
			var re = /\S+@\S+\.\S+/;
			if (re.test(req.body.email))
			{
				user_data['email'] = req.body.email;
			}else{
				error['email'] = 'Provide valid email';
			}
		}

		user_data['username'] = (req.body.email).toLowerCase();

		if(!req.body.password){
			error['password'] = 'Password is required';
		}

		if(!req.body.repassword){
			error['repassword'] = 'Re-type password is required';
		}else{
			if(req.body.repassword !== req.body.password)
				error['repassword'] = 'Repassword must be same with password';
			else
				user_data['password'] = req.body.password;
		}

		if(Object.keys(error).length<=0){
			var check_user = await UserSfGuardModel.findOne({$or : [{username:user_data['username']},{email:user_data['username']}]});
			if(check_user){
				error['username'] = 'Username already exist';
			}
		}
		
		if(Object.keys(error).length <= 0){
			if(req.body.otp){
				var check_otp = await TempUserModel.find({
					email: user_data['email'],
					username: user_data['username'] 
				},{otp:1}).sort({_id:-1}).limit(1);
				
				if(check_otp.length <= 0 || !check_otp || typeof check_otp=='undefined' || req.body.otp != check_otp[0].otp){
					error['otp'] = 'OTP does not match';
				}
			}else{
				var otp = Math.floor(Math.random()*90000) + 10000;
				var temp_data = new TempUserModel({
					email: user_data['email'],
					username: user_data['username'],
					otp: otp
				});

				console.log(res.locals.base_url.slice(0, -6));

				try{
					await temp_data.save();

					var dt = new Date()
					mail({
						from: "CRM RUNNER <info@crmrunner.com>", // sender address
						to: user_data['email'], // list of receivers
						subject: "Registration OTP", // Subject line
						html: `<table style="width: 600px; margin: 0 auto; border: 1px solid #ddd;">
							<tbody><tr>
								<td style="text-align: center">
									<a href="`+res.locals.base_url.slice(0, -6)+`">
										<img src="`+res.locals.base_url.slice(0, -6)+`/public/assets/images/logo.png" alt="" width="160">
									</a>
								</td>
							</tr>
							<tr style="vertical-align: top;">
								<td colspan="2" style="padding: 15px;">
									<p style="font-size: 14px; color: #000; line-height: 22px; padding-top: 20px; line-height: 22px;">
										Hello <span style="font-size: 16px; font-weight: bold;">`+req.body.f_name+` `+req.body.l_name+`,</span>
										<br>
										Thank you for registering to <a href="`+res.locals.base_url.slice(0, -6)+`">https://crmrunner.com</a><br>
				
										Your security is our top priority, if you didn't request this verification code please disregard this email.<br>
				
										Dont share this code with anyone.<br><br>
				
										You verification code is: <strong>`+otp+`</strong><br><br><br>
				
										Best Regards,<br>
										CRM Runner <br>
										Secure Server Department<br>
										<br>												
									</p>
								</td>
							</tr>
							<tr style="background: #1976d2;">
								<td colspan="2" style="padding: 0 15px;">
									<p style="font-size: 12px; color: #fff; text-align: center;">
										COPYRIGHT &copy; `+dt.getFullYear()+`. ALL RIGHTS RESERVED
										<br>
										<a href="www.facebook.com/Crmrunner" style="font-size: 12px; color: #fff; text-align: center;">Facebook</a> | 
										
										<a href="mailto:info@crmrunner.com" style="font-size: 12px; color: #fff; text-align: center;">Email Us</a> | 
										
										<a href="tel:`+site_settings.phone_number+`" style="font-size: 12px; color: #fff; text-align: center;">`+site_settings.phone_number+`</a> | 
									</p>
								</td>
							</tr>
						</tbody></table>` // html body
					});

					return res.header(200).send({
						error:0,
						success:1,
						message:"OTP sent successfully"
					})
				}catch(e){
					return res.header(200).send({
						error:1,
						success:0,
						message:"Some technical error occoured",
						additionsal_message : e
					})
				}
			}
		}

		let AUTHORIZE_LOGIN_KEY = constants.AUTHORIZE_LOGIN_KEY;
		let AUTHORIZE_TRANSACTION_KEY = constants.AUTHORIZE_TRANSACTION_KEY;
		if(req.body.email=='ayanbanrje@gmail.com'){
			AUTHORIZE_LOGIN_KEY="2P94kWxe";
			AUTHORIZE_TRANSACTION_KEY = "3Ct5L7r6uL5b9T87";
		}else{
			AUTHORIZE_LOGIN_KEY="8JxnQ84Jg";
			AUTHORIZE_TRANSACTION_KEY = "9n47R7JHhyMQ2r5w";
		}

		if(Object.keys(error).length<=0){

			if(user_data['acount_status']!='Trial'){
				//Start Payment module intigration//

				var cc = req.body.card_number;
				var cvv = req.body.cvv;
				var expire = req.body.expiry_date;
				var amount = amount_tobe_paid;

				var current_time = new Date().getTime();
				var invoice_number = 'SUB-'+current_time;

				const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
				merchantAuthenticationType.setName(AUTHORIZE_LOGIN_KEY);
				merchantAuthenticationType.setTransactionKey(AUTHORIZE_TRANSACTION_KEY);

				console.log(AUTHORIZE_LOGIN_KEY+':::'+AUTHORIZE_TRANSACTION_KEY+"-"+constants.AUTHORIZE_LOGIN_KEY)

				const creditCard = new ApiContracts.CreditCardType();
				creditCard.setCardNumber(cc);
				creditCard.setExpirationDate(expire);
				creditCard.setCardCode(cvv);
				
				const paymentType = new ApiContracts.PaymentType();
				paymentType.setCreditCard(creditCard);

				const orderDetails = new ApiContracts.OrderType();
				orderDetails.setInvoiceNumber(invoice_number);
				orderDetails.setDescription('Subscription Fee for CRM RUNNER with '+user_data['number_user']+' member');

				const billTo = new ApiContracts.CustomerAddressType();
				billTo.setFirstName(user_data['f_name']);
				billTo.setLastName(user_data['l_name']);
				billTo.setCompany(user_data['company_name']);
				billTo.setAddress(user_data['address']);
				billTo.setCity(user_data['city']);
				billTo.setZip(user_data['zip']);
				billTo.setCountry(user_data['country']);
				billTo.setPhoneNumber(user_data['mobile']);
				billTo.setEmail(user_data['email']);
				
				const transactionRequestType = new ApiContracts.TransactionRequestType();
				transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
				transactionRequestType.setAmount(1);
				transactionRequestType.setPayment(paymentType);
				transactionRequestType.setOrder(orderDetails);
				transactionRequestType.setBillTo(billTo);

				const createRequest = new ApiContracts.CreateTransactionRequest();
				createRequest.setMerchantAuthentication(merchantAuthenticationType);
				createRequest.setTransactionRequest(transactionRequestType);

				var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
				ctrl.setEnvironment(SDKConstants.endpoint.production);

				ctrl.execute(() => {
					const apiResponse = ctrl.getResponse();
					const response = new ApiContracts.CreateTransactionResponse(apiResponse);
			
					if(response !== null) {
						if(response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
							
							if(response.getTransactionResponse().getMessages() !== null) {
								/*console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
								console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
								console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
								console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());*/
								user_data['subcription_id'] = response.getTransactionResponse().getTransId();

								const customer_id = ObjectID();
							
								var payment_details = new PaymentModel({
									customer_id : customer_id,
									transaction_id : response.getTransactionResponse().getTransId(),
									log_message : response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
									invoice_number: invoice_number,
									amount : amount,
									payment_mode:"gateway",
									log_type : "registration"
								});
								payment_details.save();

								// Create recurring //

								const interval = new ApiContracts.PaymentScheduleType.Interval();
								interval.setLength(recurring_length);
								interval.setUnit('months');

								const paymentScheduleType = new ApiContracts.PaymentScheduleType();
								paymentScheduleType.setInterval(interval);
								// paymentScheduleType.setStartDate(new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0,10));
								var registerTrialDay = (site_settings && site_settings.trial_day)?site_settings.trial_day:14;
								paymentScheduleType.setStartDate(new Date(Date.now() + (parseInt(registerTrialDay) * 24 * 60 * 60 * 1000)).toISOString().slice(0,10));
								paymentScheduleType.setTotalOccurrences(9999);
								paymentScheduleType.setTrialOccurrences(0);

								const customer = new ApiContracts.CustomerType();
								customer.setType(ApiContracts.CustomerTypeEnum.BUSINESS);
								customer.setId(invoice_number);
								customer.setEmail(user_data['email']);
								customer.setPhoneNumber(user_data['mobile']);

								const nameAndAddressType = new ApiContracts.NameAndAddressType();
								nameAndAddressType.setFirstName(user_data['f_name']);
								nameAndAddressType.setLastName(user_data['l_name']);
								nameAndAddressType.setCompany(user_data['company']);
								nameAndAddressType.setAddress(user_data['address']);
								nameAndAddressType.setCity(user_data['city']);
								nameAndAddressType.setZip(user_data['zip']);
								nameAndAddressType.setCountry(user_data['country']);

								const arbSubscription = new ApiContracts.ARBSubscriptionType();
								arbSubscription.setName(user_data['f_name']+' '+user_data['l_name']);
								arbSubscription.setPaymentSchedule(paymentScheduleType);
								arbSubscription.setAmount(amount);
								arbSubscription.setTrialAmount(0);
								arbSubscription.setPayment(paymentType);
								arbSubscription.setOrder(orderDetails);
								arbSubscription.setCustomer(customer);
								arbSubscription.setBillTo(nameAndAddressType);
								arbSubscription.setShipTo(nameAndAddressType);

								var createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
								createRequest.setMerchantAuthentication(merchantAuthenticationType);
								createRequest.setSubscription(arbSubscription);

								var ctrlN = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());
								ctrlN.setEnvironment(SDKConstants.endpoint.production);

								ctrlN.execute(async function(){

									var apiResponse = ctrlN.getResponse();

									var response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

									console.log(JSON.stringify(response, null, 2));

									if(response != null){
										if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
											// console.log('Subscription Id : ' + response.getSubscriptionId());
											// console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
											// console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());

											var payment_details = new PaymentModel({
												customer_id : customer_id,
												subscription_id : response.getSubscriptionId(),
												amount : amount,
												log_message : response.getMessages().getMessage()[0].getText(),
												payment_mode:"gateway",
												log_type : "registration_recurring"
											});
											payment_details.save();

											user_data['subcription_id'] = response.getSubscriptionId();
											user_data['_id'] = customer_id;

											user_data['address']={
												"country" : user_data['country'],
												"city" : user_data['city'],
												"zip" : user_data['zip'],
												"address" : user_data['address'],
											}

											var business_data = new BusinessModel({
												business_name : user_data['company_name'],
												created_by : customer_id,
												number_of_member_approved : user_data['number_user'],
												allowed_storage : site_settings.default_allowed_storage
											})
							
											var business_details_data = await business_data.save();

											var storage_add = new StorageModel({
												business_id : business_details_data._id,
												created_by : customer_id,
												record_type : "Credit",
												use_area : site_settings.default_allowed_storage
											});

											await storage_add.save();
							
											user_data['business_id'] = business_details_data._id;

											var user_schema = new UserdetailsModel(user_data);
											//save user details
											user_schema.save();

											var user_login = new UserSfGuardModel({
												user_details_id : customer_id,
												email : user_data['email'],
												username : user_data['username'].toLowerCase(),
												password : md5(user_data['password']).toString(),
												status : 'Active'
											})
											//save login details
											await user_login.save();

											module.exports.send_user_registration_mail(req,res,user_data,site_settings);

											return res.send({ 
												error : 0,
												success : 1,
												message: 'Registration is done.' ,
												additional_message : response.getMessages().getMessage()[0].getText()
											});
										}
										else{
											// console.log('Result Code: ' + response.getMessages().getResultCode());
											// console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
											// console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

											return res.send({ 
												error : 1,
												success : 0,
												message: 'Registration was not successfull.' ,
												additional_message : response.getMessages().getMessage()[0].getText()
											});
										}
									}
									else{
										return res.send({ 
											error : 1,
											success : 0,
											message: 'Registration was not successfull.' ,
											additional_message : "Recurring profile response null"
										});
									}
								});

							} else {
								if(response.getTransactionResponse().getErrors() !== null) {
									let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
									let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
									return res.header(200).send({
										success:0,
										error:1,
										message: "Payment Failed", //`${text}`
										payMessage: `${text}`
									});
								} else {
									return res.header(200).send({ 
										success:0,
										error:1,
										message: 'Transaction failed.' 
									});
								}
							}    
						} else {
							console.log(response.getMessages());
							if(response.getTransactionResponse() !== null && typeof response.getTransactionResponse()!='undefined' && typeof response.getTransactionResponse().getErrors()!='undefined' && response.getTransactionResponse().getErrors() !== null){
								let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
								let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
								return res.header(200).send({
									success:0,
									error:1,
									message:  "Payment Failed",  //`${text}`
									apiMsg:  `${text}`
								});
							} else {
								let code = response.getMessages().getMessage()[0].getCode();
								let text = response.getMessages().getMessage()[0].getText();
								return res.header(200).send({
									success:0,
									error:1,
									message:  "Payment Failed", //text
									apiMsg: text
								});
							}   
						} 
						   
			
					} else {
						return res.header(200).send({ 
							success:0,
							error:1,
							message: 'No response.' 
						});
					}
				});
			}else{
				let new_id = ObjectID();
				user_data['_id'] = new_id;

				var business_data = new BusinessModel({
					business_name : user_data['company_name'],
					created_by : new_id,
					number_of_member_approved : 1,
					allowed_storage : site_settings.default_allowed_storage
				})

				var business_details_data = await business_data.save();

				var storage_add = new StorageModel({
					business_id : business_details_data._id,
					created_by : new_id,
					record_type : "Credit",
					use_area : site_settings.default_allowed_storage
				});

				await storage_add.save();

				user_data['business_id'] = business_details_data._id;
				user_data['address']={
					"country" : user_data['country'],
					"city" : user_data['city'],
					"zip" : user_data['zip'],
					"address" : user_data['address'],
				}

				var user_schema = new UserdetailsModel(user_data);
				//save user details
				await user_schema.save();

				var user_login = new UserSfGuardModel({
					user_details_id : new_id,
					email : user_data['email'],
					username : user_data['username'].toLowerCase(),
					password : md5(user_data['password']).toString(),
					status : 'Active'
				})
				//save login details
				await user_login.save();

				module.exports.send_user_registration_mail(req,res,user_data,site_settings);

				return res.send({ 
					error : 0,
					success : 1,
					message: 'Registration is done.'
				});
			}
		}else{
			//res.send({error,user_data});
			return res.send({
				error:1,
				success:0,
				message:"Payment Failed"
			})
		}

	},

	do_trial_register : async function(req,res){
		//module.exports.send_user_registration_mail();
		var mail = require("nodemailer").mail;

		var good_chars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
		let user_data = {'acount_status':'Trial'};
		user_data['number_user'] = 1;
		user_data['subscriptionType'] = 1; // trial users

		let amount_tobe_paid = 0;
		let error = {};
		var recurring_length = 1;
		if(!!req.body.type){
			if(req.body.type=='Monthly'){
				user_data['acount_status'] = 'Monthly';
				recurring_length=1;
			}
			if(req.body.type=='Yearly'){
				user_data['acount_status'] = 'Yearly';
				recurring_length=12;
			}
		}
		var site_settings = await SiteSettingsModel.find({}).exec();
		site_settings = site_settings[0];

		if(req.body.payment && req.body.payment==1){
			//req.body.number_user = 1;
			console.log('req.body.number_user');
			console.log(req.body.number_user);
			user_data['number_user'] = req.body.number_user;
			user_data['subscriptionType'] = 5;
			// var j = new SiteSettingsModel();
			// await j.save();

			console.log('number_tobe_multiply')

			var number_tobe_multiply = req.body.number_user;

			console.log(number_tobe_multiply)

			var registration_fee = 0;
			var per_member_charge = 0;
			if(user_data['acount_status'] == 'Monthly'){
				registration_fee = site_settings.monthly_registration_fee;
				per_member_charge = site_settings.monthly_per_member_charge;
			}else{
				registration_fee = site_settings.yearly_registration_fee;
				per_member_charge = site_settings.yearly_per_member_charge;
			}

			console.log(registration_fee)
			console.log(per_member_charge)

			amount_tobe_paid = registration_fee + parseFloat(per_member_charge*number_tobe_multiply)
			console.log(amount_tobe_paid)
		}

		if(!req.body.f_name){
			error['f_name'] = 'First name is required';
		}else{
			if (!good_chars.test(req.body.f_name)){
				user_data['f_name'] = req.body.f_name;
			}else{
				error['f_name'] = 'Provide valid first name';
			}
		}

		if(!req.body.l_name){
			error['l_name'] = 'Last name is required';
		}else{
			if (!good_chars.test(req.body.l_name)){
				user_data['l_name'] = req.body.l_name;
			}else{
				error['l_name'] = req.body.l_name;
			}
		}

		if(!req.body.mobile){
			error['mobile'] = 'Mobile is required';
		}else{
			var phoneno = /^\d{10}$/;
			if((req.body.mobile).match(phoneno))
				user_data['mobile'] = req.body.mobile;
			else
				error['mobile'] = 'Provide valid mobile number';
		}

		if(!req.body.company_name){
			error['company_name'] = 'Company name is required';
		}else{
			user_data['company_name'] = req.body.company_name;
		}

		if(!req.body.address){
			error['address'] = 'Address is required';
		}else{
			user_data['address'] = req.body.address;
		}

		if(!req.body.city){
			error['city'] = 'City is required';
		}else{
			user_data['city'] = req.body.city;
		}

		if(!req.body.zip){
			error['zip'] = 'Zip is required';
		}else{
			user_data['zip'] = req.body.zip;
		}

		if(!req.body.country){
			error['country'] = 'Country is required';
		}else{
			user_data['country'] = req.body.country;
		}

		if(!req.body.state){
			error['state'] = 'State is required';
		}else{
			user_data['state'] = req.body.state;
		}

		if(!req.body.email){
			error['email'] = 'Email is required';
		}else{
			var re = /\S+@\S+\.\S+/;
			if (re.test(req.body.email))
			{
				user_data['email'] = req.body.email;
			}else{
				error['email'] = 'Provide valid email';
			}
		}

		user_data['username'] = (req.body.email).toLowerCase();

		if(!req.body.password){
			error['password'] = 'Password is required';
		}

		if(!req.body.repassword){
			error['repassword'] = 'Re-type password is required';
		}else{
			if(req.body.repassword !== req.body.password)
				error['repassword'] = 'Repassword must be same with password';
			else
				user_data['password'] = req.body.password;
		}

		if(Object.keys(error).length<=0){
			var check_user = await UserSfGuardModel.findOne({$or : [{username:user_data['username']},{email:user_data['username']}]});
			if(check_user){
				error['username'] = 'Username already exist';
			}
		}
		
		if(Object.keys(error).length <= 0){
			if(req.body.otp){
				var check_otp = await TempUserModel.find({
					email: user_data['email'],
					username: user_data['username'] 
				},{otp:1}).sort({_id:-1}).limit(1);
				
				if(check_otp.length <= 0 || !check_otp || typeof check_otp=='undefined' || req.body.otp != check_otp[0].otp){
					error['otp'] = 'OTP does not match';
				}else{
					return res.header(200).send({
						error:0,
						success:1,
						message:"OTP verify successfully"
					})
				}
			}else if(req.body.payment && req.body.payment==1){
				if(!req.body.card_number){
					error['card_number'] = 'Card Number is required';
				}
				if(!req.body.cvv){
					error['cvv'] = 'Cvv is required';
				}
				if(!req.body.expiry_date){
					error['expiry_date'] = 'Expiry Date is required';
				}
				if(!req.body.card_holder_name){
					error['card_holder_name'] = 'Card Holder Name is required';
				}
			}else{
				var otp = Math.floor(Math.random()*90000) + 10000;
				var temp_data = new TempUserModel({
					email: user_data['email'],
					username: user_data['username'],
					otp: otp
				});

				console.log(res.locals.base_url.slice(0, -6));

				try{
					await temp_data.save();

					var dt = new Date()
					mail({
						from: "CRM RUNNER <info@crmrunner.com>", // sender address
						to: user_data['email'], // list of receivers
						subject: "Registration OTP", // Subject line
						html: `<table style="width: 600px; margin: 0 auto; border: 1px solid #ddd;">
							<tbody><tr>
								<td style="text-align: center">
									<a href="`+res.locals.base_url.slice(0, -6)+`">
										<img src="`+res.locals.base_url.slice(0, -6)+`/public/assets/images/logo.png" alt="" width="160">
									</a>
								</td>
							</tr>
							<tr style="vertical-align: top;">
								<td colspan="2" style="padding: 15px;">
									<p style="font-size: 14px; color: #000; line-height: 22px; padding-top: 20px; line-height: 22px;">
										Hello <span style="font-size: 16px; font-weight: bold;">`+req.body.f_name+` `+req.body.l_name+`,</span>
										<br>
										Thank you for registering to <a href="`+res.locals.base_url.slice(0, -6)+`">https://crmrunner.com</a><br>
				
										Your security is our top priority, if you didnt request this verification code please disregard this email.<br>
				
										Dont share this code with anyone.<br><br>
				
										You verification code is: <strong>`+otp+`</strong><br><br><br>
				
										Best Regards,<br>
										CRM Runner <br>
										Secure Server Department<br>
										<br>												
									</p>
								</td>
							</tr>
							<tr style="background: #1976d2;">
								<td colspan="2" style="padding: 0 15px;">
									<p style="font-size: 12px; color: #fff; text-align: center;">
										COPYRIGHT &copy; `+dt.getFullYear()+`. ALL RIGHTS RESERVED
										<br>
										<a href="www.facebook.com/Crmrunner" style="font-size: 12px; color: #fff; text-align: center;">Facebook</a> | 
										
										<a href="mailto:info@crmrunner.com" style="font-size: 12px; color: #fff; text-align: center;">Email Us</a> | 
										
										<a href="tel:`+site_settings.phone_number+`" style="font-size: 12px; color: #fff; text-align: center;">`+site_settings.phone_number+`</a> | 
									</p>
								</td>
							</tr>
						</tbody></table>` // html body
					});

					return res.header(200).send({
						error:0,
						success:1,
						message:"OTP sent successfully"
					})
				}catch(e){
					return res.header(200).send({
						error:1,
						success:0,
						message:"Some technical error occoured",
						additionsal_message : e
					})
				}
			}
		}

		if(Object.keys(error).length<=0){

			if(req.body.payment && req.body.payment==1){
				//Start Payment module intigration//

				var cc = (req.body.card_number).replace(/ /g,'');
				var cvv = req.body.cvv;
				var expire = req.body.expiry_date;
				var amount = amount_tobe_paid;

				var current_time = new Date().getTime();
				var invoice_number = 'SUB-'+current_time;

				const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
				merchantAuthenticationType.setName(constants.AUTHORIZE_LOGIN_KEY);
				merchantAuthenticationType.setTransactionKey(constants.AUTHORIZE_TRANSACTION_KEY);

				console.log('AUTHORIZE_LOGIN_KEY');
				console.log(constants.AUTHORIZE_LOGIN_KEY);
				console.log('AUTHORIZE_TRANSACTION_KEY');
				console.log(constants.AUTHORIZE_TRANSACTION_KEY);
				console.log('cc');
				console.log(cc);
				console.log('expire');
				console.log(expire);
				console.log('cvv');
				console.log(amount);
				console.log('site_settings');
				console.log(site_settings);

				const creditCard = new ApiContracts.CreditCardType();
				creditCard.setCardNumber(cc);
				creditCard.setExpirationDate(expire);
				creditCard.setCardCode(cvv);
				
				const paymentType = new ApiContracts.PaymentType();
				paymentType.setCreditCard(creditCard);

				const orderDetails = new ApiContracts.OrderType();
				orderDetails.setInvoiceNumber(invoice_number);
				orderDetails.setDescription('Subscription Fee for CRM RUNNER with '+user_data['number_user']+' member');

				const billTo = new ApiContracts.CustomerAddressType();
				billTo.setFirstName(user_data['f_name']);
				billTo.setLastName(user_data['l_name']);
				billTo.setCompany(user_data['company_name']);
				billTo.setAddress(user_data['address']);
				billTo.setCity(user_data['city']);
				billTo.setZip(user_data['zip']);
				billTo.setCountry(user_data['country']);
				billTo.setPhoneNumber(user_data['mobile']);
				billTo.setEmail(user_data['email']);
				
				const transactionRequestType = new ApiContracts.TransactionRequestType();
				transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
				transactionRequestType.setAmount(amount);
				transactionRequestType.setPayment(paymentType);
				transactionRequestType.setOrder(orderDetails);
				transactionRequestType.setBillTo(billTo);

				const createRequest = new ApiContracts.CreateTransactionRequest();
				createRequest.setMerchantAuthentication(merchantAuthenticationType);
				createRequest.setTransactionRequest(transactionRequestType);

				var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
				console.log('user_data');
				console.log(user_data);



				ctrl.execute(() => {
					const apiResponse = ctrl.getResponse();
					const response = new ApiContracts.CreateTransactionResponse(apiResponse);
					console.log('response');
					console.log(response.getMessages().getResultCode());
					if(response !== null) {
						if(response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
							
							if(response.getTransactionResponse().getMessages() !== null) {
								console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
								console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
								console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
								console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
								user_data['subcription_id'] = response.getTransactionResponse().getTransId();

								const customer_id = ObjectID();
							
								var payment_details = new PaymentModel({
									customer_id : customer_id,
									transaction_id : response.getTransactionResponse().getTransId(),
									log_message : response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
									invoice_number: invoice_number,
									amount : amount,
									payment_mode:"gateway",
									log_type : "registration"
								});
								payment_details.save();

								// Create recurring //

								const interval = new ApiContracts.PaymentScheduleType.Interval();
								interval.setLength(recurring_length);
								interval.setUnit('months');

								const paymentScheduleType = new ApiContracts.PaymentScheduleType();
								paymentScheduleType.setInterval(interval);
								var registerTrialDay = (site_settings && site_settings.trial_day)?site_settings.trial_day:30;
								paymentScheduleType.setStartDate(new Date(Date.now() + (parseInt(registerTrialDay) * 24 * 60 * 60 * 1000)).toISOString().slice(0,10));
								paymentScheduleType.setTotalOccurrences(9999);
								paymentScheduleType.setTrialOccurrences(0);

								const customer = new ApiContracts.CustomerType();
								customer.setType(ApiContracts.CustomerTypeEnum.BUSINESS);
								customer.setId(invoice_number);
								customer.setEmail(user_data['email']);
								customer.setPhoneNumber(user_data['mobile']);

								const nameAndAddressType = new ApiContracts.NameAndAddressType();
								nameAndAddressType.setFirstName(user_data['f_name']);
								nameAndAddressType.setLastName(user_data['l_name']);
								nameAndAddressType.setCompany(user_data['company']);
								nameAndAddressType.setAddress(user_data['address']);
								nameAndAddressType.setCity(user_data['city']);
								nameAndAddressType.setZip(user_data['zip']);
								nameAndAddressType.setCountry(user_data['country']);

								const arbSubscription = new ApiContracts.ARBSubscriptionType();
								arbSubscription.setName(user_data['f_name']+' '+user_data['l_name']);
								arbSubscription.setPaymentSchedule(paymentScheduleType);
								arbSubscription.setAmount(amount);
								arbSubscription.setTrialAmount(0);
								arbSubscription.setPayment(paymentType);
								arbSubscription.setOrder(orderDetails);
								arbSubscription.setCustomer(customer);
								arbSubscription.setBillTo(nameAndAddressType);
								arbSubscription.setShipTo(nameAndAddressType);

								var createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
								createRequest.setMerchantAuthentication(merchantAuthenticationType);
								createRequest.setSubscription(arbSubscription);

								var ctrlN = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());

								ctrlN.execute(async function(){

									var apiResponse = ctrlN.getResponse();

									var response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

									console.log(JSON.stringify(response, null, 2));

									if(response != null){
										if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
											// console.log('Subscription Id : ' + response.getSubscriptionId());
											// console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
											// console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());

											var payment_details = new PaymentModel({
												customer_id : customer_id,
												subscription_id : response.getSubscriptionId(),
												amount : amount,
												log_message : response.getMessages().getMessage()[0].getText(),
												payment_mode:"gateway",
												log_type : "registration_recurring"
											});
											payment_details.save();

											user_data['subcription_id'] = response.getSubscriptionId();
											user_data['_id'] = customer_id;

											user_data['address']={
												"country" : user_data['country'],
												"city" : user_data['city'],
												"zip" : user_data['zip'],
												"address" : user_data['address'],
											}

											var business_data = new BusinessModel({
												business_name : user_data['company_name'],
												created_by : customer_id,
												number_of_member_approved : user_data['number_user'],
												allowed_storage : site_settings.default_allowed_storage
											})
							
											var business_details_data = await business_data.save();

											var storage_add = new StorageModel({
												business_id : business_details_data._id,
												created_by : customer_id,
												record_type : "Credit",
												use_area : site_settings.default_allowed_storage
											});

											await storage_add.save();
							
											user_data['business_id'] = business_details_data._id;

											var user_schema = new UserdetailsModel(user_data);
											//save user details
											user_schema.save();

											var user_login = new UserSfGuardModel({
												user_details_id : customer_id,
												email : user_data['email'],
												username : user_data['username'].toLowerCase(),
												password : md5(user_data['password']).toString(),
												status : 'Active'
											})
											//save login details
											await user_login.save();

											module.exports.send_user_registration_mail(req,res,user_data,site_settings);

											return res.send({ 
												error : 0,
												success : 1,
												message: 'Registration is done.' ,
												additional_message : response.getMessages().getMessage()[0].getText()
											});
										}
										else{
											// console.log('Result Code: ' + response.getMessages().getResultCode());
											// console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
											// console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

											return res.send({ 
												error : 1,
												success : 0,
												message: 'Registration was not successfull.' ,
												additional_message : response.getMessages().getMessage()[0].getText()
											});
										}
									}
									else{
										return res.send({ 
											error : 1,
											success : 0,
											message: 'Registration was not successfull.' ,
											additional_message : "Recurring profile response null"
										});
									}
								});

							} else {
								if(response.getTransactionResponse().getErrors() !== null) {
									let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
									let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
									return res.header(200).send({
										success:0,
										error:1,
										message: "Payment Failed", //`${text}`
										payMessage: `${text}`
									});
								} else {
									return res.header(200).send({ 
										success:0,
										error:1,
										message: 'Transaction failed.' 
									});
								}
							}    
						} else {
							console.log(response.getMessages());
							if(response.getTransactionResponse() !== null && typeof response.getTransactionResponse()!='undefined' && response.getTransactionResponse().getErrors() !== null){
								let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
								let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
								return res.header(200).send({
									success:0,
									error:1,
									message:  "Payment Failed",  //`${text}`
									apiMsg:  `${text}`
								});
							} else {
								let code = response.getMessages().getMessage()[0].getCode();
								let text = response.getMessages().getMessage()[0].getText();
								return res.header(200).send({
									success:0,
									error:1,
									message:  "Payment Failed", //text
									apiMsg: text
								});
							}   
						} 
						   
			
					} else {
						return res.header(200).send({ 
							success:0,
							error:1,
							message: 'No response.' 
						});
					}
				});
			}else{
				let new_id = ObjectID();
				user_data['_id'] = new_id;

				var business_data = new BusinessModel({
					business_name : user_data['company_name'],
					created_by : new_id,
					number_of_member_approved : 1,
					allowed_storage : site_settings.default_allowed_storage
				})

				var business_details_data = await business_data.save();

				var storage_add = new StorageModel({
					business_id : business_details_data._id,
					created_by : new_id,
					record_type : "Credit",
					use_area : site_settings.default_allowed_storage
				});

				await storage_add.save();

				user_data['business_id'] = business_details_data._id;
				user_data['address']={
					"country" : user_data['country'],
					"city" : user_data['city'],
					"zip" : user_data['zip'],
					"address" : user_data['address'],
				}

				var user_schema = new UserdetailsModel(user_data);
				//save user details
				await user_schema.save();

				var user_login = new UserSfGuardModel({
					user_details_id : new_id,
					email : user_data['email'],
					username : user_data['username'].toLowerCase(),
					password : md5(user_data['password']).toString(),
					status : 'Active'
				})
				//save login details
				await user_login.save();

				module.exports.send_user_registration_mail(req,res,user_data,site_settings);

				return res.send({ 
					error : 0,
					success : 1,
					message: 'Registration is done.'
				});
			}
		}else{
			//return res.send({error,user_data});
			return res.send({
				error:1,
				success:0,
				message:"Payment Failed"
			})
		}

	},

	do_now_register : async function(req,res){
		//module.exports.send_user_registration_mail();
		var mail = require("nodemailer").mail;

		var good_chars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
		let user_data = {'acount_status':'Trial'};
		user_data['number_user'] = 1;
		user_data['subscriptionType'] = 1; // trial users

		let amount_tobe_paid = 0;
		let error = {};
		var recurring_length = 1;
		if(!!req.body.type){
			if(req.body.type=='Monthly'){
				user_data['acount_status'] = 'Monthly';
				recurring_length=1;
			}
			if(req.body.type=='Yearly'){
				user_data['acount_status'] = 'Yearly';
				recurring_length=12;
			}
		}
		var site_settings = await SiteSettingsModel.find({}).exec();
		site_settings = site_settings[0];

		if(user_data['acount_status']!='Trial'){
			user_data['number_user'] = req.body.number_user;
			user_data['subscriptionType'] = 5;
			// var j = new SiteSettingsModel();
			// await j.save();

			var number_tobe_multiply = req.body.number_user-1;

			var registration_fee = 0;
			var per_member_charge = 0;
			if(user_data['acount_status'] == 'Monthly'){
				registration_fee = site_settings.monthly_registration_fee;
				per_member_charge = site_settings.monthly_per_member_charge;
			}else{
				registration_fee = site_settings.yearly_registration_fee;
				per_member_charge = site_settings.yearly_per_member_charge;
			}

			amount_tobe_paid = registration_fee + parseFloat(per_member_charge*number_tobe_multiply)
		}

		if(!req.body.f_name){
			error['f_name'] = 'First name is required';
		}else{
			if (!good_chars.test(req.body.f_name)){
				user_data['f_name'] = req.body.f_name;
			}else{
				error['f_name'] = 'Provide valid first name';
			}
		}

		if(!req.body.l_name){
			error['l_name'] = 'Last name is required';
		}else{
			if (!good_chars.test(req.body.l_name)){
				user_data['l_name'] = req.body.l_name;
			}else{
				error['l_name'] = req.body.l_name;
			}
		}

		if(!req.body.mobile){
			error['mobile'] = 'Mobile is required';
		}else{
			var phoneno = /^\d{10}$/;
			if((req.body.mobile).match(phoneno))
				user_data['mobile'] = req.body.mobile;
			else
				error['mobile'] = 'Provide valid mobile number';
		}

		if(!req.body.company_name){
			error['company_name'] = 'Company name is required';
		}else{
			user_data['company_name'] = req.body.company_name;
		}

		if(!req.body.address){
			error['address'] = 'Address is required';
		}else{
			user_data['address'] = req.body.address;
		}

		if(!req.body.city){
			error['city'] = 'City is required';
		}else{
			user_data['city'] = req.body.city;
		}

		if(!req.body.zip){
			error['zip'] = 'Zip is required';
		}else{
			user_data['zip'] = req.body.zip;
		}

		if(!req.body.country){
			error['country'] = 'Country is required';
		}else{
			user_data['country'] = req.body.country;
		}

		if(!req.body.state){
			error['state'] = 'State is required';
		}else{
			user_data['state'] = req.body.state;
		}

		if(!req.body.email){
			error['email'] = 'Email is required';
		}else{
			var re = /\S+@\S+\.\S+/;
			if (re.test(req.body.email))
			{
				user_data['email'] = req.body.email;
			}else{
				error['email'] = 'Provide valid email';
			}
		}

		user_data['username'] = (req.body.email).toLowerCase();

		if(!req.body.password){
			error['password'] = 'Password is required';
		}

		if(!req.body.repassword){
			error['repassword'] = 'Re-type password is required';
		}else{
			if(req.body.repassword !== req.body.password)
				error['repassword'] = 'Repassword must be same with password';
			else
				user_data['password'] = req.body.password;
		}

		if(Object.keys(error).length<=0){
			var check_user = await UserSfGuardModel.findOne({$or : [{username:user_data['username']},{email:user_data['username']}]});
			if(check_user){
				error['username'] = 'Username already exist';
			}
		}
		
		if(Object.keys(error).length <= 0){
			if(req.body.otp){
				var check_otp = await TempUserModel.find({
					email: user_data['email'],
					username: user_data['username'] 
				},{otp:1}).sort({_id:-1}).limit(1);
				
				if(check_otp.length <= 0 || !check_otp || typeof check_otp=='undefined' || req.body.otp != check_otp[0].otp){
					error['otp'] = 'OTP does not match';
				}
			}else{
				var otp = Math.floor(Math.random()*90000) + 10000;
				var temp_data = new TempUserModel({
					email: user_data['email'],
					username: user_data['username'],
					otp: otp
				});

				console.log(res.locals.base_url.slice(0, -6));

				try{
					await temp_data.save();

					var dt = new Date()
					mail({
						from: "CRM RUNNER <info@crmrunner.com>", // sender address
						to: user_data['email'], // list of receivers
						subject: "Registration OTP", // Subject line
						html: `<table style="width: 600px; margin: 0 auto; border: 1px solid #ddd;">
							<tbody><tr>
								<td style="text-align: center">
									<a href="`+res.locals.base_url.slice(0, -6)+`">
										<img src="`+res.locals.base_url.slice(0, -6)+`/public/assets/images/logo.png" alt="" width="160">
									</a>
								</td>
							</tr>
							<tr style="vertical-align: top;">
								<td colspan="2" style="padding: 15px;">
									<p style="font-size: 14px; color: #000; line-height: 22px; padding-top: 20px; line-height: 22px;">
										Hello <span style="font-size: 16px; font-weight: bold;">`+req.body.f_name+` `+req.body.l_name+`,</span>
										<br>
										Thank you for registering to <a href="`+res.locals.base_url.slice(0, -6)+`">https://crmrunner.com</a><br>
				
										Your security is our top priority, if you didnt request this verification code please disregard this email.<br>
				
										Dont share this code with anyone.<br><br>
				
										You verification code is: <strong>`+otp+`</strong><br><br><br>
				
										Best Regards,<br>
										CRM Runner <br>
										Secure Server Department<br>
										<br>												
									</p>
								</td>
							</tr>
							<tr style="background: #1976d2;">
								<td colspan="2" style="padding: 0 15px;">
									<p style="font-size: 12px; color: #fff; text-align: center;">
										COPYRIGHT &copy; `+dt.getFullYear()+`. ALL RIGHTS RESERVED
										<br>
										<a href="www.facebook.com/Crmrunner" style="font-size: 12px; color: #fff; text-align: center;">Facebook</a> | 
										
										<a href="mailto:info@crmrunner.com" style="font-size: 12px; color: #fff; text-align: center;">Email Us</a> | 
										
										<a href="tel:`+site_settings.phone_number+`" style="font-size: 12px; color: #fff; text-align: center;">`+site_settings.phone_number+`</a> | 
									</p>
								</td>
							</tr>
						</tbody></table>` // html body
					});

					return res.header(200).send({
						error:0,
						success:1,
						message:"OTP sent successfully"
					})
				}catch(e){
					return res.header(200).send({
						error:1,
						success:0,
						message:"Some technical error occoured",
						additionsal_message : e
					})
				}
			}
		}

		if(Object.keys(error).length<=0){

			if(user_data['acount_status']!='Trial'){
				//Start Payment module intigration//

				var cc = req.body.card_number;
				var cvv = req.body.cvv;
				var expire = req.body.expiry_date;
				var amount = amount_tobe_paid;

				var current_time = new Date().getTime();
				var invoice_number = 'SUB-'+current_time;

				const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
				merchantAuthenticationType.setName(constants.AUTHORIZE_LOGIN_KEY);
				merchantAuthenticationType.setTransactionKey(constants.AUTHORIZE_TRANSACTION_KEY);

				const creditCard = new ApiContracts.CreditCardType();
				creditCard.setCardNumber(cc);
				creditCard.setExpirationDate(expire);
				creditCard.setCardCode(cvv);
				
				const paymentType = new ApiContracts.PaymentType();
				paymentType.setCreditCard(creditCard);

				const orderDetails = new ApiContracts.OrderType();
				orderDetails.setInvoiceNumber(invoice_number);
				orderDetails.setDescription('Subscription Fee for CRM RUNNER with '+user_data['number_user']+' member');

				const billTo = new ApiContracts.CustomerAddressType();
				billTo.setFirstName(user_data['f_name']);
				billTo.setLastName(user_data['l_name']);
				billTo.setCompany(user_data['company_name']);
				billTo.setAddress(user_data['address']);
				billTo.setCity(user_data['city']);
				billTo.setZip(user_data['zip']);
				billTo.setCountry(user_data['country']);
				billTo.setPhoneNumber(user_data['mobile']);
				billTo.setEmail(user_data['email']);
				
				const transactionRequestType = new ApiContracts.TransactionRequestType();
				transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
				transactionRequestType.setAmount(amount);
				transactionRequestType.setPayment(paymentType);
				transactionRequestType.setOrder(orderDetails);
				transactionRequestType.setBillTo(billTo);

				const createRequest = new ApiContracts.CreateTransactionRequest();
				createRequest.setMerchantAuthentication(merchantAuthenticationType);
				createRequest.setTransactionRequest(transactionRequestType);

				var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

				ctrl.execute(() => {
					const apiResponse = ctrl.getResponse();
					const response = new ApiContracts.CreateTransactionResponse(apiResponse);
			
					if(response !== null) {
						if(response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
							
							if(response.getTransactionResponse().getMessages() !== null) {
								console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
								console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
								console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
								console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
								user_data['subcription_id'] = response.getTransactionResponse().getTransId();

								const customer_id = ObjectID();
							
								var payment_details = new PaymentModel({
									customer_id : customer_id,
									transaction_id : response.getTransactionResponse().getTransId(),
									log_message : response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
									invoice_number: invoice_number,
									amount : amount,
									payment_mode:"gateway",
									log_type : "registration"
								});
								payment_details.save();

								// Create recurring //

								const interval = new ApiContracts.PaymentScheduleType.Interval();
								interval.setLength(recurring_length);
								interval.setUnit('months');

								const paymentScheduleType = new ApiContracts.PaymentScheduleType();
								paymentScheduleType.setInterval(interval);
								paymentScheduleType.setStartDate(new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0,10));
								paymentScheduleType.setTotalOccurrences(9999);
								paymentScheduleType.setTrialOccurrences(0);

								const customer = new ApiContracts.CustomerType();
								customer.setType(ApiContracts.CustomerTypeEnum.BUSINESS);
								customer.setId(invoice_number);
								customer.setEmail(user_data['email']);
								customer.setPhoneNumber(user_data['mobile']);

								const nameAndAddressType = new ApiContracts.NameAndAddressType();
								nameAndAddressType.setFirstName(user_data['f_name']);
								nameAndAddressType.setLastName(user_data['l_name']);
								nameAndAddressType.setCompany(user_data['company']);
								nameAndAddressType.setAddress(user_data['address']);
								nameAndAddressType.setCity(user_data['city']);
								nameAndAddressType.setZip(user_data['zip']);
								nameAndAddressType.setCountry(user_data['country']);

								const arbSubscription = new ApiContracts.ARBSubscriptionType();
								arbSubscription.setName(user_data['f_name']+' '+user_data['l_name']);
								arbSubscription.setPaymentSchedule(paymentScheduleType);
								arbSubscription.setAmount(amount);
								arbSubscription.setTrialAmount(0);
								arbSubscription.setPayment(paymentType);
								arbSubscription.setOrder(orderDetails);
								arbSubscription.setCustomer(customer);
								arbSubscription.setBillTo(nameAndAddressType);
								arbSubscription.setShipTo(nameAndAddressType);

								var createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
								createRequest.setMerchantAuthentication(merchantAuthenticationType);
								createRequest.setSubscription(arbSubscription);

								var ctrlN = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());

								ctrlN.execute(async function(){

									var apiResponse = ctrlN.getResponse();

									var response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

									console.log(JSON.stringify(response, null, 2));

									if(response != null){
										if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
											// console.log('Subscription Id : ' + response.getSubscriptionId());
											// console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
											// console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());

											var payment_details = new PaymentModel({
												customer_id : customer_id,
												subscription_id : response.getSubscriptionId(),
												amount : amount,
												log_message : response.getMessages().getMessage()[0].getText(),
												payment_mode:"gateway",
												log_type : "registration_recurring"
											});
											payment_details.save();

											user_data['subcription_id'] = response.getSubscriptionId();
											user_data['_id'] = customer_id;

											user_data['address']={
												"country" : user_data['country'],
												"city" : user_data['city'],
												"zip" : user_data['zip'],
												"address" : user_data['address'],
											}

											var business_data = new BusinessModel({
												business_name : user_data['company_name'],
												created_by : customer_id,
												number_of_member_approved : user_data['number_user'],
												allowed_storage : site_settings.default_allowed_storage
											})
							
											var business_details_data = await business_data.save();

											var storage_add = new StorageModel({
												business_id : business_details_data._id,
												created_by : customer_id,
												record_type : "Credit",
												use_area : site_settings.default_allowed_storage
											});

											await storage_add.save();
							
											user_data['business_id'] = business_details_data._id;

											var user_schema = new UserdetailsModel(user_data);
											//save user details
											user_schema.save();

											var user_login = new UserSfGuardModel({
												user_details_id : customer_id,
												email : user_data['email'],
												username : user_data['username'].toLowerCase(),
												password : md5(user_data['password']).toString(),
												status : 'Active'
											})
											//save login details
											await user_login.save();

											module.exports.send_user_registration_mail(req,res,user_data,site_settings);

											return res.send({ 
												error : 0,
												success : 1,
												message: 'Registration is done.' ,
												additional_message : response.getMessages().getMessage()[0].getText()
											});
										}
										else{
											// console.log('Result Code: ' + response.getMessages().getResultCode());
											// console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
											// console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

											return res.send({ 
												error : 1,
												success : 0,
												message: 'Registration was not successfull.' ,
												additional_message : response.getMessages().getMessage()[0].getText()
											});
										}
									}
									else{
										return res.send({ 
											error : 1,
											success : 0,
											message: 'Registration was not successfull.' ,
											additional_message : "Recurring profile response null"
										});
									}
								});

							} else {
								if(response.getTransactionResponse().getErrors() !== null) {
									let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
									let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
									return res.header(200).send({
										success:0,
										error:1,
										message: "Payment Failed", //`${text}`
										payMessage: `${text}`
									});
								} else {
									return res.header(200).send({ 
										success:0,
										error:1,
										message: 'Transaction failed.' 
									});
								}
							}    
						} else {
							console.log(response.getMessages());
							if(response.getTransactionResponse() !== null && typeof response.getTransactionResponse()!='undefined' && response.getTransactionResponse().getErrors() !== null){
								let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
								let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
								return res.header(200).send({
									success:0,
									error:1,
									message:  "Payment Failed",  //`${text}`
									apiMsg:  `${text}`
								});
							} else {
								let code = response.getMessages().getMessage()[0].getCode();
								let text = response.getMessages().getMessage()[0].getText();
								return res.header(200).send({
									success:0,
									error:1,
									message:  "Payment Failed", //text
									apiMsg: text
								});
							}   
						} 
						   
			
					} else {
						return res.header(200).send({ 
							success:0,
							error:1,
							message: 'No response.' 
						});
					}
				});
			}else{
				let new_id = ObjectID();
				user_data['_id'] = new_id;

				var business_data = new BusinessModel({
					business_name : user_data['company_name'],
					created_by : new_id,
					number_of_member_approved : 1,
					allowed_storage : site_settings.default_allowed_storage
				})

				var business_details_data = await business_data.save();

				var storage_add = new StorageModel({
					business_id : business_details_data._id,
					created_by : new_id,
					record_type : "Credit",
					use_area : site_settings.default_allowed_storage
				});

				await storage_add.save();

				user_data['business_id'] = business_details_data._id;
				user_data['address']={
					"country" : user_data['country'],
					"city" : user_data['city'],
					"zip" : user_data['zip'],
					"address" : user_data['address'],
				}

				var user_schema = new UserdetailsModel(user_data);
				//save user details
				await user_schema.save();

				var user_login = new UserSfGuardModel({
					user_details_id : new_id,
					email : user_data['email'],
					username : user_data['username'].toLowerCase(),
					password : md5(user_data['password']).toString(),
					status : 'Active'
				})
				//save login details
				await user_login.save();

				module.exports.send_user_registration_mail(req,res,user_data,site_settings);

				return res.send({ 
					error : 0,
					success : 1,
					message: 'Registration is done.'
				});
			}
		}else{
			//res.send({error,user_data});
			return res.send({
				error:1,
				success:0,
				message:"Payment Failed"
			})
		}

	},

	quick_update : async function(req,res){
		try{
			let update = await ProductModel.findByIdAndUpdate(req.body.id,
				{
					[req.body.field]: req.body.value,
					modified_at: new Date(),
					modified_by : req.token_data.id
				});

			return res.header(200).send({
				error : update?0:1,
				success : update?1:0,
				message : update?"Quantuty updated":"Product not found",
				data : update
			})

		}catch(e){
			return res.header(200).send({
				error : 1,
				success : 0,
				message : "Operation was not successfull",
				data : []
			})
		}
	},

	update_member : async function(req,res){
		var update_array_details = {};
		var update_array_sf_guard = {};
		if(req.body.delete && req.body.delete==1){
			update_array_details['is_deleted'] = true;
			update_array_details['modified_by'] = req.token_data.id;
			update_array_details['modified_at'] = new Date();

			update_array_sf_guard['del_status'] = "1";

		}
		if(req.body.status){
			update_array_details['status'] = req.body.status;
			update_array_details['modified_by'] = req.token_data.id;
			update_array_details['modified_at'] = new Date();

			update_array_sf_guard['status'] = req.body.status;
		}

		try{
			await UserdetailsModel.findByIdAndUpdate(req.body.id,update_array_details);
			await UserSfGuardModel.findOneAndUpdate({user_details_id:ObjectID(req.body.id)},update_array_sf_guard);

			res.header(200).send({
				success:1,
				error:0,
				message : "User details updated"
			})

		}catch(e){
			res.header(200).send({
				success:0,
				error:1,
				message : e
			})
		}
	},

	send_user_registration_mail : async function(req,res,user_data,site_settings){
		site_settings = JSON.parse(JSON.stringify(site_settings));
		
		var mail = require("nodemailer").mail;
		var dt = new Date()
		var html =	`<table style="width: 600px; margin: 0 auto; border: 1px solid #ddd;">
			<tbody><tr>
				<td style="text-align: center">
					<a href="`+res.locals.base_url.slice(0, -6)+`">
					<img src="`+res.locals.base_url.slice(0, -6)+`/public/assets/images/logo.png" alt="" width="160">
					</a>
				</td>
			</tr>
			<tr style="height: 400px; vertical-align: top;">
				<td colspan="2" style="padding: 15px;">
					<p style="font-size: 14px; color: #000; line-height: 22px; padding-top: 20px; line-height: 22px;">
						Hi <span style="font-size: 16px; font-weight: bold;">`+user_data.company_name+`,</span>
						<br>
						Thank you for registering to <a href="https://crmrunner.com" style="color: #2C2D70; text-decoration: none; font-weight: bold;">CRMRUNNER.COM</a> ! <b>We have received your registration.</b> 
						<br><br>
						Here are your login details:<br>
						<b>User name: `+user_data.username+`</b>
						<br>
						Login page: <a href="`+res.locals.base_url.slice(0, -6)+`/crm">https://crmrunner.com/crm/</a>
						<br>
						One of our support specialists will give you a call to go over the platform.
						<br>
						Thank you again for your registration.
						
					</p>
				</td>
			</tr>
			<tr style="background: #1976d2;">
				<td colspan="2" style="padding: 0 15px;">
					<p style="font-size: 12px; color: #fff; text-align: center;">
						COPYRIGHT © `+dt.getFullYear()+`. ALL RIGHTS RESERVED
						<br>
						<a href="`+site_settings.facebook_link+`" style="font-size: 12px; color: #fff; text-align: center;">Facebook</a> | 
						
						<a href="mailto:`+site_settings.contact_email+`" style="font-size: 12px; color: #fff; text-align: center;">Email Us</a> | 
						
						<a href="tel:`+site_settings.phone_number+`" style="font-size: 12px; color: #fff; text-align: center;">`+site_settings.phone_number+`</a> | 
					</p>
				</td>
			</tr>
		</tbody></table>`;
		console.log('site_settings.contact_email',site_settings.contact_email);
		mail({
			from: "CRM RUNNER <"+site_settings.contact_email+">", // sender address
			to: user_data['email'], // list of receivers
			subject: "Welcome to CRM RUNNER", // Subject line
			html: html
		});

		var html =	`<table style="width: 600px; margin: 0 auto; border: 1px solid #ddd;">
			<tbody><tr>
				<td style="text-align: center">
					<a href="`+res.locals.base_url.slice(0, -6)+`">
					<img src="`+res.locals.base_url.slice(0, -6)+`/public/assets/images/logo.png" alt="" width="160">
					</a>
				</td>
			</tr>
			<tr style="height: 400px; vertical-align: top;">
				<td colspan="2" style="padding: 15px;">
					<p style="font-size: 14px; color: #000; line-height: 22px; padding-top: 20px; line-height: 22px;">
						Hi <span style="font-size: 16px; font-weight: bold;">David,</span>
						<br>
						<p style="font-size: 14px; color: #000; line-height: 22px; padding-top: 20px; line-height: 22px;">
							Hi <span style="font-size: 16px; font-weight: bold;">David,</span>
							<br>
							A new user is register to CRM Runner
							<br>
							Username : `+user_data.username+`	<br>
							Email : `+user_data.email+`	<br>
							Phone : `+user_data.mobile+`	<br>	
							Name : `+user_data.f_name+` `+user_data.l_name+`<br>
							Company Name : `+user_data.company_name+`	<br>
							Address : `+user_data.address.address+`	<br>
							POST Code : `+user_data.address.zip+`	<br>			
						</p>
					</p>
				</td>
			</tr>
			<tr style="background: #1976d2;">
				<td colspan="2" style="padding: 0 15px;">
					<p style="font-size: 12px; color: #fff; text-align: center;">
						COPYRIGHT © `+dt.getFullYear()+`. ALL RIGHTS RESERVED
						<br>
						<a href="`+site_settings.facebook_link+`" style="font-size: 12px; color: #fff; text-align: center;">Facebook</a> | 
						
						<a href="mailto:`+site_settings.contact_email+`" style="font-size: 12px; color: #fff; text-align: center;">Email Us</a> | 
						
						<a href="tel:`+site_settings.phone_number+`" style="font-size: 12px; color: #fff; text-align: center;">`+site_settings.phone_number+`</a> | 
					</p>
				</td>
			</tr>
		</tbody></table>`;
		
		mail({
			from: "CRM RUNNER <"+site_settings.contact_email+">", // sender address
			to: site_settings.company_email, // list of receivers
			subject: "Crmrunner (New Registration)", // Subject line
			html: html
		});
	},

	change_password : async function(req,res){

		var error_data = {};

		if(!req.body.old_admin_pwd){
			error_data['error'] = "Old password is required";
		}
		if(!req.body.new_admin_pwd){
			error_data['error'] = "New password is required";
		}
		if(!req.body.conf_new_admin_pwd){
			error_data['error'] = "Confirm password is required";
		}

		if(req.body.conf_new_admin_pwd!=req.body.new_admin_pwd){
			error_data['error'] = "Password and confirm password does not match"
		}

		if(Object.keys(error_data).length <= 0){
			var old_password = req.body.old_admin_pwd;
			var new_admin_pwd = req.body.new_admin_pwd;
			var conf_new_admin_pwd = req.body.conf_new_admin_pwd;
			
			var user_old_details = await UserSfGuardModel.findOne({user_details_id:req.token_data.id},{password:1});
			
			if(user_old_details.password != md5(old_password).toString()){
				error_data['error'] = "Old password does not match";
			}else{
				try{
					await UserSfGuardModel.findOneAndUpdate({user_details_id:req.token_data.id},{
						password : md5(conf_new_admin_pwd).toString()
					});
				}catch(e){
					error_data['error'] = e;
				}
			}
			
		}

		return res.header(200).send({
			error : Object.keys(error_data).length>0?1:0,
			success : Object.keys(error_data).length>0?0:1,
			message : Object.keys(error_data).length>0?error_data['error']:"Password changed successfully"			
		})
	},

	forget_password : async function(req,res){
		var email = req.body.email;

		if(!email || email==''){
			return res.header(200).send({
				error:1,
				success:0,
				message : "Email field is required"
			})
		}
		var if_user_exist = await UserdetailsModel.findOne({
			email : email
		},{_id:1,f_name:1,l_name:1});

		if(if_user_exist){
			var sf_guard_user = await UserSfGuardModel.find({user_details_id:if_user_exist._id});
			if(sf_guard_user){
				var reset_password_token = ObjectID();
				UserSfGuardModel.updateOne(
					{user_details_id:if_user_exist._id},
					{ $set : {
							reset_password_token : reset_password_token,
							reset_password_request : new Date()
						}
					}
				).then((obj)=>{
					sendmail.sendemail({
						to : req.body.email,
						code : 'forgetpassword',
						content : `<p>Dear `+if_user_exist.userFullname+`,
						<br>
						<a href="`+constants.SITE_URL+`/resetpassword/`+reset_password_token+`">Click Here</a> to reset your password.`
						
					});
					res.header(200).send({
						error:0,
						success:1,
						message : "Email send, please follow the link in the email."
					})

				})
			}else{
				res.header(200).send({
					error:1,
					success:0,
					message : "Email does not exist"
				})
			}
		}else{
			res.header(200).send({
				error:1,
				success:0,
				message : "Email does not exist"
			})
		}
	},

	reset_password : async function(req,res){
		var error_data = {};

		if(!req.body.new_admin_pwd){
			error_data['error'] = "New password is required";
		}
		if(!req.body.conf_new_admin_pwd){
			error_data['error'] = "Confirm password is required";
		}

		if(req.body.conf_new_admin_pwd!=req.body.new_admin_pwd){
			error_data['error'] = "Password and confirm password does not match";
		}

		if(Object.keys(error_data).length <= 0){
			var reset_token = req.params.reset_token;

			var user_details = await UserSfGuardModel.findOne({reset_password_token:reset_token});
			
			if(user_details){
				await UserSfGuardModel.findByIdAndUpdate(user_details._id,{
					$unset : {reset_password_token : 1},
					//reset_password_token : null,
					reset_password_on : new Date(),
					password : md5(req.body.new_admin_pwd).toString()
				})
			}else{
				error_data['error'] = "User not found"
			}
		}

		res.header(200).send({
			error : Object.keys(error_data).length>0?1:0,
			success : Object.keys(error_data).length>0?0:1,
			message : Object.keys(error_data).length>0?error_data['error']:"Password changed successfully"			
		})
	},

	get_user_location : async function(req, res){
		req.io.to(req.token_data.business_id).emit("message", "lo lo");
		var user_details = await UserdetailsModel.find({
			business_id : req.token_data.business_id,
			users_type : "Employee",
			is_deleted : false,
			status:"Active"
		},{
			f_name:1,
			l_name:1,
			loc:1,
			email:1
		});

		if(req.body.employee_id){
			user_details['_id'] = ObjectID(req.body.employee_id);
		}

		if(user_details)
			res.header(200).send({
				success:1,
				error:0,
				data: user_details
			})
		else
			res.header(200).send({
				success:0,
				error:1,
				data: []
			})
	},
	get_chat_users : async function(req, res){
		let chat_users = await UserActivityModel.aggregate([
			{
				$match : {
					activity_type : "chat",
					business_id: ObjectID(req.token_data.business_id),
					refer_to: ObjectID(req.token_data.id),
				}
			},
			{
				$group : {
					_id:'$created_by'
				}
			},
			{ $sort : { _id : -1 } }
		
		]);

		var eliminatedUsers = [];

		if(chat_users.length > 0){
			chat_users.forEach(singleUser=>{
				eliminatedUsers.push(ObjectID(singleUser._id))
			})
		}

		let chatCount = await UserActivityModel.aggregate([
			{ "$match" : { 
				read_status:"No",
				activity_type : "chat",
				refer_to: ObjectID(req.token_data.id)
			}},
			{"$group" : {_id:"$created_by", count:{$sum:1}}}
		])

		let exist_chat_users_details_one = await UserdetailsModel.find({ 
			_id : { $in : eliminatedUsers }
		},{_id:1,f_name:1,l_name:1,users_type:1,propic:1})

		eliminatedUsers.push(ObjectID(req.token_data.id))

		let user_lists = await UserdetailsModel.find({ 
			business_id: ObjectID(req.token_data.business_id),
			is_deleted:false,
			status:"Active",
			users_type: { $in : ["Admin","Employee"]},
			_id : { $nin : eliminatedUsers }
		},{_id:1,f_name:1,l_name:1,users_type:1,propic:1});

		var allUsers = [...exist_chat_users_details_one, ...user_lists];

		res.header(200).send({
			'success':1,
			'error':0,
			'message':'User Lists',
			'data' :allUsers,
			'chat_count' : chatCount
		})
	},

	get_subscription_detais : async function(req, res){

		var subscription_type = await UserdetailsModel.findOne({
			_id : req.token_data.id
		},{ acount_status : 1, f_name:1, l_name:1,subcription_id:1});

		if(subscription_type.subcription_id!=''){
			var getSubscriptionDetails = new Promise(function(resolve,reject){
				const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
				merchantAuthenticationType.setName(constants.AUTHORIZE_LOGIN_KEY);
				merchantAuthenticationType.setTransactionKey(constants.AUTHORIZE_TRANSACTION_KEY);
	
				var getRequest = new ApiContracts.ARBGetSubscriptionRequest();
				getRequest.setMerchantAuthentication(merchantAuthenticationType);
				getRequest.setSubscriptionId(subscription_type.subcription_id);
	
				var ctrl = new ApiControllers.ARBGetSubscriptionController(getRequest.getJSON());
	
				ctrl.execute(function(){
					var apiResponse = ctrl.getResponse();
		
					var response = new ApiContracts.ARBGetSubscriptionResponse(apiResponse);
		
					console.log(JSON.stringify(response, null, 2));
					
					if(response != null){
						if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
							var payment_info = response.getSubscription().getPaymentSchedule();
							resolve({
								amount : response.getSubscription().getAmount(),
								unit : payment_info.interval.unit,
								length : payment_info.interval.length
							})
						}
						else{
							reject(response.getMessages().getResultCode()+' : '+response.getMessages().getMessage()[0].getText());
						}
					}
					else{
						reject("NULL Response");
					}
		
				});
			})
		}else{
			var getSubscriptionDetails = new Promise((resolve,reject)=>{
				resolve({
					amount : 0,
					unit : 'trial',
					length : 0
				});
			})
		}

		getSubscriptionDetails.then(async paymentData=>{
			var no_of_user_allowed = await BusinessModel.findOne({
				_id : req.token_data.business_id
			},{ number_of_member_approved:1 });
	
			if(!no_of_user_allowed){
				no_of_user_allowed = {
					number_of_member_approved : await UserdetailsModel.countDocuments({
						business_id : req.token_data.business_id,
						users_type : "Employee"
					})
				}
			}

			var site_settings = await SiteSettingsModel.find({}).exec();
			site_settings = site_settings[0];
	
			res.status(200).send({
				success:1,
				error:0,
				message : "Success",
				data : 	{
					no_of_user_allowed,
					subscription_type,
					paymentData,
					site_settings
				}
	
			})
		}).catch(err=>{
			res.status(200).send({
				success:0,
				error:1,
				message : err,
				data : 	{}
	
			})
		})

		
	},

	update_subscription : async function(req, res){

		var has_error = 0, error_report={};
		let pre_record = await UserdetailsModel.findById(req.token_data.id,{subcription_id:1,acount_status:1,f_name:1,l_name:1,email:1,address:1,mobile:1});

		var no_of_user_allowed = await BusinessModel.findOne({
			_id : req.token_data.business_id
		},{ number_of_member_approved:1 });

		//pre_record.acount_status = 'Trial';
		//req.body.type = "Monthly";

		if(pre_record.acount_status=="Trial"){
			if(!req.body.update_card_info || req.body.update_card_info!='on'){
				return res.status(200).send({
					success:0,
					error:1,
					message : "Card Information is mandetory",	
				})
			}
			if(!req.body.subscription_type){
				return res.status(200).send({
					success:0,
					error:1,
					message : "Subscription Type is required",	
				})
			}
		}

		if(no_of_user_allowed.number_of_member_approved > req.body.no_of_user_select){
			return res.status(200).send({
				success:0,
				error:1,
				message : "No of member can not be less current value.",	
			})
		}
		
		if(no_of_user_allowed.number_of_member_approved == req.body.no_of_user_select && !req.body.update_card_info){
			return res.status(200).send({
				success:0,
				error:1,
				message : "Nothing to update",	
			})
		}

		if(req.body.update_card_info && req.body.update_card_info=='on'){
			if(!req.body.card_name){
				has_error=1;
				error_report.card_name = "Card Name can not be wrong";
			}

			if(!req.body.card_number){
				has_error=1;
				error_report.card_number = "Card Number can not be wrong";
			}

			if(!req.body.exp_month){
				has_error=1;
				error_report.exp_month = "Month is required";
			}

			if(!req.body.exp_year){
				has_error=1;
				error_report.exp_year = "Year is required";
			}

			if(!req.body.card_cvv){
				has_error=1;
				error_report.card_cvv = "CVV is required";
			}
		}

		if(has_error==1){
			return res.status(200).send({
				success:0,
				error:1,
				message : "validation error",
				data : {},
				error_list : error_report
	
			})
		}

		var site_settings = await SiteSettingsModel.find({}).exec();
		site_settings = site_settings[0];

		var new_amount_to_paid = 0;
		if(pre_record.acount_status=='Yearly'){
			new_amount_to_paid = site_settings.yearly_per_member_charge*req.body.no_of_user_select;
		}else if(pre_record.acount_status=='Monthly'){
			new_amount_to_paid = site_settings.monthly_per_member_charge*req.body.no_of_user_select;
		}

		var amount = new_amount_to_paid;
		const subscriptionId = pre_record.subcription_id;
		const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
		merchantAuthenticationType.setName(constants.AUTHORIZE_LOGIN_KEY);
		merchantAuthenticationType.setTransactionKey(constants.AUTHORIZE_TRANSACTION_KEY);

		if(pre_record.acount_status!="Trial"){
			const transactionRequestType = new ApiContracts.TransactionRequestType();
			transactionRequestType.setAmount(amount.toFixed(2));

			if(req.body.update_card_info && req.body.update_card_info=='on'){
				const creditCard = new ApiContracts.CreditCardType();
				creditCard.setCardNumber(req.body.card_number);
				creditCard.setExpirationDate(req.body.exp_year+'-'+req.body.exp_month);
				creditCard.setCardCode(req.body.card_cvv);
				
				const paymentType = new ApiContracts.PaymentType();
				paymentType.setCreditCard(creditCard);
	
				transactionRequestType.setPayment(paymentType);
			}

			var updateRequest = new ApiContracts.ARBUpdateSubscriptionRequest();
			updateRequest.setMerchantAuthentication(merchantAuthenticationType);
			updateRequest.setSubscriptionId(subscriptionId);
			updateRequest.setSubscription(transactionRequestType);
					
			var ctrl = new ApiControllers.ARBUpdateSubscriptionController(updateRequest.getJSON());

			ctrl.execute(async function(){

				var apiResponse = ctrl.getResponse();

				var response = new ApiContracts.ARBUpdateSubscriptionResponse(apiResponse);

				console.log(JSON.stringify(response, null, 2));

				if(response != null){
					if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
						await BusinessModel.findByIdAndUpdate(req.token_data.business_id,{
							number_of_member_approved : req.body.no_of_user_select
						});

						res.status(200).send({
							success:1,
							error:0,
							message : "Subscription updated successfully",
							data : 	{}
				
						})

					}
					else{
						res.status(200).send({
							success:0,
							error:1,
							message :response.getMessages().getMessage()[0].getText(),
							data : 	{}
				
						})
					}
				}
				else{
					res.status(200).send({
						success:0,
						error:1,
						message :"Response is null",
						data : 	{}
					})
				}
				
				//callback(response);
			});
		}else{
			var recurring_length = 12;
			var acount_status = 'Yearly'
			if(req.body.subscription_type=='Monthly'){
				acount_status = 'Monthly';
				recurring_length=1;
			}
			if(req.body.subscription_type=='Yearly'){
				acount_status = 'Yearly';
				recurring_length=12;
			}

			var new_amount_to_paid = 0;
			if(acount_status=='Yearly'){
				new_amount_to_paid = (site_settings.yearly_per_member_charge*req.body.no_of_user_select)+parseInt(site_settings.yearly_per_member_charge);
			}else if(acount_status=='Monthly'){
				new_amount_to_paid = (site_settings.monthly_per_member_charge*req.body.no_of_user_select)+parseInt(site_settings.monthly_registration_fee);
			}

			var amount = new_amount_to_paid;

			var current_time = new Date().getTime();
			var invoice_number = 'SUB-'+current_time;

			const orderDetails = new ApiContracts.OrderType();
			orderDetails.setInvoiceNumber(invoice_number);
			orderDetails.setDescription('Subscription Fee for CRM RUNNER with '+req.body.no_of_user_select+' member');

			const billTo = new ApiContracts.CustomerAddressType();
			billTo.setFirstName(pre_record.f_name);
			billTo.setLastName(pre_record.l_name);
			billTo.setAddress(pre_record.address.address);
			billTo.setCity(pre_record.address.city);
			billTo.setZip(pre_record.address.zip);
			billTo.setCountry(pre_record.address.country);
			billTo.setPhoneNumber(pre_record.mobile.mobile);
			billTo.setEmail(pre_record.email);

			const creditCard = new ApiContracts.CreditCardType();
			creditCard.setCardNumber(req.body.card_number);
			creditCard.setExpirationDate(req.body.exp_year+'-'+req.body.exp_month);
			creditCard.setCardCode(req.body.card_cvv);
			
			const paymentType = new ApiContracts.PaymentType();
			paymentType.setCreditCard(creditCard);

			const transactionRequestType = new ApiContracts.TransactionRequestType();
			transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
			transactionRequestType.setAmount(amount);
			transactionRequestType.setPayment(paymentType);
			transactionRequestType.setOrder(orderDetails);
			transactionRequestType.setBillTo(billTo);

			const createRequest = new ApiContracts.CreateTransactionRequest();
			createRequest.setMerchantAuthentication(merchantAuthenticationType);
			createRequest.setTransactionRequest(transactionRequestType);

			var ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());

			ctrl.execute(() => {
				const apiResponse = ctrl.getResponse();
				const response = new ApiContracts.CreateTransactionResponse(apiResponse);
				console.log(response);
				if(response !== null) {
					if(response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
						
						if(response.getTransactionResponse().getMessages() !== null) {
							console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
							console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
							console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
							console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
							var subcription_id = response.getTransactionResponse().getTransId();
						
							var payment_details = new PaymentModel({
								customer_id : req.token_data.id,
								transaction_id : response.getTransactionResponse().getTransId(),
								log_message : response.getTransactionResponse().getMessages().getMessage()[0].getDescription(),
								invoice_number: invoice_number,
								amount : amount,
								payment_mode:"online",
								log_type : "registration"
							});
							payment_details.save();

							// Create recurring //

							const interval = new ApiContracts.PaymentScheduleType.Interval();
							interval.setLength(recurring_length);
							interval.setUnit('months');

							const paymentScheduleType = new ApiContracts.PaymentScheduleType();
							paymentScheduleType.setInterval(interval);
							paymentScheduleType.setStartDate(new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString().slice(0,10));
							paymentScheduleType.setTotalOccurrences(9999);
							paymentScheduleType.setTrialOccurrences(0);

							const customer = new ApiContracts.CustomerType();
							customer.setType(ApiContracts.CustomerTypeEnum.BUSINESS);
							customer.setId(invoice_number);
							customer.setEmail(pre_record.email);
							customer.setPhoneNumber(pre_record.mobile.mobile);

							const nameAndAddressType = new ApiContracts.NameAndAddressType();
							nameAndAddressType.setFirstName(pre_record.f_name);
							nameAndAddressType.setLastName(pre_record.l_name);
							//nameAndAddressType.setCompany(user_data['company']);
							nameAndAddressType.setAddress(pre_record.address.address);
							nameAndAddressType.setCity(pre_record.address.city);
							nameAndAddressType.setZip(pre_record.address.zip);
							nameAndAddressType.setCountry(pre_record.address.country);

							const arbSubscription = new ApiContracts.ARBSubscriptionType();
							arbSubscription.setName(pre_record.f_name+' '+pre_record.l_name);
							arbSubscription.setPaymentSchedule(paymentScheduleType);
							arbSubscription.setAmount(amount);
							arbSubscription.setTrialAmount(0);
							arbSubscription.setPayment(paymentType);
							arbSubscription.setOrder(orderDetails);
							arbSubscription.setCustomer(customer);
							arbSubscription.setBillTo(nameAndAddressType);
							arbSubscription.setShipTo(nameAndAddressType);

							var createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
							createRequest.setMerchantAuthentication(merchantAuthenticationType);
							createRequest.setSubscription(arbSubscription);

							var ctrlN = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());

							ctrlN.execute(async function(){

								var apiResponse = ctrlN.getResponse();

								var response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

								console.log(JSON.stringify(response, null, 2));

								if(response != null){
									if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
										// console.log('Subscription Id : ' + response.getSubscriptionId());
										// console.log('Message Code : ' + response.getMessages().getMessage()[0].getCode());
										// console.log('Message Text : ' + response.getMessages().getMessage()[0].getText());

										var payment_details = new PaymentModel({
											customer_id : req.token_data.id,
											subscription_id : response.getSubscriptionId(),
											amount : amount,
											log_message : response.getMessages().getMessage()[0].getText(),
											payment_mode:"online",
											log_type : "registration_recurring"
										});
										payment_details.save();

										await UserdetailsModel.findByIdAndUpdate(req.token_data.id,{
											subcription_id : response.getSubscriptionId(),
											acount_status : acount_status
										})

										await BusinessModel.findByIdAndUpdate(req.token_data.business_id,{
											number_of_member_approved : req.body.no_of_user_select
										})

										return res.send({ 
											error : 0,
											success : 1,
											message: 'Subscription is done.' ,
											additional_message : response.getMessages().getMessage()[0].getText()
										});
									}
									else{
										// console.log('Result Code: ' + response.getMessages().getResultCode());
										// console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
										// console.log('Error message: ' + response.getMessages().getMessage()[0].getText());

										return res.send({ 
											error : 1,
											success : 0,
											message: 'Subscription was not successfull.' ,
											additional_message : response.getMessages().getMessage()[0].getText()
										});
									}
								}
								else{
									return res.send({ 
										error : 1,
										success : 0,
										message: 'Subscription was not successfull.' ,
										additional_message : "Recurring profile response null"
									});
								}
							});

						} else {
							if(response.getTransactionResponse().getErrors() !== null) {
								let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
								let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
								return res.header(200).send({
									success:0,
									error:144,
									message: `${text}`
								});
							} else {
								return res.header(200).send({ 
									success:0,
									error:1,
									message: 'Transaction failed.' 
								});
							}
						}    
					} else {
						console.log(response.getMessages());
						if(response.getTransactionResponse() !== null && typeof response.getTransactionResponse()!='undefined' && response.getTransactionResponse().getErrors() !== null){
							let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
							let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
							return res.header(200).send({
								success:0,
								error:1,
								message: "Payment Failed",  //`${text}`
							});
						} else {
							let code = response.getMessages().getMessage()[0].getCode();
							let text = response.getMessages().getMessage()[0].getText();
							return res.header(200).send({
								success:0,
								error:1,
								message:  text
							});
						}   
					} 
					   
		
				} else {
					return res.header(200).send({ 
						success:0,
						error:1,
						message: 'No response.' 
					});
				}
			});
		}

	},

	cancel_subscription : async function(req,res){
		//if(req.params.user_id)

		var user_id = req.params.user_id?req.params.user_id:req.token_data.id;
		let pre_record = await UserdetailsModel.findById(user_id,{subcription_id:1,acount_status:1,f_name:1,l_name:1,email:1,address:1,mobile:1,business_id:1});

		var business_id = pre_record.business_id;

		const subscriptionId = pre_record.subcription_id;
		if(subscriptionId && subscriptionId!=""){
			const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
			merchantAuthenticationType.setName(constants.AUTHORIZE_LOGIN_KEY);
			merchantAuthenticationType.setTransactionKey(constants.AUTHORIZE_TRANSACTION_KEY);

			var cancelRequest = new ApiContracts.ARBCancelSubscriptionRequest();
			cancelRequest.setMerchantAuthentication(merchantAuthenticationType);
			cancelRequest.setSubscriptionId(subscriptionId);

			var ctrl = new ApiControllers.ARBCancelSubscriptionController(cancelRequest.getJSON());
			ctrl.setEnvironment(SDKConstants.endpoint.production);

			ctrl.execute(async function(){

				var apiResponse = ctrl.getResponse();

				var response = new ApiContracts.ARBCancelSubscriptionResponse(apiResponse);

				//console.log(JSON.stringify(response, null, 2));

				if(response != null){
					if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
						await UserdetailsModel.updateMany({
							business_id : business_id
						},{
							status: "Inactive",
							is_deleted: true
						})

						let usersList = await UserdetailsModel.find({
							business_id : business_id
						},{_id:1})

						usersList.forEach(async single=>{
							await UserSfGuardModel.updateMany({user_details_id:single._id},{
								del_status:"1",
								status:"Inactive"
							})
						})

						if(req.token_data.id!=user_id){
							var log = "Profile ("+pre_record.email+") suspended by admin"
						}else{
							var log = "Cancel Subscription"
						}

						let activity = new UserActivityModel({
							activity_type : "general_activity",
							activity_log : log,
							refer_to : user_id,
							business_id : business_id,
							created_by : req.token_data.id
						})

						await activity.save();

						req.io.sockets.to(business_id).emit('account_suspended',{
							message : "Account has been deactivated"
						});

						return res.header(200).send({ 
							success:1,
							error:0,
							message: 'Account has been deleted.' 
						});
					}
					else{
						// console.log('Result Code: ' + response.getMessages().getResultCode());
						// console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
						// console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
						return res.header(200).send({ 
							success:0,
							error:1,
							message: 'Something went wrong, try again' 
						});
					}
				}
				else{
					//console.log('Null Response.');
					return res.header(200).send({ 
						success:0,
						error:1,
						message: 'Something went wrong, try again please' 
					});
				}

			});
		}else{
			await UserdetailsModel.updateMany({
				business_id : business_id
			},{
				status: "Inactive",
				is_deleted: true
			})

			let usersList = await UserdetailsModel.find({
				business_id : business_id
			},{_id:1})

			usersList.forEach(async single=>{
				await UserSfGuardModel.updateMany({user_details_id:single._id},{
					del_status:"1",
					status:"Inactive"
				})
			})

			req.io.sockets.to(business_id).emit('account_suspended',{
				message : "Account has been deactivated"
			});

			return res.header(200).send({ 
				success:1,
				error:0,
				message: 'Account has been deleted.' 
			});
		}
	},

	do_form_validation : async function(req,res){
		let error = {};
		let user_data = {};
		let mail = require("nodemailer").mail;
		let good_chars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
		let allValidationPass=0;

		if(req.body.form_number==1){

			if(!req.body.f_name){
				error['f_name'] = 'First name is required';
			}else{
				if (!good_chars.test(req.body.f_name)){
					user_data['f_name'] = req.body.f_name;
				}else{
					error['f_name'] = 'Provide valid first name';
				}
			}
	
			if(!req.body.l_name){
				error['l_name'] = 'Last name is required';
			}else{
				if (!good_chars.test(req.body.l_name)){
					user_data['l_name'] = req.body.l_name;
				}else{
					error['l_name'] = req.body.l_name;
				}
			}
	
			if(!req.body.mobile){
				error['mobile'] = 'Mobile is required';
			}else{
				var phoneno = /^\d{10}$/;
				if((req.body.mobile).match(phoneno))
					user_data['mobile'] = req.body.mobile;
				else
					error['mobile'] = 'Provide valid mobile number';
			}

			if(!req.body.email){
				error['email'] = 'Email is required';
			}else{
				var re = /\S+@\S+\.\S+/;
				if (re.test(req.body.email))
				{
					user_data['email'] = req.body.email;
				}else{
					error['email'] = 'Provide valid email';
				}
			}
			user_data['username'] = (req.body.email).toLowerCase();
			var check_user = await UserSfGuardModel.findOne({$or : [{username:user_data['username']},{email:user_data['username']}]});
			if(check_user){
				error['email'] = 'Email already exist';
			}

			if(Object.keys(error).length <= 0){
				var otp = Math.floor(Math.random()*90000) + 10000;
				var temp_data = new TempUserModel({
					email: user_data['email'],
					username: user_data['username'],
					otp: otp
				});

				try{
					let site_settings = await SiteSettingsModel.find({}).exec();
					site_settings = site_settings[0];
					await temp_data.save();

					var dt = new Date()
					mail({
						from: "CRM RUNNER <info@crmrunner.com>", // sender address
						to: user_data['email'], // list of receivers
						subject: "Registration OTP", // Subject line
						html: `<table style="width: 600px; margin: 0 auto; border: 1px solid #ddd;">
							<tbody><tr>
								<td style="text-align: center">
									<a href="`+res.locals.base_url.slice(0, -6)+`">
										<img src="`+res.locals.base_url.slice(0, -6)+`/public/assets/images/logo.png" alt="" width="160">
									</a>
								</td>
							</tr>
							<tr style="vertical-align: top;">
								<td colspan="2" style="padding: 15px;">
									<p style="font-size: 14px; color: #000; line-height: 22px; padding-top: 20px; line-height: 22px;">
										Hello <span style="font-size: 16px; font-weight: bold;">`+req.body.f_name+` `+req.body.l_name+`,</span>
										<br>
										Thank you for registering to <a href="`+res.locals.base_url.slice(0, -6)+`">https://crmrunner.com</a><br>
				
										Your security is our top priority, if you didn't request this verification code please disregard this email.<br>
				
										Don't share this code with anyone.<br><br>
				
										You verification code is: <strong>`+otp+`</strong><br><br><br>
				
										Best Regards,<br>
										CRM Runner <br>
										Secure Server Department<br>
										<br>												
									</p>
								</td>
							</tr>
							<tr style="background: #1976d2;">
								<td colspan="2" style="padding: 0 15px;">
									<p style="font-size: 12px; color: #fff; text-align: center;">
										COPYRIGHT &copy; `+dt.getFullYear()+`. ALL RIGHTS RESERVED
										<br>
										<a href="www.facebook.com/Crmrunner" style="font-size: 12px; color: #fff; text-align: center;">Facebook</a> | 
										
										<a href="mailto:info@crmrunner.com" style="font-size: 12px; color: #fff; text-align: center;">Email Us</a> | 
										
										<a href="tel:`+site_settings.phone_number+`" style="font-size: 12px; color: #fff; text-align: center;">`+site_settings.phone_number+`</a> | 
									</p>
								</td>
							</tr>
						</tbody></table>` // html body
					});

					return res.header(200).send({
						error:0,
						success:1,
						message:"OTP sent successfully"
					})
				}catch(e){
					return res.header(200).send({
						error:1,
						success:0,
						message:"Some technical error occoured",
						additionsal_message : e
					})
				}
			}
		}


		if(req.body.form_number==2){
			if(!req.body.password){
				error['password'] = 'Password is required';
			}

			if(!req.body.company_name){
				error['company_name'] = 'Company name is required';
			}

			if(!req.body.email){
				error['email'] = 'Email is required';
			}else{
				var re = /\S+@\S+\.\S+/;
				if (re.test(req.body.email))
				{
					user_data['email'] = req.body.email;
				}else{
					error['email'] = 'Provide valid email';
				}
			}

			if(!req.body.otp){
				error['otp'] = 'Otp is required';
			}else{
				if(user_data['email']){
					var check_otp = await TempUserModel.find({
						email: user_data['email'],
						username: (user_data['email']).toLowerCase() 
					},{otp:1}).sort({_id:-1}).limit(1);
					
					if(check_otp.length <= 0 || !check_otp || typeof check_otp=='undefined' || req.body.otp != check_otp[0].otp){
						error['otp'] = 'OTP does not match';
					}
				}
			}
	
			if(!req.body.repassword){
				error['repassword'] = 'Re-type password is required';
			}else{
				if(req.body.repassword !== req.body.password)
					error['repassword'] = 'Repassword must be same with password';
				else
					user_data['password'] = req.body.password;
			}
		}

		if(req.body.form_number==3){

			if(!req.body.address){
				error['address'] = 'Address name is required';
			}else{
				user_data['address'] = req.body.address;
			}

			if(!req.body.city){
				error['city'] = 'City is required';
			}else{
				user_data['city'] = req.body.city;
			}
	
			if(!req.body.zip){
				error['zip'] = 'Zip is required';
			}else{
				user_data['zip'] = req.body.zip;
			}
	
			if(!req.body.country){
				error['country'] = 'Country is required';
			}else{
				user_data['country'] = req.body.country;
			}
		}

		if(req.body.form_number==4){

			if(!req.body.card_number){
				error['card_number'] = 'Card number is required';
			}else{
				user_data['card_number'] = req.body.card_number;
			}

			if(!req.body.cvv){
				error['cvv'] = 'CVV is required';
			}else{
				user_data['cvv'] = req.body.cvv;
			}
	
			if(!req.body.expiry_date){
				error['expiry_date'] = 'Expiry Date is required';
			}else{
				user_data['expiry_date'] = req.body.expiry_date;
			}

			if(Object.keys(error).length <=0 ){
				allValidationPass=1;
			}
		}

		res.status(200).send({
			message : "Validation output",
			error : Object.keys(error).length > 0?Object.keys(error).length:0,
			data : error,
			allValidationPass: allValidationPass	
		})
	},

	member_info : async function(req,res){
		var id = req.params.id ? req.params.id : req.token_data.id;
		var search_array = {};
		var can_proceed = 1;
		
		search_array['_id'] = id;
		
		
		try{
			var details = await UserdetailsModel.findOne(search_array);
			
			let businessInfo = await BusinessModel.findById(details.business_id,{business_name:1,logo:1})

			if(details)
				res.status(200).send({
					'error':0,
					'message':'User Details',
					'data' :details,
					businessInfo: businessInfo
				})
			else
				res.status(400).send({
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
	}
}