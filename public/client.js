//Socket en cliente
var socket = io.connect();


/**
 * Creamos la clase jugador que va a ser cada cliente,
 * así podremos controlar que jugador esta jugando en cada momento
 */

class Player {
  constructor(name) {
    this.name = name;
    this.imagePlayer = "";
    this.moderador = false;
    this.num_room = -1;
    this.name_room = "";
    this.num_team = -1;
  }
}

//Cada cliente tendrá acceso a este script de manera única lo unico conjunto es el servidor
//Creamos la instancia jugador
var player = new Player();



let api;


/*Petición para crear la sala*/
/*function createRoom(){
  console.log("CREATE ROOM 1");

  console.log("EN la pantalla de create room")
  var nameRoom = document.getElementById('name_room').value;
  var passwordRoom = document.getElementById('password_room').value;

  socket.emit("create_room",nameRoom,passwordRoom);
}*/

socket.on('show_error',function(message){
  console.log("Error -> " + message);
  cadena_error = "<p>" + message + "</p>";

  $("#error_register").html(cadena_error);
  $("#error_register").removeClass('hidden');
});


socket.on('welcome_message',function(message){
  console.log(message);
});

//Función para crear la sala de juego
function createRoom() {
  //Captamos datos del formulario
  var formData = new FormData($("#frmUploadFile")[0]);
  
  //Función que guardará la imagen y creara la sala
  saveImage('create_room',formData)
}


function saveImage(action,formData){
  
  var name_player = document.getElementById('name_player').value;
  var name_room = document.getElementById('name_room').value;
  var pass_room = document.getElementById('password_room').value;
  //Comprobamos si existe imagen
  console.log("Form data image-> ");
  console.log(formData.get('avatar'));
  var existImage = false;
  if(formData.get('avatar').size != 0)
    existImage = true;


  // Con ajax enviamos la petición para almacenar la imagen.
  if(name_player.trim().length > 0 && name_room.trim().length > 0 && pass_room.trim().length > 0){
    $.ajax({
      url: '/save_player',
      type: 'POST',
      data: formData,
      async: false,
      cache: false,
      contentType: false,
      processData: false,
      success: function (data) {
        if (data.code === 200) {
          /* Si se ha almacenado bien la imagen enviamos la petición al 
             servidor para crear la sala*/
          data_emit = {
            name_player:name_player,
            isModerator : data.isModerador,
            name_room : name_room,
            password_room : pass_room,
            file : data.namefile
          }
          socket.emit(action,data_emit);
        }
        else {
          /* Si ha ocurrido un error al guardar la imagen recogemos
          el mensaje del servidor y mostramos*/
          cadena_error = "<p>" + data.message + "</p>";
          $("#errorRegister").html(cadena_error);
          $("#errorRegister").removeClass('hidden');
        }
      },
      error: function (err) {
        console.log('Error en el servidor ', err);
      }
    });
  }
  else{
    $("#errorRegister").html("<p>Es necesario introducir un nombre válido</p>");
    $("#errorRegister").removeClass('hidden');
  }
}



//Función para unirse a la sala de juego
function joinRoom() {
  var formData = new FormData($("#frmUploadFile")[0]);
  saveImage('join_room',formData)
}

//Redireccionamos a la pagina que nos envie el servidor
socket.on('redirect', function (destination,num_room,data) {

  //Almacenamos datos del jugador 
  //Quitamos display none
  console.log("destination -> "+destination);
  console.log("num_room -> "+num_room);
  console.log("data-> " + data);
  player.name = data.name_player;
  player.name_room = data.name_room;
  player.num_room = num_room;

  console.log("Player");
  console.log(player);

  $("#content").load(destination);

  setTimeout(() => {  $("#nombre_sala").text("Nombre Sala -> " + player.name_room); }, 200);
});


socket.on('redirect_page', function (destination,num_room,data) {

  //Datos que recibimos
  console.log(num_room);
  console.log(data);
  console.log(destination);
  console.log("Cargamos la pantalla")
  window.location.href = destination;
});


//Mostramos en jugadores los jugadores en la sala antes de empezar

socket.on("showPlayer",showPlayers);

function showPlayers(players_room){
  //list_players
  var cadena_player = '<div class="players"> ';
 
  for(let i=0 ; i<players_room.length ; i++){
    cadena_player += "<p> "+players_room[i].name.toUpperCase()+"</p>";
  }

  document.getElementById("list_players").innerHTML = cadena_player;
}


//Start game
function startGame() {
  //Debemos enviar el numero de sala al que pertenece el cliente que ha pulsado el boton
  socket.emit("startGame",player.num_room);
}

socket.on("showErrorModerador", showErrorModerador);

function showErrorModerador() {
  $("#error_moderador").removeClass("hidden");
}
socket.on("showErrorJugadores", showErrorJugadores);
function showErrorJugadores() {
  $("#error_jugador").removeClass("hidden");
}

function getTeams() {
  console.log("Player name room -> " + player.name_room);
  $("#nombre_sala").text("Nombre Sala -> " + player.name_room);
  console.log( $("#nombre_sala"));
  socket.emit("getTeams" , player.num_room);
}
 
  

socket.on("showTeams", showTeams);

var numTeams = 0;

