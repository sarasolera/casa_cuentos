var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static("public"));
app.use(express.static("views"));

//Ponemos el servidor a escuchar

io.on("connection", function(socket){

});

//Ponemos al servidor a escuchar por el puerto 80
server.listen(80, function () {
    console.log("Servidor corriendo en http://localhost:8080");
  });