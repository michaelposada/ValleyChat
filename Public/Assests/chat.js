
// Make connection
var socket = io.connect(location.origin);


// Query DOM
var   handle = document.getElementById('handle'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback'),
      chat = document.getElementById('left'),
      right = document.getElementById('right'),
      friendslist = document.getElementById('friends'),
      friendSubmit = document.getElementById('submitusername'),
      modalOutput = document.getElementById("modaloutput"),
      gcInviteOutput = document.getElementById("gcinviteoutput"),
      groupButton = document.getElementById("addtogroupchat"),
      groupchatslist = document.getElementById('groupchats'),
      gcInviterList = document.getElementById('groupChatList'),
      friendRequestList = document.getElementById("friendRequestList");
      //userProfile = document.getElementsById('test');
//*** Packet Process ***//
//variables we will need for packet construction
                                var onlineMemberDiv = document.getElementById("gcOnlineMembers");
                                var offlineMemberDiv = document.getElementById("gcOfflineMembers");
//***packet construction**//

//sender packet comType:comId:userSend:timeSend:msg
var senderComType = chat.getAttribute("isgroupchat");
var senderComId = chat.getAttribute("activechatid");
var senderUserSend = handle.getAttribute("myid");

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var senderTimeSend = date+' '+time;



var pendingRequest = "";
var senderMsg;
var friends = "";
var logs = "";
var message;

function updateScroll(){
    var element = document.getElementById("output");
    element.scrollTop = element.scrollHeight - element.clientHeight;
}
function input() {

	var oldMessage = document.getElementById("message");
	//right.remove(oldMessage);
	//DO IF STATEMENT INSTEAD SO THAT IT WORKS ON ALL CASES

	if(oldMessage == null)
	{
	tempSpan = document.createElement('span');
	tempSpan.setAttribute("id","messagespan");
	tempInput = document.createElement('input');
	tempInput.setAttribute("type","text");
	tempInput.setAttribute("id","message");
	tempInput.setAttribute("class","messageinput");
	tempInput.setAttribute("placeholder","Type your message here...");

	tempSpan.appendChild(tempInput);

	right.appendChild(tempSpan);
	}
	else
	{
      	right.removeChild(messagespan);

	tempSpan = document.createElement('span');
	tempSpan.setAttribute("id","messagespan");
        tempInput = document.createElement('input');
        tempInput.setAttribute("type","text");
        tempInput.setAttribute("id","message");
	tempInput.setAttribute("class","messageinput");
        tempInput.setAttribute("placeholder","Type your message here...");

        tempSpan.appendChild(tempInput);

        right.appendChild(tempSpan);
	}

	message = document.getElementById('message');
	message.addEventListener('keypress', function(e){

var key = e.which || e.keyCode;

if(key == 13)
{
var testText = message.value
testText = testText.trim()
if(testText == "" ){
//nothing happens no blank spaces
}
else
{
	senderComId = chat.getAttribute("activechatid");
	senderComType = chat.getAttribute("isgroupchat");
	socket.emit('chat', {
        isGroupChat: senderComType, // Check for Group Chat
	comId: senderComId, //Name of the Reciver
	userSend: senderUserSend, //Name of the Sender
	message: message.value, //Message of the Sender
        handle: senderUserSend, //id Number
	time
    });
    message.value = "";
}
}
});
//Event when user is typing it will say so and so are typing
message.addEventListener('keypress', function(){
	senderComId = chat.getAttribute("activechatid");
	senderComType = chat.getAttribute("isgroupchat");
	socket.emit('typing', {handle: senderUserSend, comId:senderComId, isGroupChat: senderComType});
	});
}




//Adding A Friend

friendSubmit.addEventListener('click', function()
{
	var result = "";
	var friendRequest = document.getElementById('username').value;
	socket.emit('checkFriend',{handle: senderUserSend, friendRequest, result});

});




//Adding a user to a groupchat 
groupButton.addEventListener('click', function()
{
	var result = "";
	var groupChatRequest = document.getElementById('usernamegroupchat').value;
	socket.emit('createGroupChat',{handle: senderUserSend, groupChatRequest, result});
});

//Accept Friend Request


//Deny Friend Request






socket.on('friendResponse', function(data)
{
	modalOutput.innerHTML = data.result;
});


socket.on('groupChatAdding', function(data)
{
	modalOutput.innerHTML = data.result;
});

socket.on('groupChatRequest', function(data)
{
	gcInviteOutput.innerHTML = data.result
});

socket.on('reaction',function(data)
{
	modalOutput.innerHTML = data.result;
});


//setInterval(function(){
socket.on('populate')
{
	var groupChat = "";
	var groupChatID = "";
	var onlineFriends = "";
	var offlineFriends = "";
	var gcInvite = "";
	//alert("HELLO??")
	socket.emit('fill',{handle: senderUserSend, friends, groupChat, groupChatID, onlineFriends, offlineFriends, pendingRequest, gcInvite});
	//for (var p = 1; p <= friendRequestList.getAttribute("numfriendrequests"); p++)
	//{
	//	var tempFriend = document.getElementById("friendrequest"+p);
	//	friendRequestList.removeChild(tempFriend);
	//}
};
//},5000);


//List of Events
socket.on('fillInformation', function(data)
{
	document.getElementById("friends").style.maxHeight = "45%";
        document.getElementById("friends").style.overflow = "auto";
	//for friends
	while(friendslist.hasChildNodes())
                {
			friendslist.removeChild(friendslist.firstChild);
                }
		var i = 1;
                while(data.list.indexOf(',') != -1)
                {
			//alert("IN FILL INFORMATION")
                        var friendName = data.list.split(',')[0];
                        var tempDiv = document.createElement("div");
			chat.setAttribute("numFriends",""+i);
                        var tempButton = document.createElement("button");
                        tempButton.className = "friend"
                        tempDiv.appendChild(tempButton);

			tempButton.setAttribute("id","chatid" + i);

                        tempButton.setAttribute("chatid","" +data.handle);
                        //tempButton.setAtrribute("friendid", "" + friendName);
                        //tempButton.setAtrribute("id", ""+ i);
                        tempButton.innerHTML = "" + friendName;

                        friendslist.appendChild(tempDiv);
                        data.list = data.list.replace(friendName,"");
                        data.list = data.list.substr(1);
                        friendName = ""
                        i++
                }
assignFriendsListeners();

//for groupchats
document.getElementById("groupchats").style.maxHeight = "45%";
        document.getElementById("groupchats").style.overflow = "auto";
	while(groupchatslist.hasChildNodes())
                {
                        groupchatslist.removeChild(groupchatslist.firstChild);
                }
                var j = 1;
                while(data.groupChat.indexOf(',') != -1)
                {
                        var groupChatName = data.groupChat.split(',')[0];
			var groupChatID = data.groupChatID.split(',')[0];
                        var tempDiv = document.createElement("div");
                        chat.setAttribute("numGroupchats",""+j);
                        var tempButton = document.createElement("button");
			var tempimg = document.createElement("img");
			var tempimgPermission = document.createElement("button");
                        tempButton.className = "groupchat";
                        tempDiv.appendChild(tempButton);
			tempDiv.appendChild(tempimg);
			//tempDiv.appendChild(tempimgPermission);

			tempimg.setAttribute("src","/add.png");
			tempimg.setAttribute("id","addtogc" +j);
			tempimg.setAttribute("chatid",""+groupChatID);

		//	tempimgPermission.setAttribute("src","/add.png");
                        tempimgPermission.setAttribute("id","gcPermission" +j);
                        tempimgPermission.setAttribute("chatid",""+groupChatID);

                        tempButton.setAttribute("id","groupchatid" + j);
                        tempButton.setAttribute("chatid","" +groupChatID);
                        tempButton.innerHTML = "" + groupChatName;

                        groupchatslist.appendChild(tempDiv);

			data.groupChatID = data.groupChatID.replace(groupChatID, "");
			data.groupChatID = data.groupChatID.substr(1);
			groupChatID = "";

                        data.groupChat = data.groupChat.replace(groupChatName,"");
                        data.groupChat = data.groupChat.substr(1);
                        groupChatName = ""
                        j++
                }
assignGroupChatListeners();

//var gcInviterList = document.getElementById("groupChatList");
while(gcInviterList.hasChildNodes())
                {
                        gcInviterList.removeChild(gcInviterList.firstChild);
                }
                var gcInviterCounter = 1;
		if(data.gcInvite != null){ //prevents an error for our while loop conditional
                while(data.gcInvite.indexOf(",") != -1)
                {
			gcInviteMainLabel = document.createElement("label");
			gcInviteMainLabel.setAttribute("id", "groupChatListLabel");
			gcInviterList.appendChild(gcInviteMainLabel);
			document.getElementById("groupChatListLabel").innerHTML = "Looks like someone wants you to join their groupchat!<br>";

			var gcNameOwnerNamePair = data.gcInvite.split(',')[0];
			var groupChatName = gcNameOwnerNamePair.split('|')[0];
			var groupChatOwnerName = gcNameOwnerNamePair.split('|')[1];
			//var groupChatID = data.groupChatInviteID.split(',')[0];

			gcInviterList.setAttribute("numgcinvites", "" + gcInviterCounter);

			var tempSpan = document.createElement("span");
			tempSpan.setAttribute("id", "gcinvite" + gcInviterCounter);
			tempSpan.setAttribute("gcOwner","" + groupChatOwnerName);
			tempSpan.setAttribute("gcName","" + groupChatName);

			var tempLabel = document.createElement("label");
			tempLabel.innerHTML = "" + groupChatName + ": Owned by, " + groupChatOwnerName;
			tempSpan.appendChild(tempLabel);

			var acceptButton = document.createElement("button");
                        acceptButton.setAttribute("id","gcAcceptButton" + gcInviterCounter);
                        acceptButton.setAttribute("class","AcceptButton");
			acceptButton.setAttribute("gcId", groupChatID);
                        acceptButton.innerHTML = "Accept";
                        tempSpan.appendChild(acceptButton);

                        var denyButton = document.createElement("button");
                        denyButton.setAttribute("id","gcDenyButton" + gcInviterCounter);
                        denyButton.setAttribute("class","denyButton");
			denyButton.setAttribute("gcId", groupChatID);
                        denyButton.innerHTML = "Deny";
                        tempSpan.appendChild(denyButton);

			data.gcInvite = data.gcInvite.replace(gcNameOwnerNamePair,"");
                        data.gcInvite = data.gcInvite.substr(1);
                        groupChatName = "";
			groupChatOwnerName = "";

			gcInviterList.appendChild(tempSpan);

		} //end while
	} //end if
acceptGCInviteListeners();
denyGCInviteListeners();
inviteToGroupChatListeners();

//PENDING FRIENDS
var counterFriend = 1;
	while(data.pendingRequest.indexOf(",") != -1)
		{
			document.getElementById("friendRequestListLabel").innerHTML = "Looks like someone wants to be your friend!<br>";
			var friendToBeName = data.pendingRequest.split(',')[0];
			friendRequestList.setAttribute("numfriendrequests", counterFriend);
			var tempSpan = document.createElement("span");
			tempSpan.setAttribute("id","friendrequest"+ counterFriend);

			var tempLabel = document.createElement("label");
			tempLabel.setAttribute("class","usernamelabel");
			tempLabel.innerHTML = "" + friendToBeName;
			tempSpan.appendChild(tempLabel);

			var acceptButton = document.createElement("button");
			acceptButton.setAttribute("id","acceptButton" + counterFriend);
		        acceptButton.setAttribute("class","acceptButton");
			acceptButton.setAttribute("acceptwho", friendToBeName);
			acceptButton.innerHTML = "Accept";
			tempSpan.appendChild(acceptButton);

			var denyButton = document.createElement("button");
			denyButton.setAttribute("id","denyButton" + counterFriend);
			denyButton.setAttribute("class","denyButton");
			denyButton.setAttribute("denywho", friendToBeName);
			denyButton.innerHTML = "Deny";
			tempSpan.appendChild(denyButton);

			document.getElementById("friendRequestList").appendChild(tempSpan);

			data.pendingRequest = data.pendingRequest.replace(friendToBeName,"");
			data.pendingRequest = data.pendingRequest.substr(1);
			friendToBeName = "";

			counterFriend++;
		}
acceptFriendListeners();
denyFriendListeners();
createsMyOnClickForGroupChatUser();
//alert(data.pendingRequest);

});


//Response For Messages
socket.on('chat', function(data){
	feedback.innerHTML = '';
	output.innerHTML += '<p><strong>' + data.userSend + '</strong>'
	   	         + '<span class="timestamp">  @ ' + data.time + '</span><br><br>'
                         + '<span class="message">' + data.message + '</span></p>';
	updateScroll()
});

//Response For Typing
socket.on('typing', function(data){
    	document.getElementById("feedback").style.fontSize = "small";
	document.getElementById("feedback").style.opacity = "0.7";
	feedback.innerHTML = '<p><em>' + data.handle + ' is typing a message...</em></p>';
});

socket.on("1on1Conversation", function(data) 
{
	feedback.innerHTML = '';
	var boolean = true;
	var i = 0;
	right.setAttribute("class", "chat");
	while(output.hasChildNodes())
	{
		output.removeChild(output.firstChild);
	}
	while(boolean == true)
	{

		if(data.logs[i] == undefined)
		{
		   boolean = false
		}
		else
		{

			var sender = data.logs[i].usernamesender;
			var msg = data.logs[i].message;
			var timestamp = data.logs[i].timestamp;
			updateScroll()
			document.getElementById("output").style.maxHeight = "85%";
  			document.getElementById("output").style.overflow = "auto";
			output.innerHTML += '<p><strong>' + sender + '</strong>' 
				+ '<span class="timestamp">  @ ' + timestamp + '</span><br><br>'
				+ '<span class="message">' + msg + '</span></p>';
			i++;
		}
	}

	input();
});

socket.on("groupChatConversation", function(data) 
{
        feedback.innerHTML = '';
        var boolean = true;
        var i = 0;
	right.setAttribute("class", "chat");

	//var inchatbar = document.createElement('div');
        //inchatbar.setAttribute("id","inchat");
	//document.getElementById("stage").appendChild(inchatbar);
/**	var inchatbarimg = document.createElement('img');
	var inchatbarimg2 = document.createElement('img');
        inchatbarimg.setAttribute("class","inchatimg");
        inchatbarimg2.setAttribute("class","inchatimg");        
	inchatbarimg.setAttribute("src","permissions.png");
	inchatbarimg2.setAttribute("src","adduser.png");
        document.getElementById("inchatbar").appendChild(inchatbarimg);	
	document.getElementById("inchatbar").appendChild(inchatbarimg2);
**/
	//assign listeners to permission buttons
        //for(i = 1; i <= chat.getAttribute("numgroupchats"); i++)
        //{
                var permissionButton = document.getElementById("gcPermission" + i );
                (function (permissionButton) 
                {
                        groupChatPermissionButton.addEventListener('click',function()
                        {
                                var permissionModal = document.getElementById("groupChatPermissionModal")
                              permissionModal.style.display = "block"


				var onlineMemberCounter = 1;
			while(data.onlineFriend.indexOf(',') != -1)
			{
				onlineMemberDiv.setAttribute("onlinemembercount", onlineMemberCounter);

				var tempName = data.onlineFriend.split(',')[0];

				var tempDiv = document.createElement("div");
				var tempLabel = document.createElement("label");
				var tempSelect = document.createElement("select");
				var tempOption1 = document.createElement("option");
                                var tempOption2 = document.createElement("option");
                                var tempOption3 = document.createElement("option");
				var tempOption4 = document.createElement("option");
				var tempButton = document.createElement("button");
				tempButton.setAttribute("class","modalsubmit");
				tempButton.innerHTML = "Change Permission";

				tempOption1.innerHTML = "Select a Permission";
				tempOption2.innerHTML = "User";
                                tempOption3.innerHTML = "Mod";
                                tempOption4.innerHTML = "Admin";

				tempOption1.setAttribute("permissionValue","-1");
                                tempOption2.setAttribute("permissionValue","0");
                                tempOption3.setAttribute("permissionValue","1");
                                tempOption4.setAttribute("permissionValue","2");

				tempLabel.innerHTML = "" + tempName;

				tempSelect.appendChild(tempOption1);
				tempSelect.appendChild(tempOption2);
				tempSelect.appendChild(tempOption3);
				tempSelect.appendChild(tempOption4);

				tempDiv.setAttribute("id","onlineMember" + onlineMemberCounter);
				tempLabel.setAttribute("id","onlineMemberLabel" + onlineMemberCounter);
				tempLabel.setAttribute("class","usernamelabel");
				tempSelect.setAttribute("id","onlineMemberSelect" + onlineMemberCounter);
				tempButton.setAttribute("id","onlineMemberButton" + onlineMemberCounter);

				tempDiv.appendChild(tempLabel);
				tempDiv.appendChild(tempSelect);
				tempDiv.appendChild(tempButton);

				onlineMemberDiv.appendChild(tempDiv);

				data.onlineFriend = data.onlineFriend.replace(tempName,"");
                        	data.onlineFriend = data.onlineFriend.substr(1);
                       		tempName = "";

					(function (tempButton)
                {

                        tempButton.addEventListener('click',function()
                        {
			var changePermission = document.getElementById("onlineMemberSelect" + (onlineMemberCounter - 1)).value;
                        var user = document.getElementById("onlineMemberLabel" + (onlineMemberCounter - 1)).innerHTML;
                        var gcid = chat.getAttribute("activechatid");
                        socket.emit('changePermissions', {
                        handle: senderUserSend,
                        changePermission,user,gcid});

                });
                })(tempButton);

				onlineMemberCounter++;
			} //end while
				let offlineMemberCounter = 1;

			while(data.offlineFriend.indexOf(',') != -1)
		{
                                offlineMemberDiv.setAttribute("offlineMemberCount", offlineMemberCounter);

				var tempName = data.offlineFriend.split(',')[0];

                                var tempDiv = document.createElement("div");
                                var tempLabel = document.createElement("label");
                                var tempSelect = document.createElement("select");



                                var tempOption1 = document.createElement("option");
                                var tempOption2 = document.createElement("option");
                                var tempOption3 = document.createElement("option");
                                var tempOption4 = document.createElement("option");
                                var tempButton = document.createElement("button");
				tempButton.setAttribute("class","modalsubmit");
                                tempButton.innerHTML = "Change Permission";

                                tempOption1.innerHTML = "Select a Permission";
                                tempOption2.innerHTML = "Normie";
                                tempOption3.innerHTML = "Mod";
                                tempOption4.innerHTML = "Admin";

				tempOption1.setAttribute("permissionValue","-1");
                                tempOption2.setAttribute("permissionValue","0");
                                tempOption3.setAttribute("permissionValue","1");
                                tempOption4.setAttribute("permissionValue","2");


                                tempLabel.innerHTML = "" + tempName;

                                tempSelect.appendChild(tempOption1);
                                tempSelect.appendChild(tempOption2);
                                tempSelect.appendChild(tempOption3);
                                tempSelect.appendChild(tempOption4);

                                tempDiv.setAttribute("id","offlineMember" + offlineMemberCounter);
				tempLabel.setAttribute("id","offlineMemberLabel" + offlineMemberCounter);
				tempLabel.setAttribute("class","usernamelabel");
                                tempSelect.setAttribute("id","offlineMemberSelect" + offlineMemberCounter);
                                tempButton.setAttribute("id","offlineMemberButton" + offlineMemberCounter);

                                tempDiv.appendChild(tempLabel);
                                tempDiv.appendChild(tempSelect);
                                tempDiv.appendChild(tempButton);

                                offlineMemberDiv.appendChild(tempDiv);

                                data.offlineFriend = data.offlineFriend.replace(tempName,"");
                                data.offlineFriend = data.offlineFriend.substr(1);
                                tempName = "";
//
  //                                      (function (tempButton)
    //            {
/**
	//		alert(offlineMemberCounter);
                        tempButton.addEventListener('click',function()
                        {
	//			alert(offlineMemberCounter);
                        var tester1000 = 1;
			var changePermission = document.getElementById("offlineMemberSelect" + (tester1000 - 1)).value;
                        var user = document.getElementById("offlineMemberLabel" + (tester1000 - 1)).innerHTML;
                        var gcid = chat.getAttribute("activechatid");
	//alert(user);
                        socket.emit('changePermissions', {
                        handle: senderUserSend,
                        changePermission,user,gcid});
			tester1000++;
                });
                })(tempButton);
**/
				offlineMemberCounter++;
//	alert(offlineMemberCounter);
		} //end while 
assignPermissionListeners();
                        //toDo();
               	});
                })(permissionButton); //end of closure

		//assign listeners, yes this should be its own function but due to the previous error im not chancing it
//might need that bracket
//	}


        while(output.hasChildNodes())
        {
                output.removeChild(output.firstChild);
        }
        while(boolean == true)
        {
                if(data.logs[i] == undefined)
                {
                   boolean = false
                }
                else
                {

                        var sender = data.logs[i].usernamesender;
                        var msg = data.logs[i].message;
                        var timestamp = data.logs[i].timestamp;
			updateScroll()
                        document.getElementById("output").style.maxHeight = "85%";
			document.getElementById("output").style.overflow = "auto";
                        output.innerHTML += '<p><strong>' + sender + '</strong>' 
                                + '<span class="timestamp">  @ ' + timestamp + '</span><br><br>'
				+ '<span class="message">' + msg + '</span></p>';
                        i++;
                }
        }
	input();

	//alert("Online: "+ data.onlineFriend);
});

function assignFriendsListeners()
{
	for(i = 1; i <= chat.getAttribute("numfriends"); i++)
	{
//	alert(i)

	var testButton  = document.getElementById("chatid" + i);
//	alert(testButton.innerHTML)
//beginning of closure
(function (testButton) {
			testButton.addEventListener('click',function()
                {
  //                      alert(testButton.innerHTML);
			chat.setAttribute("activechatid", testButton.innerHTML);
			chat.setAttribute("isgroupchat", "no");
			socket.emit('conversation1on1', {
			handle: senderUserSend,
			friend: chat.getAttribute("activechatid"),
			logs});
                });
		})(testButton);
//end of closure


	}
}

function assignGroupChatListeners()
{
        for(i = 1; i <= chat.getAttribute("numgroupchats"); i++)
        {
        var testButton  = document.getElementById("groupchatid" + i);
//beginning of closure

(function (testButton) {
                        testButton.addEventListener('click',function()
                {
  //                      alert(testButton.innerHTML);
			var onlineFriend = "";
			var offlineFriend = "";
			var test = "";
                        chat.setAttribute("activechatid", testButton.getAttribute("chatid"));
			chat.setAttribute("isgroupchat", "yes");
                        socket.emit('groupChat', {
                        handle: senderUserSend,
                        friend: chat.getAttribute("activechatid"),
                        logs,onlineFriend,offlineFriend});
			socket.emit('gc', {handle: senderUserSend, friends: chat.getAttribute("activechatid"), test});
			toDO();
                });
                })(testButton);
//end of closure

        }
}
/**
function assignPermissionListeners(onlineFriend, offlineFriend)
{
alert("in the function");
	for(i = 1; i <= chat.getAttribute("numgroupchats"); i++)
        {
		alert("in the for loop");
		alert("gcPermission"+i);
		alert(onlineFriend);
		var permissionButton = document.getElementById("gcPermission" + i );
		alert(permissionButton.getAttribute("id"));
		(function (permissionButton) 
		{
		alert("over here");
                        permissionButton.addEventListener('click',function()
                	{
				alert("TESTING")
				var permissionModal = document.getElementById("groupChatPermissionModal")
        	              permissionModal.style.display = "block"

			alert(onlineFriend)
			alert(offlineFriend);

			//toDo();
			});
			alert("AT THE END OF THE CLOSURE")
               	})(permissionButton); //end of closure
	alert("AFTER ON CLICK AND CLOSURE")
	} //end for loop
alert("WE MADE IT TO THE END")
}
*/
function inviteToGroupChatListeners()
{
//alert("enter accept friend listeners");
        for(addGC = 1; addGC <= chat.getAttribute("numgroupchats"); addGC++)
        {
        var testimg  = document.getElementById("addtogc" + addGC);

//beginning of closure
(function (testimg) {
                        testimg.addEventListener('click',function()
                {
                        gcInviterModal.setAttribute("chatid",testimg.getAttribute("chatid"));
			gcInviterModal.style.display = "block";
                });
                })(testimg);
//end of closure
        }
}

function createsMyOnClickForGroupChatUser()
{
//alert("enter accept friend listeners");
        var gcInviterSubmitButton  = document.getElementById("invitetogroupchat");
//beginning of closure
(function (gcInviterSubmitButton) {
                        gcInviterSubmitButton.addEventListener('click',function()
{
        var addToWhere = gcInviterModal.getAttribute("chatid");
        //which group chat to add them to
	var result = "";
        var addWho = document.getElementById("usernamegroupchatinviter").value;
        socket.emit("addGroupChatUser", {
        handle: senderUserSend,
        addToWhere, addWho, result});

});
                })(gcInviterSubmitButton);
//end of closure
}



function acceptFriendListeners()
{
//alert("enter accept friend listeners");
        for(acceptcounter = 1; acceptcounter <= friendRequestList.getAttribute("numfriendrequests"); acceptcounter++)
        {

        var testRequest  = document.getElementById("acceptButton" + acceptcounter);
//      alert(testButton.innerHTML)
//beginning of closure
//alert("id is " + "friendrequest"+acceptcounter);
if (document.getElementById("friendrequest"+acceptcounter) != null)
{
(function (testRequest) {
                        testRequest.addEventListener('click',function()
                {
                        var whoAccept = testRequest.getAttribute("acceptwho");
			//who you are accepting
			var result = "";
			//alert("id is " + "friendrequest"+acceptcounter);
			var tempFriend = document.getElementById("friendrequest"+(acceptcounter -1));
			 while(tempFriend.hasChildNodes())
        		{
               			 tempFriend.removeChild(tempFriend.firstChild);
        		}
                        friendRequestList.removeChild(tempFriend);
                        socket.emit('acceptFriend', {
                        handle: senderUserSend,
                        whoAccept, result});
			toDO();
                });
                })(testRequest);
//end of closure
	        }
	}
}

function denyFriendListeners()
{
        for(i = 1; i <= friendRequestList.getAttribute("numfriendrequests"); i++)
        {
        var testRequest  = document.getElementById("denyButton" + i);
//      alert(testButton.innerHTML)
//beginning of closure
if (document.getElementById("friendrequest"+i) != null)
{
(function (testRequest) {
                        testRequest.addEventListener('click',function()
                {
			var whoDeny = testRequest.getAttribute("denywho");
			//who you are denying
			var result = "";
			var tempFriend = document.getElementById("friendrequest"+(i-1));
			while(tempFriend.hasChildNodes())
                        {
                                 tempFriend.removeChild(tempFriend.firstChild);
                        }
	                friendRequestList.removeChild(tempFriend);
                        socket.emit('denyFriend', {
                        handle: senderUserSend,
                        whoDeny, result});
                });
                })(testRequest);
//end of closure
       		 }
	}
}

function acceptGCInviteListeners()
{
//alert("enter accept friend listeners");
        for(acceptCounter = 1; acceptCounter <= gcInviterList.getAttribute("numgcinvites"); acceptCounter++)
        {
        var testRequest  = document.getElementById("gcAcceptButton" + acceptCounter);
//      alert(testButton.innerHTML)
//beginning of closure
//alert("id is " + "friendrequest"+acceptcounter);
if (document.getElementById("gcinvite"+acceptCounter) != null)
{
(function (testRequest) {
                        testRequest.addEventListener('click',function()
                {
                        alert("you clicked a gc invite accept button please get rid of this alert later");
                        var tempInvite = document.getElementById("gcinvite"+(acceptCounter -1));

			var owner = tempInvite.getAttribute("gcOwner"); //gcOwner Name
			var location = tempInvite.getAttribute("gcName"); //gcName

			socket.emit('acceptGroupChat', {
                        handle: senderUserSend,
                        owner, location});
                        //toDO();

			 while(tempInvite.hasChildNodes())
                        {
                                 tempInvite.removeChild(tempInvite.firstChild);
                        }
                        gcInviterList.removeChild(tempInvite);

                });
                })(testRequest);
//end of closure
                }
        }
}


function denyGCInviteListeners()
{
        for(denyCounter = 1; denyCounter <= gcInviterList.getAttribute("numgcinvites"); denyCounter++)
        {
        var testRequest  = document.getElementById("gcDenyButton" + denyCounter);
//beginning of closure
if (document.getElementById("gcinvite"+denyCounter) != null)
{
(function (testRequest) {
                        testRequest.addEventListener('click',function()
                {
                        alert("you clicked a gc invite deny button please get rid of this alert later");
                        var tempInvite = document.getElementById("gcinvite"+(denyCounter -1));

			var owner = tempInvite.getAttribute("gcOwner"); //gcOwner Name
                        var location = tempInvite.getAttribute("gcName"); //gcName


			socket.emit('denyGroupChat', {
                        handle: senderUserSend,
                        owner, location});
                        //toDO();

			 while(tempInvite.hasChildNodes())
                        {
                                 tempInvite.removeChild(tempInvite.firstChild);
                        }
                        gcInviterList.removeChild(tempInvite);
                });
                })(testRequest);
//end of closure
                }
        }
}

function toDO()
{
var groupChat = "";
        var groupChatID = "";
        var onlineFriends = "";
        var offlineFriends = "";
        //alert("HELLO??")
        socket.emit('fill',{handle: senderUserSend, friends, groupChat, groupChatID, onlineFriends, offlineFriends, pendingRequest});
}


/**
function assignPermissionListeners(onlineFriend, offlineFriend)
{
alert("in the function");
        for(i = 1; i <= chat.getAttribute("numgroupchats"); i++)
        {
                alert("in the for loop");
                alert("gcPermission"+i);
                alert(onlineFriend);
                var permissionButton = document.getElementById("gcPermission" + i );
                alert(permissionButton.getAttribute("id"));
                (function (permissionButton) 
                {
                alert("over here");
                        permissionButton.addEventListener('click',function()
                        {
                                alert("TESTING")
                                var permissionModal = document.getElementById("groupChatPermissionModal")
                              permissionModal.style.display = "block"
                        alert(onlineFriend)
                        alert(offlineFriend);
                        //toDo();
                        });
                        alert("AT THE END OF THE CLOSURE")
                })(permissionButton); //end of closure
        alert("AFTER ON CLICK AND CLOSURE")
        } //end for loop
alert("WE MADE IT TO THE END")
}
**/
function assignPermissionListeners()
{
numOfflineMembers = offlineMemberDiv.getAttribute("offlineMemberCount");

for (var permissionListenerCounter = 1; permissionListenerCounter < numOfflineMembers; permissionListenerCounter++)
{
	var tempButton = document.getElementById("offlineMemberButton" + permissionListenerCounter);
                                        (function (tempButton)
                {
        //              alert(offlineMemberCounter);
                        tempButton.addEventListener('click',function()
                        {
        //                      alert(offlineMemberCounter);
                       
                        var changePermission = document.getElementById("offlineMemberSelect" + (permissionListenerCounter - 1)).value;
                        var user = document.getElementById("offlineMemberLabel" + (permissionListenerCounter - 1)).innerHTML;
                        var gcid = chat.getAttribute("activechatid");
        //alert(user);
                        socket.emit('changePermissions', {
                        handle: senderUserSend,
                        changePermission,user,gcid});
                       
                });
                })(tempButton);
}
}
