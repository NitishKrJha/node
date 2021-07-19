var ObjectID = require('mongodb').ObjectID;
const mongoose = require('mongoose');
var ActivityModel = require("../models/user_activity");
var UserModel = require("../models/user_details");

module.exports = function(io) {
    io.on('connection', function(socket) {
        console.log('socket.handshake.query',socket.handshake.query);
        socket.join(socket.handshake.query.loggeduser);
        socket.join(socket.handshake.query.business_id);
        
        socket.on('update_location', async function (data) {

            io.sockets.to(data.id).emit('update_cordinates',data);

            var pre_location = await ActivityModel.findOne({
                activity_type : "location",
                created_by : data.user_id,
                business_id : data.business_id
            }).sort({_id:-1})

            var timeDiff = 0;
            if(pre_location){
                var diff =(new Date().getTime() - pre_location.created_at.getTime()) / 1000;
                diff /= 60;
                timeDiff = Math.abs(Math.round(diff));
            }

            if(!pre_location || timeDiff > 10){
                var activity_log = new ActivityModel({
                    created_by : data.user_id,
                    business_id : data.business_id,
                    created_at : new Date(),
                    if_socket : data.id,
                    activity_type : "location",
                    activity_log : "Location Updated",
                    location : {
                        coordinates : [parseFloat(data.long),parseFloat(data.lat)],
				        type: "Point"
                    }
                });
                await activity_log.save();

                // Save in user data//
                await UserModel.findByIdAndUpdate(data.user_id,{
                    loc : {
                        coordinates : [parseFloat(data.long),parseFloat(data.lat)],
				        type: "Point"
                    },
                    modified_at : new Date(),
                    modified_by : data.user_id
                })
            }
        });

        socket.on('send_chat', async function (data) {
            data.chat_id=ObjectID();
            io.sockets.to(data.id).emit('chat_received',data);
            var activity_log = new ActivityModel({
                _id : data.chat_id,
                created_by : data.user_id,
                business_id : data.business_id,
                created_at : new Date(),
                if_socket : data.id,
                activity_type : "chat",
                activity_log : data.message,
                refer_to : data.refer_to,
                read_status : "No"
            });
            await activity_log.save();
        });

        socket.on('mark_msg_read', async function (data) {
            await ActivityModel.findByIdAndUpdate(data,{$set : { read_status : "Yes" }});
        })
    });
      
};