function showTeams(array_teams) {
  

  numTeams = array_teams.length;
  console.log(player.name)
  var cadena = "<h2>EQUIPOS</h2>";
  $("#list_players").addClass("hidden");
  console.log(numTeams);
  for (var i = 0; i < numTeams; i++) {
    cadena += "<div><h3>Equipo " + (i+1) + "</h3><p id='puntos_equipo_"+i+"'>Puntos - 0 </p><div class=jugadores>";
    console.log("ARRAY TEAMS=> " + array_teams[i]);
    console.log("ARRAY TAM=> " + array_teams[i].length);
    for (var j = 0; j < array_teams[i].length; j++) {
      if(array_teams[i][j].name==player.name){
        //almacenamos el num_team
        player.num_team = i;
      }
      cadena += "<div class='player-image' onclick=selectPlayer('" +array_teams[i][j].name + "') >"
      if(array_teams[i][j].image === "")
        cadena += "<img id="+ array_teams[i][j].name +" src=assets/images/avatar.png>";
      else
        cadena += "<img  id="+ array_teams[i][j].name +" src=assets/images_player/" + array_teams[i][j].image + ">";

      cadena+= "<img id=turno_"+ array_teams[i][j].name +" class='hidden turno' src='assets/images_player/altavoz.png'><p>" + array_teams[i][j].name + "</p></div>"
    }

    cadena += "</div>";
  }
  console.log(cadena);
  $("#bloque_equipos").html(cadena);

  
 
}

function uploadDataPlayer(nombre_moderador) {
  if (nombre_moderador == player.name) {
    player.moderador = true;
  }
}

socket.on("showBoard", function (nombre_moderador) {
  console.log("Nombre del moderador "+nombre_moderador);
  uploadDataPlayer(nombre_moderador);

  $("#bloque_comenzar").addClass("hidden");
  $("#bloque_comenzar").html("");
  $("#bloque_tablero").removeClass("hidden");
  $("#bloque_tablero").load("./board.html");
  
  $("#camaras").removeClass("hidden");
  $("#header_start").addClass("hidden");
  console.log("Tablero cargado");


  setTimeout(() => { getTeams();generateVideoCall(); }, 600);



});



//Cargar pantalla fase indicada en los argumentos
function loadDoor(index) {
  //Solo el moderador puede cargar las puertas.
  if(player.moderador){
    console.log("Cliente solicita cargar fase " + index);
    console.log("El cliente " + player.name + " de la sala " + player.num_room);
    console.log("Solicita la puerta " + index)
    socket.emit("getDoor",player.num_room, index);
  }
}




socket.on("showContentDoor", showContentDoor);

function showContentDoor(url) {
  console.log("Player moderador => " + player.moderador);
  console.log("Nombre => " + player.nombre);
  console.log("Image => " + player.image);
  console.log("Cargando plantilla " + url);
  $('#bloque_tablero').addClass('hidden');
  $("#bloque_central").removeClass('hidden');
  $("#bloque_central").load(url);
}

//Cargar cartas paisaje

function getLandscapeCard() {
  console.log("Consultando cartas paisaje...");
  //Solicittamos al servidor 3 cartas paisaje
  socket.emit("get_landscapecard",player.num_room);
}

//Recibimos las cartas
socket.on("showLandscapeCard", showLandscapeCard);
function showLandscapeCard(arrayCards) {
  console.log("Vamos a mostrar las cartas paisaje...");
  console.log(arrayCards)
  $("#b_paisaje").addClass("hidden");
  $("#cartas").removeClass("hidden");
  var cadena = "";
  var class_element = "";
  for (var i = 0; i < arrayCards.length; i++) {
    var id = "carta_"+(i+1);
    if (i % 2 == 0) {
      class_element = "first_card";
    } else {
      class_element = "second_card";
    }
    cadena +=
      "<div><img id =" + id + " class=" +
      class_element +
      " src=assets/images/landscape/" +
      arrayCards[i] +
      " onclick=chooseLandscape('" +
      arrayCards[i] +
      "') ></div>";
  }

  $("#cartas").append(cadena);
}


function chooseLandscape(carta) {

  if(player.moderador){
    console.log("Carta elegida ", carta);
    //Avisamos al servidor de la carta elegida
    socket.emit("chooseLandscape",player.num_room , carta);
  }else{
    console.log("Debe ser moderador para poder interactuar con la carta.")
  }
  
}




function returnBoard() {
  $('#bloque_central').addClass('hidden');
  $("#bloque_tablero").removeClass('hidden');
}

socket.on("closeFirstDoor", closeFirstDoor);

function closeFirstDoor() {
  //Volvemos al tablero
  returnBoard();
  socket.emit("close_door",player.num_room, 0, 1);
}

socket.on("requestCloseDoor" ,requestCloseDoor)
function requestCloseDoor(index, next, array_puntos=null) {
  console.log("en la func")
  console.log(array_puntos)
  returnBoard();
  console.log("En la requestCloseDoor");
  console.log("Index => " , index);
  console.log("Next => ",next);
  
    for(var i = 0 ; i < array_puntos.length ; i++){
      console.log("#puntos_equipo_"+i+ " puntos "+array_puntos[i])
      $("#puntos_equipo_"+i).text("Puntos - " + array_puntos[i]);
    }
  
  closeDoor(index, next);
}

socket.on("close_door", closeDoor);


