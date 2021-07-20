var { db, recordSet } = require('../config/db');
var UserdetailsModel = require('../models/user_details');
var UserSfGuardModel = require('../models/user_sf_guard');
var moment = require('moment');
var async = require("async");
const { where } = require('../models/user_details');
var ObjectID = require('mongodb').ObjectID;

var UserActivityModel = require('../models/user_activity');

module.exports = {

    
    getMongoUsers: async function(req, res) {
        await UserSfGuardModel.find().populate({ path: 'user_details_id', select: 'f_name l_name' }).select('-__v').exec().then(response => {
            userList = response;
        })

        const user_ids = await UserdetailsModel.find({ users_type: "Employee" }).select('user_id').exec();

        var user_id_string = '',
            sep = '';
        for (const single_user_id of user_ids) {
            user_id_string = user_id_string + sep + single_user_id.user_id;
            sep = ',';
        }

        res.send({ 'done': 'done', 'userList': userList, 'user_ids': user_ids, 'user_id_string': user_id_string });
    },

    getUsers: async function(req,res) {
        var recordSet = await db.select('*')
            //.where('invoicefrom=3')
            //.where('status=2')
            // .where('createdby', 962)
            // .order_by("jobid", "DESC")
            .getRecord('tbl_user');
        res.send({ 'done': 'done', 'userList': recordSet });
    }
}