//Imports that I will need
var express = require('express');
var path = require('path');
var http = require('http');
var fs = require('fs');

// Create the app
var app = express();

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(8080,listen);

function listen() {
  var host = '35.190.175.135'
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Assests')));

console.log(path.join(__dirname , 'Assests'));
app.set('views', path.join(__dirname, "View"));
app.set('view engine','ejs');




app.get("/",function(req,res)
{
	res.render("valley")
});



// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

// Socket setup & pass server
 io.on("connection", function(socket) {
	console.log('made socket connection',socket.id)
	// Adding Socket Conncetion to the database

    // Handle Populating Friends List
    socket.on("friends", function(data){
	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~Friends Was Called~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
	//Object of PG
        const {Client} = require('pg')
        const client = new Client({
        user: "valleychat666",
        host: '/var/run/postgresql',
        database:'valley',
        port: 5432,
        })
        async function getUsername()
        {
        try
        {
          await client.connect()
          const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");

	  var id =data.handle
          data.handle = result.rows[0].username;
          const result2 = await client.query("SELECT list FROM friendlist WHERE username='"+data.handle+"'");
          var i = result2.rowCount
          data.list = ""
          for(j=0; j<i; j++)
          {
                data.list = "" + data.list + "" + result2.rows[j].list + ","
          }
          data.handle = id;
	  socket.emit("friends", data);
          await client.end()
        }
        catch(ex)
        {
                console.log('Error Happened ${ex}')
7        }
        }
        getUsername();

	});

    //Handle Chat Event
    socket.on("chat", function(data)
    {
	data.username = this.username;
	console.log(data.message);
	//Object of PG
	const {Client} = require('pg')
	const client = new Client({
	user: "valleychat666",
	host: '/var/run/postgresql',
	database:'valley',
	port: 5432,
	})
	async function getUsername()
	{
	try
	{
	  await client.connect()
	  console.log("CHAT ENTRANCE!")
	  //console.log("Connected to Database!")
 	  //console.log("Username Before the change " + data.handle)
	  //console.log("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
	  const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
	  data.userSend = result.rows[0].username;
	  //console.log("Username after the change " + data.handle)
		if(data.isGroupChat == "no")
		{
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~NOT IN GROUP CHAT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
			var result2 = await client.query("SELECT socketid FROM userpass WHERE username = '" +data.comId+ "'");
			var socketID = result2.rows[0].socketid;

			var idSender = await client.query("SELECT id FROM userpass WHERE username = '" +data.userSend+ "'");
			idSender = idSender.rows[0].id;
			var idReciver = await client.query("SELECT id FROM userpass WHERE username = '" +data.comId+ "'");
			idReciver = idReciver.rows[0].id
			var time = arrivalTime();
			await client.query("INSERT INTO oneononechatlog(id, idsender, usernamesender, idreciver, usernamereciver, timestamp, message) VALUES(DEFAULT, '"+idSender+"','"+data.userSend+"','"+idReciver+"', '"+data.comId+"','"+time+"','"+data.message+"')")
			data.time = time
			if(socketID == 'null')
			{
				//Send to sender and query it in database
			}
			else
			{
				//console.log("Made it into Else of Socketid is Null")
				var result3 = await client.query("SELECT lastConversation FROM userpass WHERE username = '"+data.comId+"'");
				var lastConvo = result3.rows[0].lastconversation;
				//console.log(lastConvo)
				if(lastConvo == data.userSend)
				{
					 var result2 = await client.query("SELECT socketid FROM userpass WHERE username = '" +data.comId+ "'");
                                         var socketID = result2.rows[0].socketid;
					io.sockets.to(socketID).emit("chat",data);
				        socket.emit("chat",data);
				}
				else
				{
					//Message is Saved in Database but the friend will get a notification instead
					socket.emit("chat",data);
				}

			}
		}
		else if(data.isGroupChat == 'yes')
		{
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~IN GROUP CHAT SECTION~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
			var idSender = await client.query("SELECT id FROM userpass WHERE username = '" +data.userSend+ "'");
                        idSender = idSender.rows[0].id;
			var time = arrivalTime();
			data.time = time;
			socket.join('"+data.comId+"');
			var result5 = await client.query("SELECT username FROM gcmembers WHERE gcid = '"+data.comId+"'");
			var i = result5.rowCount;
			console.log("Row Count is: "+ i)
			for(j=0; j<i; j++)
			{
				console.log("THE VALUE OF J " + j)
				console.log("IN THE FOR LOOP")
				var username = result5.rows[j].username;
				console.log("USERNAME " + username)
				var lastChat = await client.query("SELECT lastConversation FROM userpass WHERE username = '"+username+"'");
				console.log("Last Conversation: " + lastChat.rows[0].lastconversation)
				if(lastChat.rows[0].lastconversation == data.comId)
				{
					var result6 = await client.query("SELECT notify FROM permissions WHERE gcid = '"+data.comId+"' ORDER BY id DESC");
					await client.query("UPDATE permissions SET notify = 0 WHERE gcid='"+data.comId+"' AND username='"+username+"'");
					console.log("TESTING NOTIFY "+result6.rows[0].notify);

					//io.sockets.to(socketID).emit("chat",data);
					//var result99 = await client.query("SELECT socketid FROM userpass WHERE username = '"+username+"'");
					//var socketID = result99.rows[0].socketid;
					//io.sockets.to(socketID).join('"+data.comId+"');
					//await client.query("INSERT INTO groupchatlogs(id, idsender, usernamesender, idreciver, usernamereciver, timestamp, message, gcid) VALUES(DEFAULT, '"+idSender+"','"+data.userSend+"','0','ALL','"+time+"','"+data.message+"','"+data.comId+"')");
				}
				else
				{
					var result7 = await client.query("SELECT notify FROM permissions WHERE gcid = '"+data.comId+"' AND username = '"+username+"'");
                                        console.log("TESTING NOTIFY not the same equal value "+result7.rows[0].notify)
					var l = result7.rows[0].notify;
					if(l >= 0)
					{
						console.log("Notify Was Bigger or Equal to Zero")
						console.log("L value is " + l)
						var t = l + 1;
						console.log("T has the value of: " + t);
						await client.query("UPDATE permissions SET notify ='"+t+"' WHERE gcid='"+data.comId+"' AND username='"+username+"'");
						//await client.query("INSERT INTO groupchatlogs(id, idsender, usernamesender, idreciver, usernamereciver, timestamp, message, gcid) VALUES(DEFAULT, '"+idSender+"','"+data.userSend+"','0','ALL','"+time+"','"+data.message+"','"+data.comId+"')");
					}
					else if( l  == 'null')
					{
						console.log("Notify was Null, First Message of the Chat Room")
						var t = 0;
						await client.query("UPDATE permissions SET notify ='"+t+"' WHERE gcid='"+data.comId+"' AND username='"+username+"'");
						//await client.query("INSERT INTO groupchatlogs(id, idsender, usernamesender, idreciver, usernamereciver, timestamp, message, gcid) VALUES(DEFAULT, '"+idSender+"','"+data.userSend+"','0','ALL','"+time+"','"+data.message+"','"+data.comId+"'");
					}
					else
					{
						console.log("IDK WHAT HAPPENED HERE")
					}
				}
			}
		await client.query("INSERT INTO groupchatlogs(id, idsender, usernamesender, idreciver, usernamereciver, timestamp, message, gcid) VALUES(DEFAULT, '"+idSender+"','"+data.userSend+"','0','ALL','"+time+"','"+data.message+"','"+data.comId+"')");
		io.to('"+data.comId+"').emit("chat",data);
		}
		else
		{
			console.log("ERROR OCCURED!!!")
		}
          await client.end()
	}
	catch(ex)
	{
		console.log('Error Happened ${ex}')
	}
	}
	getUsername();
    });

    // Handle typing event
    socket.on('typing', function(data){
	 //Object of PG
        const {Client} = require('pg')
        const client = new Client({
        user: "valleychat666",
        host: '/var/run/postgresql',
        database:'valley',
        port: 5432,
        })
        async function getUsername()
        {
        try
        {
          await client.connect()
	  console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TYPING FUNCTION~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
          const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
          data.handle = result.rows[0].username;

	
	  if(data.isGroupChat == 'yes')
	  {
		console.log("WE ARE A GROUP CHAT")
		var result3 = await client.query("SELECT socketid FROM userpass WHERE lastConversation = '"+data.comId+"'");
		var result4 = await client.query("SELECT socketid FROM userpass WHERE username = '"+data.handle+"'");
		var userSocket =result4.rows[0].socketid;
		var i = result3.rowCount;
		var userNames = "";
		for(k = 0; k<i; k++)
		{
			if(userSocket != result3.rows[k].socketid)
			{
			io.sockets.to(result3.rows[k].socketid).emit("typing",data);
			}
		}
	  }
	  else
	  {
	  var result3 = await client.query("SELECT lastConversation FROM userpass WHERE username = '"+data.comId+"'");
          var lastConvo = result3.rows[0].lastconversation;
	   if(lastConvo == data.handle)
	  {
	  var result2 = await client.query("SELECT socketid FROM userpass WHERE username = '" +data.comId+ "'");
          var socketID = result2.rows[0].socketid;
	  io.sockets.to(socketID).emit("typing",data);
          //socket.broadcast.emit("typing", data);
          }
	  }
	await client.end()
        }
        catch(ex)
        {
                console.log('Error Happened ${ex}')
        }
        }
        getUsername();

	console.log(data);
    });

/**
	setInterval(function(){
	socket.emit('populate');
	},1000);
*/
	socket.on('fill', function(data)
	{
		console.log(data.handle);
		const {Client} = require('pg')
        	const client = new Client({
		user: "valleychat666",
        	host: '/var/run/postgresql',
        	database:'valley',
        	port: 5432,
        	})
        async function getUsername()
        {
        	try
        	{	console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~FILL IN FUNCTION~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
          		await client.connect()
          		const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
			var id = data.handle
          		data.handle = result.rows[0].username;
			await client.query("UPDATE userpass SET socketid = '"+socket.id+"' WHERE username = '"+data.handle+"'");
	  		const result2 = await client.query("SELECT list FROM friendlist WHERE username='"+data.handle+"'");
          		var listofPeople = result2.rows[0].list;
			console.log(listofPeople)

			data.list = listofPeople;
          		//data.list = ""
          		//for(j=0; j<i; j++)
          		//{
                	//	data.list = "" + data.list + "" + result2.rows[j].list + ","
          		//}
			const result3 = await client.query("SELECT gcid  FROM gcmembers WHERE username='"+data.handle+"'");
          		//console.log(result2)
			var i = result3.rowCount;
			data.groupChat = "";
			data.groupChatID = "";
			for(j=0; j<i; j++)
			{
				console.log(j);
				var gc = result3.rows[j].gcid;
				console.log(gc);
				data.groupChatID = "" + data.groupChatID + "" + gc + ",";
				var result4 = await client.query("SELECT gcname FROM groupchatroom WHERE gcid = '"+gc+"'");
				data.groupChat =  "" + data.groupChat + "" + result4.rows[0].gcname + ",";
				console.log(data.groupChat);
			}
			const result5 = await client.query("SELECT pendingrequest FROM friendlist WHERE username = '"+data.handle+"'")
			var pendingRequest = result5.rows[0].pendingrequest;
			data.pendingRequest = pendingRequest;
			const result6 = await client.query("SELECT pendinggroupchats FROM friendlist WHERE username = '"+data.handle+"'")
			var gcInvites = result6.rows[0].pendinggroupchats;
			data.gcInvite = gcInvites;
			if(data.gcInvite == null)
			{
				data.gcInvite = "";
			}
			else
			{
			}
			console.log(data.gcInvite);
         		data.handle = id;
          		socket.emit("fillInformation", data);
          		await client.end()

       		}
        	catch(ex)
        	{
                	console.log('Error Happened ${ex}')
        	}
        }
        getUsername();
	});




	//Populate the GroupChat Room

	socket.on("groupChat", function(data)
	{
	       	console.log("IN GROUP CHAT!")

		 console.log("This is someone's friend: " + data.friend);

                const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ GROUPCHAT FUNCTION CALLED~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
                        var id = data.handle
                        data.handle = result.rows[0].username;
                        await client.query("UPDATE userpass SET lastConversation = '"+data.friend+"' WHERE username = '"+data.handle+"'");

                        const result2 = await client.query("SELECT id, usernamesender, message, timestamp FROM groupchatlogs WHERE gcid = '"+data.friend+"' ORDER BY id ASC LIMIT 200");
                        var myMessages = result2.rows;
                        data.logs = myMessages;

			//GET ALL USERS IN THAT CHAT ROOM
			var result3 = await client.query("SELECT username FROM gcmembers WHERE gcid = '"+data.friend+"'")
			var i = result3.rowCount;
			var gcMember = ""
			for(j =0; j < i; j++)
			{
				gcMember = ""+gcMember+ ""+ result3.rows[j].username + ","
			}

			//NOW WE WANT TO SEE WHO IS ACTIVE ON THAT CHAT ROOM
			console.log("GROUP CHAT NUMBER IS " + data.friend);
			socket.join('"+data.friend+"');
			var online = "";
			var offline = "";
			var member = "";
			while(gcMember.indexOf(',') != -1)
			{
				member = gcMember.split(',')[0];
				if(member == ",")
				{
				}
				else
				{
				 //member = gcMember.split(',')[0];
				var result4 = await client.query("SELECT lastconversation FROM userpass WHERE username = '"+member+"'");
                                var lastconvo = result4.rows[0].lastconversation
                                if(lastconvo == data.friend)
                                {
                                        online = "" +online +""+ member + ","
                                }
                                else
                                {
                                        offline = ""+offline+""+ member + ","
                                }
				}
				gcMember = gcMember.replace(member,"");
				gcMember = gcMember.substr(1);
				member = "";
			}
			
			data.onlineFriend = online;
			data.offlineFriend = offline;
                        socket.emit("groupChatConversation",data);
                        //var boolean = true
                        //while(boolean = true)
                        //{
        
                        //}
                }
                catch(ex)
                {
                        console.log("Error In Group Chat Population")
                }
        }
        getUsername();
	});


	//Populate Converstaion 1on1
	socket.on("conversation1on1", function(data)
	{

		const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
			console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 1 to 1~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
                        var id = data.handle
                        data.handle = result.rows[0].username;
                        await client.query("UPDATE userpass SET lastConversation = '"+data.friend+"' WHERE username = '"+data.handle+"'");

			const result2 = await client.query("SELECT id, usernamesender, message, timestamp FROM oneononechatlog WHERE usernamesender = '"+data.handle+"' AND usernamereciver = '"+data.friend+"' OR usernamesender = '"+data.friend+"' AND usernamereciver = '"+data.handle+"' ORDER BY id ASC LIMIT 150")
			var myMessages = result2.rows;
			data.logs = myMessages;
			socket.emit("1on1Conversation",data);
		}
		catch(ex)
		{
			console.log("Error In 1-1")
		}
	}
	getUsername();
	});