function closeDoor(index, next) {
  console.log("#puerta_" + index)
  //Cambiamos la puerta en la que hemos entrado
  $('#puerta_' + index).attr('src', '/assets/images/estrella.png');
  $('#puerta_' + index).addClass("estrella");
  $("#puerta_" + index).removeClass("abierta");
  $('#texto_puerta_' + index).addClass("hidden");

  console.log(next);
  if(next == "fin"){
    console.log("Puntos puestos ");
    setTimeout(() => { socket.emit("getFinishScores" , player.num_room); }, 1000);

  }else{
    //Cambiamos la puerta en la que vamos a entrar
    $("#puerta_" + next).attr('src', '/assets/images/libro_abierto.png');
    $("#puerta_" + next).addClass("abierta");
    $("#puerta_" + next).removeClass("cerrada");
    $("#texto_puerta_" + next).removeClass("hidden");

    if(next=="cuatro"){
      $("#btn_modal_recursos").removeClass("hidden");
      socket.emit("get_resource" , player.num_room);
    }
  }
};



//Generamos boton resumen 
socket.on("showResourceButton",showResourceButton);

function showResourceButton(dataResource){
  console.log("En la funcion que recursos onbtengo");
  console.log(dataResource);
  console.log(dataResource.landscape);
  var gender = dataResource.gender;
  var plots = dataResource.plots;

  var cadena = '';
  
  var cadena_landscape = "<img id='img_landscape' src=assets/images/landscape/"+dataResource.landscape+" >";

  console.log("Contenido añadido sin problema");
  $("#contenido_resource_modal").find("#resource_landscape").html(cadena_landscape);

  var cadena_genre = "<div class='div-resource-genre'><p id=nombre_genero>" + gender + "</p></div>";

  cadena_genre += "<div id=bloque_tramas>"
  for (var i = 0; i < 3; i++) {
    cadena_genre += '<div class=tramas><p>' + plots[i] + '</p> <button type=button onclick=getDescription(' + i + ')>Explicación</button>' + '</div>';
  }
  cadena_genre += "</div><p class='hidden' id='descripcion'></p>";
  $("#contenido_resource_modal").find("#resource_genre_plots").html(cadena_genre);
  
  var cadena_characters='';
  var characters = dataResource.characters;
  var personalities = dataResource.personalities;
  var tam = characters.length;
  for(var  j = 0 ; j<2;j++){
    var i = 0
    cadena_characters += "<p class='flex-element'>";
    while (i < tam) {
      if(j == 0 )
        cadena_characters += "<img class='zoom cartas_e_uno cartas_resource' src=assets/images/cartas/" + characters[i].toLowerCase() + " > ";
      else
        cadena_characters += "<img class='zoom cartas_e_uno cartas_resource' src=assets/images/cartas/" + personalities[i].toLowerCase() + " > ";
      
      i++;
    }
    cadena_characters += "</p>";
  }
  

  $("#contenido_resource_modal").find("#resource_characters").html(cadena_characters);
  
  
}


function activeResource(index){
  console.log("en active resource");
      
        console.log(index);
      
        tabs = ["tab0","tab1","tab2"];
        divsResource = ["resource_landscape" , "resource_genre_plots" , "resource_characters"];
    
        for(let tab of tabs){
          let id = "#"+tab
          $(id).removeClass("active");
        }
        $("#tab"+index).addClass("active");
      
        for(let div of divsResource){
          $("#contenido_resource_modal").find("#"+div).addClass("hidden");
        }
        $("#"+divsResource[index]).removeClass("hidden");
}

//Obtenemos genero y tramas
function getGender() {
  if(player.moderador){
    //Pedimos al servidor un género y 3 tramas
    socket.emit("getGender", player.num_room);
  }
 
}

socket.on("showGender", showGender);

var gender_selected = null;

function showGender(gender) {
  console.log("Entro en showGender");
  cadena = "<p>Género</p><p id=nombre_genero>" + gender + "</p>";
  $('#bloque_genero').append(cadena);
  $('#bloque_genero').removeClass('hidden');
  $('#b_genero').addClass("hidden");
  $('#b_trama').removeClass("hidden");
  gender_selected = gender;
}

function getPlots() {
  if(player.moderador){
    socket.emit("getPlots",player.num_room);
  }
  
}

socket.on("showPlots", showPlots);

var plots_selected = [];
var descripcion_selected = [];

function showPlots(plots, descriptions) {
  console.log("Entro en showPLots");
  plots_selected = plots;
  descripcion_selected = descriptions;

  cadena = "<div id=bloque_tramas>"
  for (var i = 0; i < 3; i++) {
    cadena += '<div class=tramas><p>' + plots[i] + '</p> <button type=button onclick=getDescription(' + i + ')>Explicación</button>' + '</div>';
  }
  cadena += "</div>"

  $("#bloque_trama").append(cadena);
  $("#bloque_trama").removeClass("hidden");
  $('#b_trama').addClass("hidden");
  $("#genero").append('<button class="boton_continuar" id="continuar" type=button onclick=showSelectedGender()> Continuar...</button>');

}

function getDescription(index) {
  if(player.moderador)
    socket.emit("getDescription", player.num_room, index);
}


socket.on("showDescription", showDescription);

function showDescription(description) {
  console.log($("#descripcion"));
  if ($("#descripcion").length > 0) {
    //recursos
    console.log("if")

    $("#descripcion").text(description);
    $("#descripcion").removeClass('hidden');
  }
  else {
    console.log("else")
    cadena = "<div id=descripcion>";
    cadena += '<p id=texto_descripcion>' + description + '</p>';
    cadena += "</div>";
    $("#bloque_trama").append(cadena);
  }

}

