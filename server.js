var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);

app.use(express.static("public"));
app.use(express.static("views"));

/**
 * Importamos la clase room y creamos una instancia de la sala
 */
const Room = require("./room");
var r;
//Creamos la sala
r = new Room();

//socket escuchando conexiones
io.on("connection", function(socket){
    //Peticion de un cliente de unirse al juego
    socket.on("joinRoom", joinRoom);

    function joinRoom(name_player){
      console.log("Se ha unido un jugador nuevo llamado: ",name_player);
      r.addPlayer(name_player);
      //Enviamos la url
      socket.emit("room",r.url);
    }
});

//Ponemos al servidor a escuchar por el puerto 80
server.listen(80, function () {
    console.log("Servidor corriendo en http://localhost:8080");
  });