var events = require('events');
var eventEmitter = new events.EventEmitter();

var userModel=require('../app/user/registration/js/user-model');
var usergrp=[
			{
				grpname:"Sales Manager",
			    emails:["sunil@giantleapsystems.com","sunilmore690@facebook.com"]
			},
			{grpname:"Marketing",emails:["sunilmore690@facebook.com"]}
            ]
    var i=0;
    var usergrplength=usergrp.length;
    eventEmitter.on('addgrpmember',function(i)
 	{		
 		console.log("usergrplength"+usergrplength);
        if(usergrplength!=i)
        {
        	console.log("usergrp.emails"+usergrp[i].emails+" group name"+usergrp[i].grpname);
	 		userModel.find({ email:{ $in :usergrp[i].emails}},{_id:1},function(err,user)
	    	{
	      		if( err )
	      		{
	        		console.log("error in finding userid according invites");
	      		}
	      		if( user )
	      		{ //add the userid into respective group
	      			console.log("usergrp["+i+"]:"+usergrp);
			        i+=1;
	        		eventEmitter.emit("addgrpmember",i);
	      		}
	      		
	               
	    	});
 		}
 		else
 		{
 			console.log("succsffully find");
 		}
    	
    	
	
 });
 
    eventEmitter.emit("addgrpmember",i);
    //console.log("emit function call exit");
    
 /*
var events = require('events');
var eventEmitter = new events.EventEmitter();
 
var ringBell = function ringBell()
{
  console.log('ring ring ring');
}
eventEmitter.on('doorOpen', ringBell);
 
eventEmitter.emit('doorOpen');

 */