//Importamos express para poder utilizarlo.
var express = require("express");
//Creamos una aplicación express
var app = express();
//creamos el servidor, para ello es necesaria la libreria http y le pasamos la aplicacion express que estamos creando.
var server = require("http").Server(app);

//Ponemos al servidor a escuchar por un puerto, y tendremos el mensaje para cuando el servidor esté activo.
server.listen(process.env.PORT || 
  3030, function () {
  console.log("Servidor corriendo en el puerto 3030");
});

//Incluimos las carpetas con nuestros ficheros.
app.use(express.static("public"));
app.use(express.static("views"));


//Para generar la comunicación trabajo con socket io
var io = require("socket.io")(server);


// Incluimos el fichero con las operaciones de la base de datos
var db = require("./db");
// Conectamos la base de datos.
//db.connect();
db.connect();

const { isBoolean } = require("util");
const NUM_MAX_PLAYER = 6;
const NUM_MIN_PLAYER = 2;

var isAllPlayer = false;



//BOOTSTRAP 
app.use('/css', express.static('node_modules/bootstrap/dist/css'))
app.use('/js', express.static('node_modules/bootstrap/dist/js'))
app.use('/js', express.static('node_modules/jquery/dist'))

/**
 * Importamos la clase room y creamos una instancia de la sala
 */
const Room = require("./room");
const Player = require("./player")

var rooms = [];
var array_index_door = ["uno" , "dos" , "tres" , "cuatro","cinco","seis","fin"];

var nombre_fichero = "";

/* Almacenar la imagen */
const multer = require('multer');
const mimeTypes = require('mime-types');

const storage = multer.diskStorage({
  destination: 'public/assets/images_player/',
  filename:function(req,file,cb){
      nombre_fichero  = Date.now() + file.originalname;
      cb("",nombre_fichero);
  }
});

const upload = multer({
  storage:storage
});

//Guardar imagenes 
app.post("/save_player" , upload.single('avatar') , (req,res)=>{
  let nombre_fichero = '';

  if(req.file != undefined){
    nombre_fichero = req.file.filename;
  }

  var isModerador =  req.body.moderador!=undefined ? true : false;

  res.json({code: 200, namefile:nombre_fichero,isModerador:isModerador});
});


var id_teams = [];
var array_card;



