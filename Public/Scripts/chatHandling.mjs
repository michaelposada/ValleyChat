var express = require('express');
var path = require('path');
var http = require('http');
var db = requite('pg');
// Create the app
var app = express();

// Create a Connection to the database
//var connection = "pstgres://www-data/5432/valley";

//var pgClient =- new pg.Client(connection);
//pgClient.connect();


export function getUsername(id)
{
// Create a Connection to the database
var connection = "postgres://www-data/5432/valley";

var pgClient =- new pg.Client(connection);
pgClient.connect();

var query = pgClient.query("SELECT username FROM userpass where id='id'");


return query;

};


































// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(8080,listen);


















// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);







// Socket setup & pass server
 io.on("connection", function(socket) {

    socket.on("user_join", function(data) {
		this.username = data;
        socket.broadcast.emit("user_join", data);
    });

    socket.on("chat_message", function(data) {
        data.username = this.username;
        socket.broadcast.emit("chat_message", data);
    });

	socket.on("disconnect", function(data) {
		socket.broadcast.emit("user_leave", this.username);
    });


    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

});