function showSelectedGender() {
  socket.emit("showSelectedGender",player.num_room, showSelectedGender);

}

socket.on("showSelectedGender", function () {
  returnBoard();
  console.log(gender_selected);
  console.log(plots_selected);
  cadena = "<p id=titulo_recorrido>GÉNEROS Y TRAMAS</p>";
  cadena += "<p>Genero => " + gender_selected + "</p>";
  cadena += "<p>Tramas => </p>";


  var i = 0;
  for (var i = 0; i < plots_selected.length; i++) {
    cadena += "<p><abbr title='" + descripcion_selected[i] + "' >" + plots_selected[i] + "</abbr></p>";
  }

  $("#bloque_recorrido").append(cadena);

  socket.emit("close_door",  player.num_room , 1, 2);

});
//Cuando clicamos el boton aparecen las cartas personaje
function getCharactersCard() {
  if(player.moderador)
    socket.emit("getCharactersCard", player.num_room);
}

socket.on("showCharactersCard", showCharactersCard)

//Mostramos las cartas personaje
function showCharactersCard(array_personajes) {

  $('#bloque_boton_personajes').addClass('hidden');
  $('#bloque_personajes').removeClass('hidden');

  console.log("Array que recibo -> " + array_personajes)
  $('#carta_uno').attr('src', 'assets/images/cartas/' + array_personajes[0].toLowerCase());
  $('#carta_dos').attr('src', 'assets/images/cartas/' + array_personajes[1].toLowerCase());
  $('#carta_tres').attr('src', 'assets/images/cartas/' + array_personajes[2].toLowerCase());

}


let canFlip = true;
//Giramos una carta y queda seleccionada
function flipCard(id_card, num_card) {
  if(player.moderador && canFlip){
    console.log("Girar carta -> " + num_card);
    socket.emit("flipCard",  player.num_room,id_card, num_card);
  }
}

socket.on("showFlipCard", showFlipCard);

function showFlipCard(id_card, allCardSelected) {
  canFlip = false;
  $('#' + id_card).css("transform", "rotateY(180deg)");
  setTimeout(() => { $('#' + id_card).css("transform", ""); }, 750);
  
  if (!allCardSelected) {
    setTimeout(() => { socket.emit("getCharactersCard", player.num_room);canFlip=true; }, 800);
  }
  else {
    setTimeout(() => { socket.emit("getAllCharacterSelected", player.num_room); }, 800);
  }
}

socket.on("showCharacterSelected", showCharacterSelected);

function showCharacterSelected(array_character) {
  //MOSTRAMOS CARACTERISTICAS
  $("#bloque_personajes").addClass('hidden');
  $('#bloque_boton_caracter').removeClass('hidden');

}

function getPersonalityCard() {
  if(player.moderador){
    console.log("Captamos cartas de personalidad");
    socket.emit('getPersonalityCard', player.num_room);
  }

}


socket.on("showPersonalityCard", showPersonalityCard);

function showPersonalityCard(array_character) {
  $('#bloque_boton_caracter').addClass('hidden');
  $('#bloque_caracter').removeClass('hidden');

  console.log("Array que recibo -> " + array_character)
  $('#caracter_uno').attr('src', 'assets/images/cartas/' + array_character[0].toLowerCase());
  $('#caracter_dos').attr('src', 'assets/images/cartas/' + array_character[1].toLowerCase());
  $('#caracter_tres').attr('src', 'assets/images/cartas/' + array_character[2].toLowerCase());
}


function selectPersonalityCard(num_card) {
  //Seleccionamos una carta
  if(player.moderador){
    socket.emit("selectPersonalityCard",  player.num_room,num_card)
  }

}

socket.on("changePersonalityCard", changePersonalityCard)

let vualta = false;
function changePersonalityCard(allCardSelected) {

  if (!this.vuelta) {
    $('.carta').css("transform", "rotateX(360deg)");
    this.vuelta = true;
  }
  else {
    $('.carta').css("transform", "");
    this.vuelta = false;
  }
  $('.carta').css("transition", "all 500ms");

  if (allCardSelected) {
    //Fin etapa
    setTimeout(() => { $('#bloque_caracter').addClass("hidden"); }, 1500);
    setTimeout(() => { returnBoard();  socket.emit("close_door", player.num_room, 2, 3);}, 100);
    $("#btn_modal_recursos").removeClass('hide');
  }
  else {
    socket.emit('getPersonalityCard', player.num_room);
  }
}

function getDataStage(index_etapa) {
  /* PEDIDO AL SERVIDOR LOS RECURSOS DE LA ETAPA */
  socket.emit("getDataStage",  player.num_room,index_etapa);
}

var array_character = [];
var array_personalities = [];

//showDataStage
socket.on("showDataStageOne", showDataStageOne);

function showDataStageOne(landscape_card, characters, personalities) {
  $("#boton_cerrar").click();
  array_character = characters;
  array_personalities = personalities;

  console.log("Llego a showDataStageOne   " + characters);
  var cadena_paisaje = "<img id=carta_paisaje src=assets/images/landscape/" + landscape_card + " >"
  cadena_paisaje += "<button class=boton_continuar id=continuartype=button onclick='getMisionStage(1)'><i class='fas fa-arrow-right'></i> Continuar</button>";
  $("#paisaje").append(cadena_paisaje);

  var i = 0;
  var tam = characters.length;
  var cadena = "";
  while (i < tam) {
    cadena += "<p>";
    cadena += "<img class='zoom cartas_e_uno' src=assets/images/cartas/" + characters[i].toLowerCase() + " > "
    cadena += " => ";
    cadena += "<img class='zoom cartas_e_uno' src=assets/images/cartas/" + personalities[i].toLowerCase() + " > ";
    cadena += "</p> "
    i++;
  }
  $("#personaje").append(cadena);
  console.log("Imagenes añadida" + cadena);
}