//socket escuchando conexiones
io.on("connection", function (socket) {
  //console.log("Un cliente se ha conectado");
  //Mostramos al jugador la pantalla inicial

  function get_room(num_room,rooms){
    
    var r = null;
    console.log("busco  " + num_room);
    var r = rooms.find(x => x.num_room == num_room);
    return r;
  }

  socket.on("create_room",async function(data){

    //Consultamos si existe una sala con ese nombre
    if(await db.existsRoom(data.name_room)){
      socket.emit("show_error","Ya existe una sala con ese nombre");
    }
    else{
      var r;
      //Creamos la sala
      r = new Room();
      
      //No puede haber dos jugadores con el mismo nombre.
      if(r.isNameUsed(data.name_player)){
        socket.emit("show_error","Error ese nombre de jugador ya esta usado");
      }else{
        if(data.isModerator){
          r.addModerador(data.name_player);
        }else{
          r.addPlayer(data.name_player,data.file);
        }
      }
    
      var num_room = await db.saveSession(1,data.name_room,data.password_room);
      r.num_room = num_room;

      console.log("Creada la sala -> " + num_room);

      socket.join(num_room);
      socket.username = data.name_player;
      socket.isInRoom = true;

      rooms.push(r);
      socket.emit('redirect','/start_game.html',num_room,data);
    };  
  });


  socket.on("join_room",async function(data){

    //Comprobamos primero que exista la sala a la que se quieren unir
    if(await db.existsRoom(data.name_room)){
      //Para unirnos a la sala la contraseña deberá ser correcta.
      var num_room = await db.joinRoom(data.name_room , data.password_room);
      var r = null;
    
      r = get_room(num_room,rooms);
      //Comprobamos que exista la sala y que no haya empezado el juego
      if(r != null && !r.isAllPlayer){
        if(r.isNameUsed(data.name_player)){
          socket.emit("show_error","Error ese nombre ya lo ha utilizado otro jugador");
        }
        else{
          if(data.isModerator){
            if(r.addModerador(data.name_player)){
              console.log("Añadido el moderador");
            }else{
              socket.emit("show_error","Error ya existe un moderador en esta sala");
              return;
            }
          }else{
            r.addPlayer(data.name_player,data.file);
          }
        }

        socket.join(num_room);
        socket.username = data.name_player;
        socket.isInRoom = true;
  
        socket.emit('redirect','/start_game.html',num_room,data);

        /*Redireccionamos y enviamos los jugadores actuales a todos los clientes 
        ver que jugadores hay actualmente en la sala*/
        setTimeout(() => { io.in(num_room).emit('showPlayer',r.players) }, 1000);
        //io.in(num_room).emit('showPlayer',r.players);
      }
      else{
        socket.emit("show_error","Error al intentar unirse a esta sala.");
      }
     
    }else{
      socket.emit("show_error","Error con el nombre de la sala o con la contraseña.");
    }
  });

   //Ya no pueden jugar más jugadores
   socket.on("startGame", async function (num_room) {
    
    console.log("Los jugadores de la habitación " +num_room+" quieren comenzar");
    //Comprobamos que está el moderador si no no se puede comenzar el juego
    var r = get_room(num_room,rooms);

    if(r.thereIsModerador){
      if(r.num_players >= NUM_MIN_PLAYER){
        r.isAllPlayer = true;
        console.log("Nombre del moderador "+r.nameModerador);
        console.log("El resto de jugadores -> " );
        console.log(r.players);
        //Creamos los equipos
        r.saveTeams();
       
        console.log("Sala  " + num_room+ " comienza el juego")
        console.log("Almacenando datos en bd...");
        console.log("Almacenando moderador...");
        console.log("Almacenando equipos y jugadores...")
        console.log("Almacenamos los equipos");

        await db.saveModerator(num_room,r.nameModerador);
        r.id_teams = await db.saveTeams(num_room, r.array_teams);

        io.in(num_room).emit('showBoard',r.nameModerador);
        //io.to(num_room).emit("showBoard" , r.nameModerador);
      }
      else{
        io.in(num_room).emit('showErrorJugadores');
      }

    }
    else{
      io.to(num_room).emit("showErrorModerador");
    }
    
  });

  socket.on("getTeams",function(num_room){
    var r = get_room(num_room,rooms);
    if(r !== undefined){
      console.log("Equipos de esta room -> ");
      console.log(r.array_teams);
      console.log("Enviamos los equipos");
      socket.to(num_room).emit('showTeams' , r.array_teams);
    }else{
      socket.to(num_room).emit('showTeams' , null);
    }

   

  });

  //Obtenemos url de la puerta. Controlamos porque etapa vamos, para evitar llamadas de peurtas cerradas
  
  socket.on("getDoor", async function(num_room,index){

    r = get_room(num_room,rooms);

    console.log("Get etapa actual");
    var etapa_actual = await db.getStage(num_room);

    if(parseInt(etapa_actual) == (index-1)){
      //Actualizamos la fase en la que nos encontramos
      await db.updateStage(num_room  , index);

      var url = r.get_url_door(index);

      io.to(num_room).emit("showContentDoor", url);
    }
    else{
      console.log("No es correcto");
    }
    
  });

  socket.on("repeatStage",async function(num_room){
    r = get_room(num_room,rooms);
    var etapa_actual = await db.getStage(num_room);
    console.log(etapa_actual);
    
    await db.updateStage(num_room  , etapa_actual-1);
  })

  //Esperamos la peticion para obtener cartas paisaje
  socket.on("get_landscapecard", async function (num_room) {
    //Captamos los paisajes disponibles de la tabla y los almacenamos 3 de ellos en la sala
    r = get_room(num_room,rooms);
   
    r.saveLandscapeCards(await db.getLandscape());

    io.to(num_room).emit("showLandscapeCard", r.landscapeCards);

  });

 

  socket.on("chooseLandscape", function (num_room,card) {
    r = get_room(num_room,rooms);
    console.log("Carta elegida por el jugador", card);
    r.chooseLandscape(card);
    io.to(num_room).emit("closeFirstDoor");
  });

  socket.on("close_door",function(num_room,index,next){
    console.log("Close door "+ index);
    io.to(num_room).emit("close_door",array_index_door[index],array_index_door[next] );
  });

  socket.on("get_resource",function(num_room){
    //Carta paisaje
    let landscape_card = r.getLandscapeCard();
    let gender = r.getGender();
    let plots = r.getTitlePlots();
    let character = r.selected_characters;
    let personalities = r.selected_personalities;

    let data_resource = {
      landscape : landscape_card,
      gender : gender,
      plots : plots,
      characters : character,
      personalities : personalities
    }
    console.log("Enviamos los recursos: ");
    console.log(data_resource);
    io.to(num_room).emit('showResourceButton' , data_resource);
    

  });

  socket.on("getGender",async function(num_room){
    r = get_room(num_room,rooms);
    r.setGender(await db.getGenders());
 
    var genre = r.getGender();
    console.log("Género-> " + genre);
    io.to(num_room).emit("showGender",genre);
  })

  socket.on("getPlots",async function(num_room){
    r = get_room(num_room,rooms);
    console.log("Get Plots");
    var result = await db.getPlots();
    var plots = result.plots;
    var desc = result.descriptions;
    r.setPlots(plots,desc)

   
    io.to(num_room).emit("showPlots",r.getTitlePlots(),r.getDescripcionPlots());
  });

  socket.on("getDescription",function(num_room,index){
    r = get_room(num_room,rooms);
    io.to(num_room).emit("showDescription" , r.descriptions_plots[index]);
  })

  socket.on("showSelectedGender" , function(num_room){
    io.to(num_room).emit("showSelectedGender");

  })

  //Cartas personajes 
  socket.on("getCharactersCard" , async function(num_room){
    r = get_room(num_room,rooms);
    console.log("Get personajes");
    
    r.setCharacters(await db.getCharacters());
    //Generamos las 3 primeras cartas personaje.
    var array_personajes = r.getCharacters();
    io.to(num_room).emit("showCharactersCard" , array_personajes)
  })

  socket.on("flipCard",function(num_room ,id_card , num_card){

    r = get_room(num_room,rooms);
    //Bool para controlar en el cliente si todas las cartas personaje han sido seleccionadas.
    var allCardSelected = r.selectedCard(num_card,true);
    
    io.to(num_room).emit("showFlipCard",id_card,allCardSelected);
    
    
  });

  socket.on("getAllCharacterSelected",function(num_room){
    r = get_room(num_room,rooms);
    io.to(num_room).emit("showCharacterSelected" , r.selected_characters);
  })

  socket.on("getPersonalityCard" , async function(num_room){
    r = get_room(num_room,rooms);
    console.log("Get personalidades");
    r.setPersonalities(await db.getPersonalities());
    //Generamos las 3 primeras cartas personaje.
    var array_personalidades= r.getPersonalities();
    io.to(num_room).emit("showPersonalityCard" ,array_personalidades)
  });


  socket.on("selectPersonalityCard" ,function(num_room,num_card){
    r = get_room(num_room,rooms);
    var allCardSelected = r.selectedCard(num_card,false);
    io.to(num_room).emit("changePersonalityCard",allCardSelected);
  });

  socket.on("getDataCharacters" , function(num_room){
    r = get_room(num_room,rooms);
    var characters  = r.selected_characters;
    var personalities = r.selected_personalities;
    console.log(r.selected_characters);
    console.log(r.selected_personalities);
    io.to(num_room).emit("showDataCharacters" , characters , personalities);
  });
  

  /*ETAPA 1*/

  socket.on("getDataStage",function(num_room , index){
    r = get_room(num_room,rooms);
    switch(index){
      case 1:
        console.log("Data Stage 1")
        var landscapeCard = r._objectCardSelected;
        var characters  = r.selected_characters;
        var personalities = r.selected_personalities;

        io.to(num_room).emit("showDataStageOne" , landscapeCard , characters , personalities);
      break;
      case 2:
        console.log("Data Stage 2")
        io.to(num_room).emit("showDataStageTwo");
      break;
      case 3:
        var adjectives = r.getAdjectivesPlaces();
        console.log(adjectives);
        io.to(num_room).emit("showDataStageThree" , adjectives);

      break;

    }
    
  });

  //Mision 1
  socket.on("getMisionStage" , function(num_room , index){
    r = get_room(num_room,rooms);
    io.to(num_room).emit("showMisionStage",index);
  });

  socket.on("getDataMisionStage" , function(num_room , index){
    r = get_room(num_room,rooms);
    switch(index){
      case 1:
        //Mision 1 devolvemos los iconos.
        var file_icons = r.getIcons();
        io.to(num_room).emit("showDataMisionStageOne",index,file_icons);
      break;
      case 2:
        var array_c  = r.getSecondCharacters();
        var array_p = r.getSecondPersonalities();
        var event = r.getEvent();
        io.to(num_room).emit("showDataMisionStageTwo" ,array_c , array_p , event);
      break;

      case 3:
        var sentences = r.getSentences();
        var landscapeCard = r._objectCardSelected;
        console.log("Frases => " + sentences);
        console.log("Paisaje => " + landscapeCard);
        io.to(num_room).emit("showDataMisionStageThree" ,sentences,landscapeCard);
      break;
    }
    
  });


  socket.on("vote",function(num_room , index,next){
    r = get_room(num_room,rooms);
    io.to(num_room).emit("showVoteView",index,next,r.num_teams);
  });

  socket.on("savePoints" , async function(num_room , array_puntos,index,next){
    r = get_room(num_room,rooms);
    await db.savePoints(num_room , array_puntos,r.id_teams);
    var points = await db.getPoints(r.id_teams);
    console.log("Enviamos puntos ");
    console.log(points);
    io.to(num_room).emit("requestCloseDoor",array_index_door[index],array_index_door[next],points);
  });

  socket.on("getFinishScores" , async function(num_room){
    console.log("Captando puntuaciones finales.");
    r = get_room(num_room,rooms);
    var finally_points = await db.getPoints(r.id_teams);
    socket.emit("showFinishScores",finally_points);
  });

  socket.on("selectPlayer" ,  async function(name_player,num_room){
    console.log("Jugador seleccionado");
    r = get_room(num_room,rooms);
   
    console.log("Captando jugadores y jugador seleccionado.");
    console.log("Jugadores: ");
    console.log(r.players);
    console.log("Jugador seleccionado: ");
    console.log(name_player);

    io.to(num_room).emit("showSelectedPlayer" , name_player,r.players);
  });
 

  socket.on("silentRoom",function(num_room){
    r = get_room(num_room,rooms);
    io.to(num_room).emit("silentPlayers" , r.players);
  });


  socket.on('createRoomToTeam',function(num_room){
    io.to(num_room).emit("createRoomTeams");
  });

  socket.on('returnVideoCall',function(num_room){
    r = get_room(num_room,rooms);
    io.to(num_room).emit("returnCall", r.players);
  });

  socket.on("sendMessage",function(num_room , message){
    r = get_room(num_room,rooms);
    if(message.trim() != ''){
      r.addMessage(message);
      io.to(num_room).emit("showMessage",r.getMessages());
    }else{
      console.log("Mensaje vacio");
    }
    
  })


  //Funciones para controlar el crono.
  socket.on("startCrono",function(num_room) {
    io.to(num_room).emit("addClassStarted");
  });

  socket.on("stopCrono",function(num_room) {
    io.to(num_room).emit("addClassPaused");
  });

  socket.on("restartCrono",function(num_room) {
    io.to(num_room).emit("stop");
  });

  socket.on("askTurn",function(num_room,player_name){
    console.log("EL jugador "+player_name+ " quiere hablar");
    io.to(num_room).emit("message_ask_turn",player_name);
  });
  
});