socket.on('checkFriend',function(data){

const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~CHECK FRIEND REQUEST~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
                        var id = data.handle
			data.friendRequest = data.friendRequest.trim();
			console.log(data.friendRequest)
                        data.handle = result.rows[0].username;
			const result2 = await client.query("SELECT list FROM friendlist WHERE username = '"+data.handle+"'");
			var alreadyFriend = result2.rows[0];
			data.result = alreadyFriend
			console.log("Our Friend's List for the sender is : "+data.result)
			if(data.handle == data.friendRequest)
			{
				data.result = "You are already friend's with your self silly.";
			}
			else if(data.freindRequest == "")
                        {
                                data.result = "Hey, you can't be friend's with nothing!"
                        }
			else if(data.result == undefined)
			{
				var result3 = await client.query("SELECT pendingrequest FROM friendlist WHERE username = '"+data.handle+"'");
				var checkPendingList = result3.rows[0].pendingrequest
				console.log("PENDING LIST " + checkPendingList)
				data.result = data.result.list;
				console.log("Users friend list " + data.result)
				if(checkPendingList ==  null)
				{
					console.log("DID I ENTER FIRST IF STATEMENT")
					data.result = "We are going to send a Friend Request to them!";
					var fc = data.friendRequest;
                                        data.handle = "" + data.handle + ",";
                                        checkPendingList = "" + data.handle;
                                        await client.query("UPDATE friendlist SET pendingrequest = '"+checkPendingList+"' WHERE username = '"+fc+"'");
				}
				else if(data.result.includes(data.friendRequest))
				{
					data.result =  "You are already friends with them!";
				}
				else if(checkPendingList.includes(data.friendRequest))
				{
					console.log("DO I ALREADY HAVE THEM AS A FRIEND")
					data.result = "You already sent a request to that user!"
				} //
				else
				{
					console.log("ARE WE TRUE OR FALSE " + checkPendingList.includes(data.friendRequest))
					data.result = "We are going to send a Friend Request to them!";
					var fc = data.friendRequest;
                                        data.handle = "" + data.handle + ",";
                                        checkPendingList = checkPendingList + "" + data.handle;
                                        await client.query("UPDATE friendlist SET pendingrequest = '"+checkPendingList+"' WHERE username = '"+fc+"'");
				}


			}
			else if(data.result.list.includes(data.friendRequest))
			{
				data.result = "You are already friend's with " + data.friendRequest + "!";
			}
			else
			{
				data.result = "We are going to send a Friend Request to them!";
				var result3 = await client.query("SELECT pendingrequest FROM friendlist WHERE username = '"+data.friendRequest+"'");
                                var checkPendingList = result3.rows[0].pendingrequest;
				var fc = data.friendRequest;
				console.log("Going to check if they already sent this "+ fc)
                                data.handle = "" + data.handle + ",";
				if(checkPendingList.includes(data.handle))
				{
                                        data.result = "You already sent a request to that user!"
				}
				else
				{
                                	checkPendingList = checkPendingList + "" + data.handle;
                                	await client.query("UPDATE friendlist SET pendingrequest = '"+checkPendingList+"' WHERE username = '"+fc+"'");
				} //
			}
			data.handle = id;
                        socket.emit("friendResponse",data);
                }
                catch(ex)
                {
                        console.log("ERROR IN FRIEND REQUEST")

			data.result = "We are going to send a Friend Request to them!";
			socket.emit("friendResponse",data);
                }
        }
        getUsername();
	});







