const socket = io();

/**
 * Creamos la clase jugador que va a ser cada cliente,
 * así podremos controlar que jugador esta jugando en cada momento
 */
class Player {
  constructor(name) {
    this.name = name;
    this.isPlaying = false;
  }
}

//Cada cliente tendrá acceso a este script de manera única lo unico conjunto es el servidor
//Creamos la instancia jugador
var player = new Player();

//Funcion joinRoom
function joinRoom() {
  //Captamos el nombre del jugador
  let namePlayer = document.getElementById("name_player").value;

  if (namePlayer) {
    console.log("El cliente va a enviar la petición " + namePlayer);
    player.name = namePlayer;
    player.isPlaying = false;
    /*Indicamos al servidor que el jugador se quiere unir al juego,
        para ello usamos el socket conectado al puerto 80 y emitimos la petición*/
    socket.emit("joinRoom", namePlayer);
  }
}

//Estamos pendientes a que el socket nos envie la url de la sala
socket.on("room", roomUrl);

function roomUrl(url) {
  console.log("Llega a la función dle cliente");
  console.log("Url hacia comenzar juego recibida");
  //biblioteca jquery
  $("#content").load(url);
}

//Enviar mensajes por el chat
function sendMessage() {
  var mensaje = {
    autor: player.name,
    texto: document.getElementById("mensaje_chat").value
  };

  document.getElementById("mensaje_chat").value = "";
  //Enviamos el mensaje al servidor para que lo agregue a todos los mensajes y lo puedan ver el resto de clientes
  socket.emit("new_message", mensaje);

  return false;
}

//Recibimos el array completo de mensajes que vamos a mostrar en el div
socket.on("all_messages", allMessage);
function allMessage(messages) {
  console.log("Todos los mensajes del chat");
  //Por cada uno generamos una entrada en el chat
  var cadena = "";
  messages.map(function (element, index) {
    cadena +=
      "<p> <span>" + element.autor + "</span>:" + element.texto + "</p>";
  });

  jQuery("#mensajes").html(cadena);
}

//Cargar pantalla fase indicada en los argumentos
function loadDoor(index) {
  console.log("Cliente solicita cargar fase " + index);
  socket.emit("get_url_door", index);
}

socket.on("showContentDoor", showContentDoor);

function showContentDoor(url) {
  console.log("Cargando plantilla " + url);
  $("#bloque_central").load(url);
}

//Cargar cartas paisaje

function getLandscapeCard() {
  console.log("Consultando cartas paisaje...");
  //Solicittamos al servidor 3 cartas paisaje
  socket.emit("get_landscapecard");
}

//Recibimos las cartas
socket.on("showLandscapeCard", showLandscapeCard);
function showLandscapeCard(arrayCards) {
  console.log("Vamos a mostrar las cartas paisaje...");
  $("#b_paisaje").addClass("hidden");
  $("#cartas").removeClass("hidden");
  var cadena = "";
  for (var i = 0; i < arrayCards.length; i++) {
    if (i % 2 == 0) {
      var id = "first_card";
    } else {
      var id = "second_card";
    }
    cadena +=
      "<div><img id=" +
      id +
      " src=assets/images/landscape/" +
      arrayCards[i] +
      "></div>";
  }

  console.log("CADENA" + cadena);

  $("#cartas").append(cadena);
}

//Start game
function startGame() {
  socket.emit("startGame");
}

socket.on("showBoard", function () {
  $("#bloque_comenzar").addClass("hidden");
  $("#bloque_central").removeClass("hidden");
});
