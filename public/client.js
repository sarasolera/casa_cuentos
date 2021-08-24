var socket = io.connect();

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

  $("#mensajes").html(cadena);
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
      " onclick=chooseLandscape('" +
      arrayCards[i] +
      "') ></div>";
  }

  $("#cartas").append(cadena);
}

//Start game
function startGame() {
  socket.emit("startGame");
}

socket.on("showBoard", function () {
  $("#bloque_comenzar").addClass("hidden");
  $("#bloque_central").removeClass("hidden");
  $("#bloque_central").load("./board.html");
  $("#camaras").removeClass("hidden");
});

//CAMARAS

function initCamera() {
  console.log("Peticion de cargar camaras");
  socket.emit("loadDivCamera");
}

socket.on("loadDivCamera", loadDivCamera);
function loadDivCamera(players) {
  cadena = "";
  console.log("CUANTOS JUGADORES HAY " + players.length);
  for (var i = 0; i < players.length; i++) {
    if (players[i] == player.name) {
      cadena +=
        "<div id=player_" +
        players[i] +
        "><button id=emitir type=submit onclick=initVideo()>Emitir</button>" +
        '<video src="" id=video' +
        players[i] +
        ' style="height: 160px;" autoplay="true"></video>' +
        "<canvas class=hidden id=preview" +
        players[i] +
        " >  </canvas>";
    } else {
      cadena +=
        "<div id=player_" +
        players[i] +
        ">" +
        "<img id=img" +
        players[i] +
        ' src="" alt=""  >';
    }

    cadena += "</div>";
  }
  $("#camaras").append(cadena);
}

socket.on("error_name", function () {
  $("#error").removeClass("hidden");
});

function initVideo() {
  //ACCESO A LA CAMARA
  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia;
  //Si me pide permiso
  if (navigator.getUserMedia) {
    $("#emitir").addClass("hidden");
    navigator.getUserMedia(
      { audio: true, video: true },
      loadCamara,
      errorCamara
    );
  } else {
    console.log("Error en el if");
  }
}

function errorCamara() {
  console.log("Error con la camara");
}

function loadCamara(stream) {
  $("#boton_emitir").addClass("hidden");
  console.log("Llego a load camara");
  var canvas = document.querySelector("#preview" + player.name);
  var context = canvas.getContext("2d");
  canvas.width = 220;
  canvas.height = 131;
  context.width = canvas.width;
  context.height = canvas.height;
  var video = document.querySelector("#video" + player.name);
  video.srcObject = stream;
  var intervalo = setInterval(() => {
    verVideo(context, video, canvas);
  }, 100);
}

function verVideo(context, video, canvas) {
  //Dibujamos el video sobre el lienzo, asi lo dibuja solo en el lienzo
  context.drawImage(video, 0, 0, context.width, context.height);
  socket.emit("stream", canvas.toDataURL("image/webp"), player.name);
}

socket.on("stream", stream);

function stream(image, p_name) {
  if (p_name != player.name) {
    var img = document.querySelector("#img" + p_name);
    img.src = image;
  }
}

function chooseLandscape(carta) {
  console.log("Carta elegida ", carta);
  //Avisamos al servidor de la carta elegida
  socket.emit("chooseLandscape", carta);
}

socket.on("showCard", showCard);

function showCard(card) {
  //Volvemos al tablero
  $("#bloque_central").load("./board.html");

  cadena =
    "<p>Carta paisaje seleccionada:</p><img id=carta_recorrido src=assets/images/landscape/" +
    card +
    " >";

  $("#bloque_recorrido").append(cadena);
}
