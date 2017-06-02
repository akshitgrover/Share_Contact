/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var bcrypt=require('bcrypt');
module.exports = {

  attributes: {
  	schema:true,
  	name:{
  		type:'string',
  		required:true
  	},
  	upvote:{
  		type:'integer',
  		defaultsTo:0
  	},
  	skill:{
  		type:'array'
  	},
  	contact:{
  		type:'string',
  		required:true,
  		unique:true
  	},
  	password:{
  		type:'string',
  		required:true
  	},
  	confirmpassword:{
  		type:'string',
  		required:true
  	},
  	request:{
  		type:'array',
  		defaultsTo:[]
  	},
  	friends:{
  		type:'array',
  		defaultsTo:[]
  	},
  },
  beforeCreate:function(values,cb){
  	bcrypt.hash(values.password,10,function(err,hash){
  		if(err)console.log(err);
  		values.password=hash;
  		values.confirmpassword=hash;
  		cb();
  	});
  },
};