//Repeat stage
function repeatStage(){
  socket.emit("getDataMisionStage",  player.num_room ,2);
}
//Show mision 
function getMisionStage(index_mision) {
  //Solicitamos al servidor que lo muestra
  socket.emit("getMisionStage",  player.num_room , index_mision);
}

socket.on("showMisionStage", showMisionStage);

function showMisionStage(index_mision) {
  console.log("ShowMisionStage -> " + index_mision);
  $("#btn_mision").click();
  switch (index_mision) {
    case 1:
      $("#paisaje").addClass("hidden");
      $("#personaje").addClass("hidden");
      break;
    case 2:
      $("#trama").addClass("hidden");
      $("#personaje").addClass("hidden");
      break;
    case 3:
      $("#lugar").addClass("hidden");
      $("#trama").addClass("hidden");
      break;
    default:
      console.log("Creo que ha habido un error");
      break;

  }
}


//Show mision 
function getDataMisionStage(index_mision) {
  //Solicitamos al servidor que lo muestra
  console.log("GetdatamisionStage");
  socket.emit("getDataMisionStage", player.num_room ,  index_mision);
}

socket.on("showDataMisionStageOne", showDataMisionStageOne);

function showDataMisionStageOne(index_mision, array_icons) {
  parado=true;
  totalTime=60;
  console.log("showDataMisionStage");
  $("#boton_cerrarMision").click();

  $("#trama").removeClass("hidden");
  $("#objeto").removeClass("hidden");

  /*Cadena trama*/
  var cadena_trama = "<h2 id='titulo_trama'>" + plots_selected[0] + "</h2>";
  cadena_trama += "<p id='descr_trama'>" + descripcion_selected[0] + "</p>"

  document.getElementById("trama-mision").innerHTML = cadena_trama;
  $("#crono-mision").removeClass("hidden");

  var cadena_icons = "";
  for (var j = 0; j < numTeams; j++) {
    cadena_icons += "<div class=objetos><h3>Equipo " + (j + 1) + "</h3>";
    cadena_icons += "<img class=iconos src=assets/images/objects/" + array_icons[j] + " />";
    cadena_icons += "<img class=iconos src=assets/images/objects/" + array_icons[j + numTeams] + " />";
    cadena_icons += "</div>";
  }

  cadena_icons += "<button id=finEtapa class=boton_continuar type=button onclick=vote(3,4)> Cerrar Etapa...</button>";

  console.log(cadena_icons);
  $("#objeto").append(cadena_icons);

  console.log(array_icons);


}


//DataStage 2

socket.on("showDataStageTwo", showDataStageTwo);

function showDataStageTwo() {
  
  $("#boton_cerrar").click();
  characters = array_character;
  personalities = array_personalities;

  var i = 0;
  var tam = characters.length;
  var cadena = "";
  while (i < tam) {
    cadena += "<p>";
    cadena += "<img class='zoom cartas_e_uno' src=assets/images/cartas/" + characters[i].toLowerCase() + " > "
    cadena += " => ";
    cadena += "<img class='zoom cartas_e_uno' src=assets/images/cartas/" + personalities[i].toLowerCase() + " > ";
    cadena += "</p> "
    i++;
  }
  $("#personaje").append(cadena);
  console.log("Imagenes añadida" + cadena);


  console.log("Llego a showDataStageTwo");


  var cadena_trama = "<h2 id='titulo_trama'>" + plots_selected[1] + "</h2>";
  cadena_trama +=  "<p id='descr_trama'>" + descripcion_selected[1] + "</p>";
  //var cadena_button = "<button class=boton_continuar type=button onclick='getMisionStage(2)'><i class='fas fa-arrow-right'></i>Continuar</button>";

  document.getElementById("trama-mision").innerHTML = cadena_trama;
  //$("#trama").append(cadena_button);
  $("#button_continuar").removeClass("hidden");
}


socket.on("showDataMisionStageTwo",showDataMisionStageTwo);
function showDataMisionStageTwo(characters , personalities , evento) {
  parado=true;
  totalTime=60;
  console.log("showDataMisionStage");
  $("#boton_cerrarMision").click();

  $("#personajes").removeClass("hidden");
  $("#evento").removeClass("hidden");

  console.log("Characters => " + characters);
  console.log("Personalities=> " + personalities);
  console.log("Evento  => " + evento);
  var i = 0;
  var tam = characters.length;
  var cadena = "";
  while (i < tam) {
    cadena += "<div class='flex-element'><div class='icono_c'> <img class=iconos src='assets/images/personajes/" + characters[i].toLowerCase() + ".png' /></div>"
    cadena += "<div class='recuadro_c'><h3>Equipo " + (i+1) + "</h3><p> Debeis introducir al personaje ";
    cadena += characters[i];
    cadena += "  ";
    cadena += personalities[i];
    cadena += "</p> </div></div>"
    i++;
  }
  document.getElementById("interpretar").innerHTML = cadena;
  $("#crono-mision").removeClass("hidden");


  var cadena = "<h2>EL PERSONAJE ESTABA INMERSO EN UN/UNA</h2><p>" + evento + "</p>";

  cadena += '<div class="flex-element"><button id="repetirEtapa" class="hidden boton_continuar" type="button" onclick=repeatStage()>Repetir Etapa</button>';
  cadena += '<button id="finEtapa" class="hidden boton_continuar" type="button" onclick=vote(4,5)>Cerrar Etapa</button></div>';

  document.getElementById("evento").innerHTML = cadena;
  $("#finEtapa").removeClass("hidden");
  $("#repetirEtapa").removeClass("hidden");
}



