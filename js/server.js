var mongo = require("mongodb").MongoClient,
	client =require("socket.io").listen(8080).sockets;

mongo.connect('mongodb://localhost:27017/chat',function(err,db){
	if(err) throw err;
	// connection.log(err);
	
	client.on('connection',function(socket){

		var col = db.collection('messages'),
			sendStatus = function(s){
				socket.emit('status',s);
			}; 

		col.find().limit(100).sort({_id : 1}).toArray(function(err,res){
			if(err) throw err;

			socket.emit('output',res);
		})

		socket.on('input',function(data){
			var name = data.name,
				message = data.message,
				blank = /^\s*$/ ;
			console.log(data);
			if(blank.test(name) || blank.test(message)){
				//console.log('Invalid');
				sendStatus('Name and Message is Required!');
			}else{
				col.insert({name:name,message:message},function(){
					// console.log('Inserted!');
					client.emit('output',[data]);
					sendStatus({
						message:'Message Sent!',
						clear:true
					});
				});
			}
				
		});
	});
});