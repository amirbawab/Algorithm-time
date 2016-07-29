module.exports = function(models){

	var express = require('express');
	var viewUtils = require(__base + '/libs/viewUtils');
	var router = express.Router();

	router.get('/', function(req, res, next) {
		data = {};
		viewUtils.initializeSession(req, data, models, function(data){
			models.user_model.count({}, function(err, usercount){
				data.usercount = usercount;
				models.room_model.count({}, function(err, roomcount){
					data.roomcount = roomcount;
					viewUtils.load(res, 'index', data);
				});
			});
		});
	});

	router.get('/leaderboard', function(req, res, next){
		data = {};
		viewUtils.initializeSession(req, data, models, function(data){
			var currUser = "";
			if(typeof data.user != "undefined"){
				currUser = data.user.nickname;
			}
			models.user_model.find({}, function(error, users){
				data.users = users;
				data.currentUser = currUser;
				viewUtils.load(res, 'leaderboard', data);
			}).sort( { score: -1 } );
		});
	});

	router.get('/submissions', function(req, res, next){
		data = {};
		viewUtils.initializeSession(req, data, models, function(data){
			if(data.user == undefined || data.user.level != 0){
				res.redirect('/');
			}else{
				models.user_prob_model.aggregate([
				    {
				      $lookup:
				        {
				          from: "users",
				          localField: "user",
				          foreignField: "nickname",
				          as: "user_docs"
				        }
				    },
				    {
				      $lookup:
				        {
				          from: "probs",
				          localField: "prob",
				          foreignField: "id",
				          as: "prob_docs"
				        }
				    },
				    {
				    	$match:
				    	{
				    		complete:false,
				    	}
				    },
				    {
				    	$sort:
				    	{
				    		date: 1,
				    	}
				    }
					], function(error, rels){
					data.rels = rels;
					viewUtils.load(res, 'submissions/index', data);
				});	
			}
		});
	});

	router.get('/error', function(req, res, next){
		data = {error: {message: "Oups :(", stack: "There seems to be an error with this page."}};
		viewUtils.initializeSession(req, data, models, function(data){
			viewUtils.load(res, 'error', data);
		});
	});

	return router;
}