//Data stage 3
socket.on("showDataStageThree", showDataStageThree);
function showDataStageThree(places_adjective) {
  $("#boton_cerrar").click();

  var i = 0;
  var tam = places_adjective.length;
  var cadena = "";
  while (i < tam) {
    cadena += "<div class='div-adj col-12'> <p class='adj col-4'>"+places_adjective[i].toUpperCase()+"</p>";
    if(i!=2){
      cadena+="<i class='col-12 icono-mas fa fa-plus'></i>"
    }
    cadena +=" </div>";
    i++;
  }
  $("#lugar").append(cadena);

  var cadena_trama = "<h2 id='titulo_trama'>" + plots_selected[2] + "</h2>";
  cadena_trama += "<p id='descr_trama'>" + descripcion_selected[2] + "</p>"
  //var cadena_button = "<button class=boton_continuar type=button onclick='getMisionStage(3)'><i class='fas fa-arrow-right'></i>Continuar</button>";
 
  document.getElementById("trama-mision").innerHTML = cadena_trama;
  //$("#trama").append(cadena_button);
  $("#button_continuar").removeClass("hidden");
}

socket.on("showDataMisionStageThree",showDataMisionStageThree);
function showDataMisionStageThree(sentences , landscape ) {
  parado=true;
  totalTime=60;
  $("#boton_cerrarMision").click();
  $("#paisaje").removeClass("hidden");
  $("#frases").removeClass("hidden");
  $("#crono-mision").removeClass("hidden");

  var i = 0;
  var tam = sentences.length;
  var cadena = "";
  while (i < tam) {
    cadena += "<h3>Equipo "+(i+1) +"</h3><div class='col-12 frase-final'><p class='col-6'>";
    cadena += sentences[i] + "</p></div>";
    i++;
  }
  document.getElementById("frases-mision").innerHTML = cadena;
  

  var cadena_paisaje = "<img id=carta_paisaje src=assets/images/landscape/" + landscape + " >";
  cadena_paisaje += '<button id="finEtapa" class="hidden boton_continuar" type="button" onclick=vote(5,6)> Cerrar Etapa...</button>';
  $("#paisaje").append(cadena_paisaje)
  $("#finEtapa").removeClass("hidden");

}



function vote(index,next){
  console.log("En VOTE "+index+" next "+next);
  socket.emit("vote", player.num_room,index,next);
}

socket.on("showVoteView",showVoteView);

function showVoteView(index,next,num_teams){
  numTeams = num_teams;
  $("#bloque_central").innerHTML = "";
  $("#bloque_central").load("./score.html");

  setTimeout(() => {  
    console.log(player.name);
    console.log(player.moderador);
    var cadena = "";
    if (player.moderador) {
      console.log("Soy moderador");
      puntuaciones = "";
     
      cadena="<div id=bloque_puntos><h3>Puntuaciones</h3>"
      var j = 1;
      while (j < (num_teams + 1)) {
        cadena += "<h3>Equipo " + j + "</h2>";
        var i = 1;
        var h = 0;
        var puntuaciones = "";
        cadena += "<select id='puntos"+j+"' name='puntos"+j+"' multiple>";
        while (i < 6) {
          puntuaciones += "<option id='puntuacion" + j + "-" + h + "'  name='puntos"+j+"' value='" + i + "' >"+i+"</option>";
          //puntuaciones += "<label for='puntucion" + i + "' >" + i + "</label>";
          h += 1;
          i += 1;
        }
        cadena +=puntuaciones;
        cadena += "</select>";
        j += 1;
      }
      cadena += "<button id=enviar_puntos class=boton_continuar type=button onclick=sendScores("+index+","+next+")>Enviar puntuaciones</button></div>";
    }
    else {
      console.log("no lo es");
      
      cadena ="<div id=bloque_puntos><p>ESPERAD MIENTRAS NUESTRO MODERADOR VOTA SOBRE COMO SE HA DESARROLLADO LA ETAPA " + index + "</p>";
      cadena += '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div></div>';
    }

    $("#puntuaciones").append(cadena);
  }, 1000);
}


function sendScores(index,next){
  //Obtenemos valores en ambos input y comprobamos que son estan ambos marcados
  var tam =numTeams+1;
  console.log("Tamaño => " + tam);

  var array_puntos = [];
  for(var i = 1 ; i < tam ; i++){
    var select = document.getElementById("puntos"+i);
    console.log(select);
    var selected = select.options[select.selectedIndex].text;
    console.log(selected);
    array_puntos.push(selected);
  }

  console.log(array_puntos);
  console.log(index);
  console.log(next);
  console.log("ARRAY CON LOS PUNTOS-> ");
  console.log(array_puntos);
  socket.emit("savePoints", player.num_room,array_puntos,index,next);
  
}


