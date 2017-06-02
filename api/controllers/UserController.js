/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	create:function(req,res,next){
		if(req.param('password')!=req.param('confirmpassword')){
			req.session.flash={err:"Passwords Didn't Match!"};
			res.redirect('/');
			return;
		}
		var param={name:req.param('name'),contact:req.param('contact'),password:req.param('password'),confirmpassword:req.param('confirmpassword')};
		User.create(param,function(err,user){
			if(err) console.log(err);
			var array=[];
			user.skill=[];
			array.push(req.param('skill1'));
			array.push(req.param('skill2'));
			array.push(req.param('skill3'));
			array.push(req.param('skill4'));
			user.skill=array;
			user.save();
			req.session.authenticated=true;
			req.session.user=user;
			res.redirect('/user/userlogin/'+jwt.issue({id:user.id}));
		});
	},
	find:function(req,res,next){
		User.find(function(err,user){
			user.sort('upvote DESC');
			res.json({user:user});
		});
	},
	delete:function(req,res,next){
		User.destroy(req.param('id'),function(err){
			if(!err) console.log("User Deleted");
		});
	},
	searchc:function(req,res,next){
		User.findOne({contact:req.param('contact')},function(err,user){
			delete user.password;
			delete user.confirmpassword;
			if(req.session.user.friends.indexOf(user.id)==-1){
				delete user.contact;
			}
			res.json({user:user});
		})
	},
	searchs:function(req,res,next){
		var query=User.find();
		query.sort('upvote DESC');
		query.exec(function(err,user){
			var array=[];
			user.forEach(function(resl){
			if(resl.skill.indexOf(req.param('skill'))!=-1){
				delete resl.password;
				delete resl.confirmpassword;
				if(req.session.user.friends.indexOf(resl.id)==-1){
					delete resl.contact;
				}
				array.push(resl);
			}
			});
			res.json({user:array});
		});
	},
	searchn:function(req,res,next){
		var query=User.find({name:req.param('name')})
		query.sort('upvote DESC');
		query.exec(function(err,user){
			user.sort('upvote DESC');
			user.forEach(function(resl){
				delete resl.password;
				delete resl.confirmpassword;
				if(req.session.user.friends.indexOf(resl.id)==-1){
					delete resl.contact;
				}
				console.log(resl);
			});
			res.json({user:user});
		});
	},
	userprofile:function(req,res,next){
		User.findOne(req.param('id'),function(err,user){
			res.view({user:user});
		});
	},
	upvote:function(req,res,next){
		User.findOne(req.param('id'),function(err,user){
			user.upvote+=1;
			user.save();
			res.redirect('/user/userprofile/'+user.id);
		});	
	},
	request:function(req,res,next){
		User.findOne(req.param('id'),function(err,user){
			user.request.push(req.session.user.id);
			user.save();
			res.redirect('/user/userprofile/'+user.id);
		});
	},
	reqfind:function(req,res,next){
		User.findOne(req.session.user.id,function(err,user){
			res.json({user:user.request});
		});
	},
	friend:function(req,res,next){
		User.findOne(req.session.user.id,function(err,user){
			if(req.session.user.request.indexOf(parseInt(req.param('id')))!=-1){
				user.friends.push(req.param('id'));
				user.request.splice(user.request.indexOf(parseInt(req.param('id'))));
				user.save();
				User.findOne(req.param('id'),function(err,user){
					user.friends.push(req.session.user.id);
					user.save();
				});
				res.redirect('/user/reqfind/'+req.param('token'));
			}
			else{
				console.log("Error!");
				req.session.flash={err:"No Such Friend Request!"};
			}
		});
	},
	frifind:function(req,res,next){
		User.findOne(req.session.user.id,function(err,user){
			res.json({user:user.friends});
		});
	},
	userlogin:function(req,res,next){
		console.log(req.session.user);
		User.findOne(req.session.user.id,function(err,user){
			if(user){
				res.view({user:user,token:req.param('token')});
			}
		});
	},
	login:function(req,res,next){
		var bcrypt=require('bcrypt');
		User.findOne({contact:req.param('contact')},function(err,user){
			if(!user){
				console.log("No User!");
				req.session.flash={err:"No User Found!"};
				res.redirect('/');
				return;
			}
			bcrypt.compare(req.param('password'),user.password,function(err,resl){
				if(err){
					console.log("Error!");
					req.session.flash={err:"Something went wrong!"};
					res.redirect('/');
				}
				if(resl){
					req.session.authenticated=true;
					req.session.user=user;
					res.redirect('/user/userlogin/'+jwt.issue({id:user.id}));
				}
				else{
					console.log("Password InCorrect!");
					req.session.flash={err:"Password is incorrect!"};
					res.redirect('/');
				}
			});

		});
	},
	logout:function(req,res,next){
		req.session.destroy();
		res.redirect('/');
	}
	
};
