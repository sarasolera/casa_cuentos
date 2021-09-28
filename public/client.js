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
  console.log("Llego a join");
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
  $('#bloque_tablero').addClass('hidden');
  $("#bloque_central").removeClass('hidden');
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
  $("#bloque_tablero").removeClass("hidden");
  $("#bloque_tablero").load("./board.html");
  $("#camaras").removeClass("hidden");
});

function chooseLandscape(carta) {
  console.log("Carta elegida ", carta);
  //Avisamos al servidor de la carta elegida
  socket.emit("chooseLandscape", carta);
}

socket.on("showCard", showCard);


function returnBoard(){
  $('#bloque_central').addClass('hidden');
  $("#bloque_tablero").removeClass('hidden');
  //$("#bloque_tablero").load("./board.html");
}

function showCard(card) {
  //Volvemos al tablero
  returnBoard();
  cadena ="<p>Carta paisaje seleccionada:</p><img id=carta_recorrido src=assets/images/landscape/" +card +" >";
  $("#bloque_recorrido").append(cadena);
  console.log("Cerramos puerta ");
  socket.emit("close_door",0,1);
}

socket.on("close_door",closeDoor);


function closeDoor(index,next){ 
  console.log("#puerta_"+index)
  //Cambiamos la puerta en la que hemos entrado
  $('#puerta_'+index).attr('src','/assets/images/estrella.png');  
  $('#puerta_'+index).addClass("estrella");
  $("#puerta_"+index   ).removeClass("abierta");
  $('#texto_puerta_'+index).addClass("hidden");

  //Cambiamos la puerta en la que vamos a entrar
  $("#puerta_"+next).attr('src','/assets/images/libro_abierto.png');  
  $("#puerta_"+next).addClass("abierta");
  $("#puerta_"+next).removeClass("cerrada");
  $("#texto_puerta_"+next).removeClass("hidden");

};

//Obtenemos genero y tramas
function getGender(){
  //Pedimos al servidor uin genero y 3 tramas
  socket.emit("getGender");
}

socket.on("showGender",showGender);

var gender_selected = null;

function showGender(gender){
  console.log("Entro en showGender");
  cadena = "<p>Genero de la historia: </p><p id=nombre_genero>"+gender+"</p>";
  $('#bloque_genero').append(cadena);
  $('#bloque_genero').removeClass('hidden');
  gender_selected = gender;
  getPlots();

}

function getPlots(){
  socket.emit("getPlots");
}

socket.on("showPlots" , showPlots);

var plots_selected = [];
function showPlots(plots){
  console.log("Entro en showPLots");
  plots_selected = plots;

  cadena="<div id=bloque_tramas>"
  for(var i = 0 ; i < 3 ; i++){
    cadena+='<div class=tramas><p>'+plots[i]+'</p> <button type=button onclick=getDescription('+i+')>Explicación</button>'+'</div>';
  }
  cadena+="</div>"

  $("#trama_genero").append(cadena);

  $("#b_genero").addClass("hidden");

  $("#bloque_fase").append('<button id="continuar" type=button onclick=showSelectedGender()> Continuar...</button>');
  
}

function getDescription(index){
  socket.emit("getDescription",index);
}


socket.on("showDescription" , showDescription);

function showDescription(description){
  console.log($("#descripcion"));
  if($("#descripcion").length > 0 ){
    console.log("if")
    
    $("#descripcion").text(description);
  }
  else{
    console.log("else")
    cadena="<div id=descripcion>";
    cadena+='<p id=texto_descripcion>'+description+'</p>';
    cadena+="</div>";
    $("#trama_genero").append(cadena);
  }

}

function showSelectedGender(){
  socket.emit("showSelectedGender" , showSelectedGender);
  
}

socket.on("showSelectedGender",function(){
  returnBoard();
  console.log(gender_selected);
  console.log(plots_selected);
  cadena ="<p>Genero => " +gender_selected+"</p>";
  cadena+="<p>Tramas: </p>";

  plots_selected.forEach(element=>{
    cadena += "<p>"+element+"</p>";
  })

  $("#bloque_recorrido").append(cadena);

  socket.emit("close_door",1,2);
})