socket.on("showFinishScores",showFinishScores);

function showFinishScores(array_puntos){
  console.log(array_puntos);
  console.log("Show finish scores");
  var max = -1;
  var ganador = -2;
  cadena="<div id=fin_partida>";
  for(var i = 0 ; i < array_puntos.length ; i++){
    cadena += "<p>EL EQUIPO  "+(i+1)+" HA CONSEGUIDO UN TOTAL DE "+array_puntos[i]+" PUNTOS</p>";
    if(array_puntos[i] > max){
      max = array_puntos[i];
      ganador = "EQUIPO "+(i+1);
    }
  }
  cadena+= "<p>POR LO TANTO EL GANADOR ES EL...<p>";
  cadena+="<p><img id='img-copa-ganador' src=/assets/images/copa.png /> <h2>"+ganador+"</h2></p>";


  $("#contenido_btn_modal").append(cadena);
  $("#btn_modal_final").click();
}



function selectPlayer(namePlayer){
  /*
    Enviamos un mensaje al servidor 
    para avisar que seleccionamos al jugador.
  */
  if(player.moderador){
    //Comprobamos si le jugador habia solicitado hablar
    if(!$("#turn_message").hasClass("hidden")){
      //Comprobamo el nombre
      if($("#player_ask").text().toUpperCase() == namePlayer.toUpperCase()){
        //Vaciamos el texto y escondemos el turno 
        $("#player_ask").html='';
        $("#turn_message").addClass('hidden');
      }
    }
    //Solo el moderador tiene permitido esta funcionalidad.
    socket.emit("selectPlayer", namePlayer , player.num_room)
  }
  
}

//Función para eliminar todas las marcas del jugador que está hablando
function deleteAllImagesSpeaker(players){
  console.log("Eliminando imagenes");
  for(let p of players){
    console.log(p);
    id_h = "#turno_"+p.name;
    if(!$(id_h).hasClass('hidden')){
      console.log("Añadimos clase hidden a "+ p.name)
      $(id_h).addClass("hidden");
    }
  }
}
socket.on("showSelectedPlayer",showSelectedPlayer);

function showSelectedPlayer(namePlayer,players){

  deleteAllImagesSpeaker(players);

  //Una vez quitados todos los iconos, añadimos el icoino al jugador correspondiente
  id = "#turno_"+namePlayer;
  if($(id).hasClass('hidden'))
    $(id).removeClass("hidden");

  let mensaje = '';
  if(player.name == namePlayer){
    //Comprobamos que no estaba hablando, si estaba hablando no hace falta hacer nada
    mensaje="Te toca hablar  "+player.name;
    api.isAudioMuted().then(muted=>{
      console.log(muted);
      if(muted){
        api.executeCommand('toggleAudio');
      }
    });
  }
  else{
    mensaje ="Le toca hablar a "+namePlayer;
    //Comprobamos si el jugador está muteado
    if(!player.moderador){
      api.isAudioMuted().then(muted=>{
        console.log(muted);
        if(!muted){
          api.executeCommand('toggleAudio');
        }
      });
    }
  }

  $("#jugador_cont_modal").html('<p> '+mensaje+"</p>");
  $("#btn_modal_jugadores").click();

}



function generateVideoCall(){

  
  const domain = "meet.jit.si";
 
  console.log("Generando videollamada con numero room : " + 'la-casa-de-los-cuentos-sala'+player.num_room);
  
  const options = {
      roomName: 'la-casa-de-los-cuentos-sala'+player.num_room,
      width: 220,
      height: 450,
      parentNode: document.querySelector('#camaras'),
      configOverwrite: { startWithAudioMuted: false,  prejoinPageEnabled: false},
      userInfo:{
        displayName: player.name
      },
      interfaceConfigOverwrite: { 
        DEFAULT_LOCAL_DISPLAY_NAME: 'Es', //ok
        SHOW_CHROME_EXTENSION_BANNER: false, //ok
        TOOLBAR_ALWAYS_VISIBLE: true, // ok
        SETTINGS_SECTIONS: ['devices', 'language'], //ok,
        TOOLBAR_BUTTONS: [
          //Con esto indicamos los botones (micro, video,etc)
          //Al dejarlo vacío eliminamos todos.
        ] 
      },
  };

  api = new JitsiMeetExternalAPI(domain, options);

  if(player.moderador){
    if($("#control-camaras").hasClass("hidden"))
      $("#control-camaras").removeClass("hidden");
  }else{
    console.log("Enseñamos boton askTurn");
    if($("#control-camaras-jug").hasClass('hidden')){
      $("#control-camaras-jug").removeClass('hidden');
    }
  }
}



function silentRoom() {
  //Solo podrá silenciar la sala el moderador.
  if (player.moderador) {
    console.log("Muteamos a todo el mundo, yo soy moderador")
    api.executeCommand('muteEveryone', 'audio');
  } else {
    console.log("Componente sin permiso para silenciar la sala.");
  }

  socket.emit("silentRoom",  player.num_room);
}

  


socket.on('silentPlayers' , silentPlayers);

function silentPlayers(players){
  console.log("Players -> ");
  console.log(players);
  deleteAllImagesSpeaker(players);
}
  


function createRoomToTeam(){
  socket.emit('createRoomToTeam',player.num_room);
}

