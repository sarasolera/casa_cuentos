var express = require("express");
var app = express();
//SERVIDOR HTTP a partir de la librería de express para las conexiones
var server = require("http").Server(app);
//Para generar la comunicación trabajo con socket io
var io = require("socket.io")(server);

const NUM_MAX_PLAYER = 4;
var num_players = 1;
var isAllPlayer = false;
//Carpetas donde estan nuestros ficheros
app.use(express.static("public"));
app.use(express.static("views"));

/**
 * Importamos la clase room y creamos una instancia de la sala
 */
const Room = require("./room");
var r;
//Creamos la sala
r = new Room();

var array_card;
//Array de mensajes
var messages = [];
//socket escuchando conexiones
io.on("connection", function (socket) {
  //Peticion de un cliente de unirse al juego
  socket.on("joinRoom", joinRoom);

  function joinRoom(name_player) {
    console.log("Se ha unido un jugador nuevo llamado: ", name_player);
    console.log("NUM JUGADORES ACTUALES ", num_players);

    if (num_players < NUM_MAX_PLAYER && !isAllPlayer) {
      num_players += 1;
      r.addPlayer(name_player);
      //Enviamos la url
      socket.emit("room", r.url);
    } else {
      console.log("Nadie más se puede unir");
    }
  }

  //Captando mensajes que se envían por el chat
  socket.on("new_message", new_message);
  function new_message(message) {
    //Recibimos un mensaje de un jugador debemos enviarlo para que lo vea todo el grupo de jugadores
    messages.push(message);
    //Lo enviamos a todos
    io.sockets.emit("all_messages", messages);
  }

  socket.on("get_url_door", get_url_door);

  function get_url_door(index) {
    var url = r.get_url_door(index);
    console.log("Que fase han pedido los jugadores ", url);
    io.sockets.emit("showContentDoor", url);
  }

  //Esperamos la peticion para obtener cartas paisaje
  socket.on("get_landscapecard", function () {
    console.log("Jugadores solicitan las cartas paisaje");
    array_card = r.landscapeCards;
    io.sockets.emit("showLandscapeCard", array_card);
  });

  //Ya no pueden jugar más jugadores
  socket.on("startGame", function () {
    isAllPlayer = true;
    io.sockets.emit("showBoard");
  });
});

//Ponemos al servidor a escuchar por el puerto 80
server.listen(8080, function () {
  console.log("Servidor corriendo en http://localhost:8080");
});