socket.on('createGroupChat', function(data)
{
	const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ADD GROUP CHAT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '"+data.handle+"'");
                        var hashid = data.handle
                        data.handle = result.rows[0].username
			const result2 = await client.query("SELECT id FROM userpass WHERE username = '"+data.handle+"'");
			var id = result2.rows[0].id


			const result3 = await client.query("SELECT usernameo FROM groupchatroom WHERE gcname = '"+data.groupChatRequest+"'");
			var groupchatOwner = result3.rows[0]
			if(groupchatOwner == undefined)
			{
				console.log("WE ARE GOING TO CREATE THE GROUPCHAT")
                                data.result = "You got it, we will make the chat right now!";
                        	await client.query("INSERT INTO groupchatroom(ido, usernameo, gcid, gcname) VALUES('"+id+"', '"+data.handle+"', DEFAULT, '"+data.groupChatRequest+"')");
				var result4 = await client.query("SELECT gcid FROM groupchatroom WHERE gcname = '"+data.groupChatRequest+"'");
				var gcid = result4.rows[0].gcid
				await client.query("INSERT INTO gcmembers(gcid, id, username, permission) VALUES('"+gcid+"', '"+id+"', '"+data.handle+"', 2)");
				await client.query("INSERT INTO permissions VALUES('"+gcid+"', '"+id+"', '"+data.handle+"', 2)");
			}
			else if(groupchatOwner.usernameo.includes(data.handle))
			{
				console.log("ENTERED THE ELSE IF STATEMENT")
				data.result = "You already have that group chat."
			}
			else
			{
				console.log("WE ARE GOING TO CREATE THE GROUPCHAT")
				data.result = "You got it, we will make the chat right now!"
				await client.query("INSERT INTO groupchatroom(ido, usernameo, gcid, gcname) VALUES('"+id+"', '"+data.handle+"', DEFAULT, '"+data.groupChatRequest+"')");
				var result4 = await client.query("SELECT gcid FROM groupchatroom WHERE gcname = '"+data.groupChatRequest+"'");
                                var gcid = result4.rows[0].gcid
				await client.query("INSERT INTO gcmembers(gcid, id, username, permission) VALUES('"+gcid+"', '"+id+"', '"+data.handle+"', 2)");
				await client.query("INSERT INTO permissions VALUES('"+gcid+"', '"+id+"', '"+data.handle+"', 2)");
			}

			data.handle = hashid;
			socket.emit("GroupChatAdding",data);
		}
                catch(ex)
                {
                        console.log("ERROR IN CREATING GROUP CHAT")
                } 
        }
        getUsername();
	});



	socket.on('acceptFriend', function(data)
	{

		const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ACCPET FRIEND ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '"+data.handle+"'");
                        var hashid = data.handle;
                        data.handle = result.rows[0].username;
                        console.log("ERROR");
                        const result2 = await client.query("SELECT id FROM userpass WHERE username = '"+data.handle+"'");
                        var id = result2.rows[0].id;
			
			const result3 = await client.query("SELECT list FROM friendlist WHERE username='"+data.handle+"'");
			var lists = result3.rows[0].list;
			console.log("DO I BREAK HERE")
			lists = ""+ lists + data.whoAccept + ",";
			console.log(""+data.handle+"'s friends list: "+lists);
			await client.query("UPDATE friendlist SET list = '"+lists+"' WHERE username = '"+data.handle+"'");
			
			const result5 = await client.query("SELECT pendingrequest FROM friendlist WHERE username = '"+data.handle+"'");
			var pending = result5.rows[0].pendingrequest;

			console.log("Pending Before the removal: "+pending);
			var replacement = data.whoAccept + ",";
			pending = pending.replace(replacement, "");
			console.log("Pending after :"+pending);

			await client.query("UPDATE friendlist SET pendingrequest='"+pending+"' WHERE username = '"+data.handle+"'");

			const result6 = await client.query("SELECT list FROM friendlist WHERE username='"+data.whoAccept+"'");
			pending = "";
			pending = result6.rows[0];

			if(pending == undefined)
			{
				pending = "";
	                        pending = pending + data.handle + ",";
			}
			else
			{
				pending = pending.list;
				pending = pending + data.handle + ",";
			}
			await client.query("UPDATE friendlist SET list = '"+pending+"' WHERE username = '"+data.whoAccept+"'");
			const result7 = await client.query("SELECT pendingrequest FROM friendlist WHERE username = '"+data.whoAccept+"'");
			pending ="";
			replacement = "";
			pending = result7.rows[0];
			if(pending == undefined)
			{
				pending = "";
				replacement = data.handle + ",";
                        	pending = pending.replace(replacement, "");
			}
			else
			{
				pending = pending.list;
				replacement = data.handle + ",";
                        	pending = pending.replace(replacement, "");
			}

			 await client.query("UPDATE friendlist SET pendingrequest='"+pending+"' WHERE username = '"+data.whoAccept+"'");


			socket.emit('reaction',data);
		}
		catch(ex)
		{
			console.log("ERROR IN ACCEPT FRIEND");
			socket.emit('reaction',data);
		}
	}
	getUsername();

	});


	socket.on('denyFriend', function(data)
	{



		const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~DENY FRIEND ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '"+data.handle+"'");
                        var hashid = data.handle;
                        data.handle = result.rows[0].username;
                        console.log("ERROR");
                        const result2 = await client.query("SELECT id FROM userpass WHERE username = '"+data.handle+"'");
                        var id = result2.rows[0].id;



			const result5 = await client.query("SELECT pendingrequest FROM friendlist WHERE username = '"+data.handle+"'");
                        var pending = result5.rows[0].pendingrequest;
                        var replacement = data.whoDeny + ",";
                        pending = pending.replace(replacement, "");

                        await client.query("UPDATE friendlist SET pendingrequest='"+pending+"' WHERE username = '"+data.handle+"'");
			socket.emit('reaction',data);
                }
                catch(ex)  
                {
                        console.log("ERROR IN DENY FRIEND");
                }
        }
        getUsername();


	});

		socket.on('gc', function(data)
	{
		const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~TEST IGNORE ME ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '"+data.handle+"'");
                        var hashid = data.handle;
                        data.handle = result.rows[0].username;
                        console.log("ERROR " + data.friends);
			socket.join('"+data.friends+"')
                        socket.emit('gc2',data);
                }
                catch(ex)  
                {
                        console.log("ERROR IN DENY FRIEND");
                }
        }
        getUsername();
	});


	socket.on('addGroupChatUser', function(data)
	{
	const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~WE ARE SENDING A REQUEST TO A USER TO JOIN THE GROUP CHAT~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT username FROM userpass WHERE hashid = '" +data.handle+ "'");
                        var id = data.handle
                        data.addWho = data.addWho.trim();
                        console.log(data.addWho)
                        data.handle = result.rows[0].username;

			const checkPermission = await client.query("SELECT permission FROM permissions WHERE  gcid = '"+data.addToWhere+"' AND username = '"+data.handle+"';")
			if(checkPermission.rows[0].permission < 2)
			{
				data.result = "You can not add anyone, you need a admin to do this action!"
				data.handle = id;
				socket.emit("groupChatRequest",data);
			}
                        const result2 = await client.query("SELECT gcid FROM gcmembers WHERE username = '"+data.addWho+"' and gcid = '"+data.addToWhere+"'"); // MIGHT HAVE TO CHANGE THIS BIT 
                        var alreadyFriend = result2.rows[0];
                        data.result = alreadyFriend
                        console.log("Our Friend's List for the sender is : "+data.result)
                        if(data.handle == data.addWho) //MIGHT NEED OT CHANGE
                        {
                                data.result = "You are already friend's with your self silly.";
                        }
                        else if(data.addWho == "")
                        {
                                data.result = "Hey, you can't be friend's with nothing!"
                        }
                        else if(data.result == undefined)
                        {
				console.log("I AM UNDEFINDED!")
                                var result3 = await client.query("SELECT pendinggroupchats FROM friendlist WHERE username = '"+data.addWho+"'");
                                var checkPendingList = result3.rows[0].pendinggroupchats;
                                console.log("PENDING LIST " + checkPendingList)
                                data.result = "";
                                console.log("Users friend list " + data.result)
				const finalResult = await client.query("SELECT gcname FROM groupchatroom WHERE usernameo = '"+data.handle+"' AND gcid = '"+data.addToWhere+"'")
				var gcname = finalResult.rows[0].gcname;
				var test55 = gcname + "|" + data.handle + ",";
                                if(checkPendingList ==  null)
                                {
                                        console.log("DID I ENTER FIRST IF STATEMENT")
                                        data.result = "We are going to send a GroupChat Request to them!";
                                        var fc = data.addWho;
                                        //data.handle = "" + data.addToWhere + ",";
                                        //checkPendingList = "" + data.addToWhere;
					const final = await client.query("SELECT gcname, usernameo FROM groupchatroom WHERE gcid = '"+data.addToWhere+"'");
					//checkPendingList = "";
					checkPendingList = checkPendingList + final.rows[0].gcname + "|";
					checkPendingList = checkPendingList + final.rows[0].usernameo + ",";
                                        await client.query("UPDATE friendlist SET pendinggroupchats = '"+checkPendingList+"' WHERE username = '"+fc+"'");
                                }
                                else if(data.result.includes(test55))
                                {
                                        data.result =  "You are already have them in the chat!!";
                                }
                                else if(checkPendingList.includes(test55))
                       		{
                                        console.log("DO I ALREADY HAVE THEM AS A FRIEND")
                                        data.result = "You already sent a request to that user!"
                                }
				else
                                {
                                        console.log("ARE WE TRUE OR FALSE " + checkPendingList.includes(data.addToWhere))
                                        data.result = "We are going to send a Friend Request to them!";
                                        var fc = data.addWho;
                                        data.handle = "" + data.addToWhere + ",";
					const final = await client.query("SELECT gcname, usernameo FROM groupchatroom WHERE gcid = '"+data.addToWhere+"'");
                                        checkPendingList = checkPendingList + final.rows[0].gcname + "|";
                                        checkPendingList = checkPendingList + final.rows[0].usernameo + ",";

                                        await client.query("UPDATE friendlist SET pendinggroupchats = '"+checkPendingList+"' WHERE username = '"+fc+"'");
                                }


                        }
                        else if(data.result.includes(data.addToWhere))
                        {
				console.log("DO I BREAK HERE!!")
                                data.result = "You are already added  " + data.addWho + "!";
                        }
                        else
                        {
				console.log("AM I TRYING TO ADD!")
                                data.result = "We are going to send a Friend Request to them!";
                                var result3 = await client.query("SELECT pendinggroupcats FROM friendlist WHERE username = '"+data.addWho+"'");
                                var checkPendingList = result3.rows[0].pendinggroupchats
                                var fc = dxata.addWho;
                                console.log("Going to check if they already sent this "+ fc)
                                data.handle = "" + data.handle + ",";
                                if(checkPendingList.includes(data.handle))
                                {
                                        data.result = "You already sent a request to that user!"
                                }
                                else
                                {
					if(checkPendingList == null)
					{
					checkPendingList = "";
					const final = await client.query("SELECT gcname, usernameo FROM groupchatroom WHERE gcid = '"+data.addToWhere+"'");
                                        checkPendingList = checkPendingList + final.rows[0].gcname + "|";
                                        checkPendingList = checkPendingList + final.rows[0].usernameo + ",";
                                        await client.query("UPDATE friendlist SET pendinggroupchat = '"+checkPendingList+"' WHERE username = '"+fc+"'");
					}
					else
					{
					 const final = await client.query("SELECT gcname, usernameo FROM groupchatroom WHERE gcid = '"+data.addToWhere+"'");
                                        checkPendingList = checkPendingList + final.rows[0].gcname + "|";
                                        checkPendingList = checkPendingList + final.rows[0].usernameo + ",";
                                        await client.query("UPDATE friendlist SET pendinggroupchat = '"+checkPendingList+"' WHERE username = '"+fc+"'");
					}
                                }
			}

                        data.handle = id;
                        socket.emit("groupChatRequest",data);
                }
                catch(ex)
                {
                        console.log("ERROR in ADD Group User");
                }
        }
        getUsername();
	});








	socket.on("acceptGroupChat", function(data)
	{



	 const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~WE ARE ACCEPTING REQUEST TO JOIN GROUP CHAT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT id,username FROM userpass WHERE hashid = '" +data.handle+ "'");
                        var id = data.handle
			var numid = result.rows[0].id;
			var user = result.rows[0].username;

			const result3 = await client.query("SELECT gcid FROM groupchatroom WHERE usernameo = '"+data.owner+"' AND gcname = '"+data.location+"'");
			var gcid = result3.rows[0].gcid;
			console.log("Do I crash here!!!!!!!!!!!");

			await client.query("INSERT INTO gcmembers VALUES ('"+gcid+"','"+numid+"', '"+user+"',0)");
			await client.query("INSERT INTO permissions VALUES ('"+gcid+"','"+numid+"','"+user+"',0,0)");
			console.log("DO I CRASH HERE")
			var replace1 = data.location + "|" + data.owner + ","

			const result5 = await client.query("SELECT pendinggroupchats FROM friendlist WHERE username = '"+user+"'");
			var list = result5.rows[0].pendinggroupchats;
			console.log("DO II CRAHS HERE!")
			list = list.replace(replace1, "");
			await client.query("UPDATA friendlist SET pendinggroupchats = '"+list+"' WHERE username = '"+user+"'");
			
			data.handle = id;
			socket.emit("accpetGC", data);


		}
		catch(ex)
		{
			console.log("ERROR IN ACCEPTING GROUP CHAT ")
		}
	}
	getUsername();
	});
	

	socket.on("denyGroupChat", function(data)
	{
		
         const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~WE ARE DENY REQUEST TO JOIN GROUP CHAT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT id,username FROM userpass WHERE hashid = '" +data.handle+ "'");
                        var id = data.handle
                        var numid = result.rows[0].id;
                        var user = result.rows[0].username;

			console.log("DO I MAKE IT HERE!")
                        const result2 = await client.query("SELECT pendinggroupchats FROM friendlist WHERE username = '"+user+"'");
                        console.log("DO I MAKE IT HERE!")
			var list = result2.rows[0].pendinggroupchats;
			var replace1 = data.location + "|" + data.owner + ","
			console.log(replace1);
                        list = list.replace(replace1, "");
			console.log(list);
                        await client.query("UPDATE friendlist SET pendinggroupchats = '"+list+"' WHERE username = '"+user+"'");
                        
                        data.handle = id;
                        socket.emit("denyGC", data);


                }
                catch(ex)
                {
                        console.log("ERROR IN DENYING GROUP CHAT ")
                }
	}
	getUsername();
	});



	socket.on("changePermissions", function(data)
	{
		
         const {Client} = require('pg')
                const client = new Client({
                user: "valleychat666",
                host: '/var/run/postgresql',
                database:'valley',
                port: 5432,
                })
        async function getUsername()
        {
                try
                {
                        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~WE ARE CHANGING A PERMISSION GROUP CHAT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                        await client.connect()
                        const result = await client.query("SELECT id,username FROM userpass WHERE hashid = '" +data.handle+ "'");
                        var id = data.handle
                        var numid = result.rows[0].id;
                        var user = result.rows[0].username;

                        
			//const result3 = await client.query("SELECT gcid FROM groupchatroom WHERE usernamee = '"+data.owner+"' AND gcname = '"+data.location+"'");
                        //var gcid = result3.rows[0].gcid;
                       	var result4 =  await client.query("SELECT permission FROM permissions WHERE username = '"+user+"' AND gcid = '"+data.gcid+"'");
			var permissionLV  = result4.rows[0].permission;
			console.log("HELLO WE ARE HERE");
			if(permissionLV == 2)
			{
				console.log("In the first if statment, u are a admin!");
				console.log(data.changePermission)
				if(data.changePermission.includes('Admin'))
                                {
                                        data.changePermission = 2;
                                }
				else if(data.changePermission.includes('Mod'))
				{
					console.log("DO I MAKE IT HERE")
					data.changePermission = 1;
				}
				else
				{
					data.changePermission = 0;
				}
				console.log(data.gcid);
				console.log(data.user);
				await client.query("UPDATE gcmembers SET permission = '"+data.changePermission+"' WHERE gcid = '"+data.gcid+"' AND username = '"+data.user+"'");
				console.log("FIRST QUERY WENT THROUGH")
                	       	await client.query("UPDATE permissions SET permission = '"+data.changePermission+"' WHERE gcid = '"+data.gcid+"' AND username = '"+data.user+"'");
			}
			else if(permissionLV == 1)
			{
				if(data.changePermission.includes('Admin'))
                                {
                                        data.changePermission = 2;
                                }
                                else if(data.changePermission.includes('Mod'))
                                {
                                        data.changePermission = 1;
                                }
                                else
                                { 
                                        data.changePermission = 0;
                                }

				if(data.changePermission == 1 || data.changePermission == 0)
				{
					await client.query("UPDATE gcmembers SET permission = '"+data.changePermission+"' WHERE gcid = '"+data.gcid+"' AND username = '"+data.user+"'");
                                	await client.query("UPDATE permissions SET permission = '"+data.changePermission+"' WHERE gcid = '"+data.gcid+"' AND username = '"+data.user+"'");
				}
			}
			else if(permissionLV == 0)
			{
				console.log("THEY DIDNT HAVE THE RIGHT TO DO ANYTHING")
			}

                        data.handle = id;
                        socket.emit("accpetGC", data);


                }
                catch(ex)
                {
                        console.log("ERROR IN CHANNING USER PERMISISON  GROUP CHAT ")
                }
	}
	getUsername();
	});

});





function arrivalTime()
{
	var today = new Date();
	var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	var time = today.getHours()  + ":" + today.getMinutes() + ":" + today.getSeconds();
	var senderTimeSend = date+' '+time;
	return senderTimeSend;
}