socket.on('createRoomTeams' , createRoomTeams)
function createRoomTeams(){
  
  console.log(player);
  const domain = "meet.jit.si";
  $('#camaras').empty();
  //sala num_room+"equipos"+num_equipos
  console.log("Generando videollamada con numero room : " + 'la-casa-de-los-cuentos-sala'+player.num_room+"-equipo-"+player.num_team);
  
  const options = {
      roomName: 'la-casa-de-los-cuentos-sala'+player.num_room+"-equipo-"+player.num_team,
      width: 220,
      height: 450,
      parentNode: document.querySelector('#camaras'),
      configOverwrite: { startWithAudioMuted: false,  prejoinPageEnabled: false},
      userInfo:{
        displayName: player.name
      },
      interfaceConfigOverwrite: { 
        DEFAULT_LOCAL_DISPLAY_NAME: 'Es', // Español
        SHOW_CHROME_EXTENSION_BANNER: false, //Eliminar el banner de la extensión de chrome
        TOOLBAR_ALWAYS_VISIBLE: true, // ok
        SETTINGS_SECTIONS: ['devices', 'language'], //ok,
        TOOLBAR_BUTTONS: [
          //'microphone'
        ] // Al ponerlo vacio eliminamos todos los que haya.
      },

  };
  console.log("ESTOY EN LA FUNCIÓN ");
  //Escondemos los botones que no hagan falta
  if(player.moderador){
    $("#messages").removeClass('hidden');
    $("#room_team").addClass("hidden");
    $("#silent_room").addClass('hidden');
    $("#return_room").removeClass("hidden");
    
  }else{
   
    api = new JitsiMeetExternalAPI(domain, options);
  }
}




function returnRoom(){
  //Hacemos return a la room de todos
  $("#return_room").addClass("hidden");
  $("#room_team").removeClass("hidden");
  socket.emit("returnVideoCall" , player.num_room);
}

socket.on("returnCall",returnCall);

function returnCall(){
  $("#camaras").empty();
  $("#messages").addClass('hidden');
  $("#moderator_message").addClass('hidden');
  $("#last_message").html = '';

  $("#silent_room").removeClass('hidden');
  generateVideoCall()
}



//Enviar mensaje a los jugadores mientras están en la sala de equipos
function sendMessage(){
  
  var message = document.getElementById('message_text').value;
  if(message.trim() != ''){
    $("#message_text").val('');
    socket.emit("sendMessage",player.num_room,message);
  }
  
}


socket.on('showMessage',showMessage);

function showMessage(messages){
  if(player.moderador){
    var cadena ='';
    //Lo mostramos en el panel
    for(let i = messages.length ; i > 0 ;i--){
      cadena+= "<p>"+player.name+": "+messages[i-1]+"</p>";
    }
    document.getElementById("show-message-chat").innerHTML = cadena;

  }
  else{
    $("#moderator_message").removeClass('hidden');
    let cadena = "<p>"+messages[messages.length-1]+"</p>";

    $("#last_message").html(cadena);
  }
}


//FUNCIONES QUE CONTROLAN EL CRONOMETRO


let totalTime = 60;
let parado = false;

function startCrono(){
  //Solo cel moderador
  if(player.moderador){
    if($('#button_start').hasClass('started')){
      socket.emit("stopCrono",player.num_room);
    }else{
      socket.emit("startCrono",player.num_room); 
    }
  }
}

socket.on("addClassStarted",addClassStarted);

function addClassStarted(){
  $('#button_start').addClass('started');
  $('#button_start').removeClass('paused');
  parado=false;
  playPause();
}


socket.on("addClassPaused",addClassPaused);

function addClassPaused(){
  $('#button_start').removeClass('started');
  $('#button_start').addClass('paused');
  parado=true;
}

function playPause(){

  //Controlamos si está activo, si lo está lo paramos.

  if(!parado){
    console.log(" El crono está parado lo iniciamos-> ")
    $('#button_start').addClass('started');
    $('#button_start').removeClass('paused');
    if(totalTime < 10){
      document.getElementById('reloj').innerHTML = "00:0" + totalTime;
    }else{
      document.getElementById('reloj').innerHTML  = "00:" + totalTime;
    }
    
    if(totalTime!=0){
      setTimeout('playPause()',1000);
    }
    else{
      console.log("FIN DEL CRONO");
      document.getElementById('reloj').innerHTML = "00:00";
      parado=true;
    }   
    totalTime -=1; 
  }
}


function restartCrono(){
  //Solo cuando el moderador sea 
  if(player.moderador){
    socket.emit("restartCrono",player.num_room); 
  }
}


socket.on("stop",stop);

function stop(){
  document.getElementById('reloj').innerHTML = "01:00";
  totalTime = 60;
  parado=true;

  if($('#button_start').hasClass('started')){
    $('#button_start').removeClass('started');
    $('#button_start').addClass('paused');
  }

  
}




//Pedir el turno de palabra - Mejora 2 
function askTurn(){
  console.log("En la funcion ask turn ");
  //PETICIÓN AL SERVIDOR PARA QUE COMUNIQUE AL MODERADOR
  socket.emit("askTurn",player.num_room,player.name);
}

socket.on("message_ask_turn",message_ask_turn);

function message_ask_turn(player_name){
  //Solo se envía el mensaje para el moderdor
  if(player.moderador){
    //Mostrar la casilla mensaje.
    $("#turn_message").removeClass("hidden");
    $("#player_ask").html("<p>"+player_name.toUpperCase()+"</p>");
  }
    

}
