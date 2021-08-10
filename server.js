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


//Array de mensajes
var messages = [];
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


    //Captando mensajes que se envían por el chat
    socket.on("new_message",new_message);
    function new_message(message){
        //Recibimos un mensaje de un jugador debemos enviarlo para que lo vea todo el grupo de jugadores
        messages.push(message);
        //Lo enviamos a todos
        io.sockets.emit("all_messages",messages);
    }

    socket.on("get_url_door",get_url_door);

    function get_url_door(index){
        var url = r.get_url_door(index);
        console.log("Que fase han pedido los jugadores ",url);
        io.sockets.emit("showContentDoor",url);
    }
});

//Ponemos al servidor a escuchar por el puerto 80
server.listen(80, function () {
    console.log("Servidor corriendo en http://localhost:8080");
  });