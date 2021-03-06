
//Base de datos
const rdb = require('rethinkdb');
var config = require("./config.json");

//Creamos la conexion

var connection = null;



const connect = function connect() {
  console.log("Iniciando conexión con base de datos");
  /*Para conectar con local*/
  rdb.connect(config.rethinkLocal).then(function(conn){
    connection = conn
  }).error(function(error){
    console.log("Error al conectar con la BD");
    console.log(error.message);
  })
   
}




const saveSession = async function saveSession(num_players, name, password) {
  console.log("Número de sesión");
  //Número de la sesión será el número de entradas en la tabla y este será el id de la fila.
  var num_sesion = await rdb.table('Sesion').count().run(connection);

  console.log(num_sesion);
  //Jugadores + moderador
  var nc = num_players + 1;
  const sesion = {
    id_sesion: num_sesion,
    num_componentes: nc,
    fecha_creacion: new Date(),
    etapa_actual: -1,
    nombre_sesion: name,
    password_sesion: password
  }

  await rdb.table('Sesion').insert(sesion).run(connection);

  console.log("Sesión insertada con éxito");

  return num_sesion;
}


const getStage = async function getStage(num_room) {
  console.log("Numero de sesion " + num_room)
  var stage = await rdb.table('Sesion').get(num_room).run(connection);
  console.log("Etapa actual => " + stage.etapa_actual);
  return stage.etapa_actual;
}

const updateStage = async function updateStage(num_room, index) {
  console.log("Actualizando etapa...");
  await rdb.table('Sesion').get(num_room).update({ etapa_actual: index }).run(connection);
}

const saveModerator = async function saveModerator(num_sesion, name_moderator) {
  id = await rdb.table('Jugadores').count().run(connection).then(total => { return total });
  const moderador = {
    id_jugador: id,
    id_equipo: -1,
    id_sesion: num_sesion,
    imagen: "",
    idModerador: true,
    nombre: name_moderator
  }
  await rdb.table('Jugadores').insert(moderador).run(connection).then(function () {
    console.log("Moderador insertado con éxito");
  });
}
const savePlayer = async function savePlayer(num_sesion, num_equipo, n_jug, n_image) {

  id_player = await rdb.table('Jugadores').count().run(connection).then(total => { return total });
  const jugador = {
    id_jugador: id_player,
    id_equipo: num_equipo,
    id_sesion: num_sesion,
    imagen: n_image,
    idModerador: false,
    nombre: n_jug
  }
  await rdb.table('Jugadores').insert(jugador).run(connection).then(function () {
    console.log("Jugador " + id_player + " insertado con éxito");
  });
  return id_player;
}

const saveTeams = async function saveTeams(num_sesion, array_teams) {
  //Número de equipos
  var n_teams = array_teams.length;
  var id_teams = [];
  for (var i = 0; i < n_teams; i++) {
    //El máximo de jugadores puede ser 3.
    var id_jugadores = [-1, -1, -1];

    //El id será el número de equipos que haya.
    num_equipo = await rdb.table('Equipo').count().run(connection);
    id_teams[i] = num_equipo;

    var nc = array_teams[i].length;
    var cadena_jug = "|";
    for (var j = 0; j < nc; j++) {
      id_jugadores[j] = await savePlayer(num_sesion, num_equipo, array_teams[i][j].name, array_teams[i][j].image);
      cadena_jug += " " + array_teams[i][j].name + " | ";
    }

    const equipo = {
      id_equipo: num_equipo,
      id_sesion: num_sesion,
      num_componentes: nc,
      nombre_componentes: cadena_jug,
      puntos: 0,
      id_jug1: id_jugadores[0],
      id_jug2: id_jugadores[1],
      id_jug3: id_jugadores[2]
    }

    await rdb.table('Equipo').insert(equipo).run(connection);
    console.log("Equipo insertado con éxito");
  }
  //Devolvemos un array con el id de los equipos
  return id_teams;
}

const getLandscape = async function getLandscape() {
  var ficheros = [];
  await rdb.table('Paisajes').run(connection).then(function (cursor, err) {
    console.log("Paisajes captados AHORA -> ");

    cursor.toArray(function (err, result) {
      if (err) throw err;
      console.log(result.length);
      for (let i = 0; i < result.length; i++) {
        ficheros.push(result[i].nombre_fich);
      }
      console.log(ficheros);
      console.log("Fin funcion");
    });

  });

  return ficheros;
}

const getGenders = async function getGenders() {
  var genders = [];
  await rdb.table('Generos').run(connection).then(function (cursor, err) {

    cursor.toArray(function (err, result) {
      if (err) throw err;
      console.log(result.length);
      for (let i = 0; i < result.length; i++) {
        genders.push(result[i].nombre);
      }
    });

  });
  return genders;
}

const getPlots = async function getPlots() {
  var plots = [];
  var descriptions = [];
  await rdb.table('Tramas').run(connection).then(function (cursor, err) {

    cursor.toArray(function (err, result) {
      if (err) throw err;
      console.log(result.length);
      for (let i = 0; i < result.length; i++) {
        plots.push(result[i].trama);
        descriptions.push(result[i].desc);
      }
    });

  });
  return {plots:plots,descriptions:descriptions};
}


const getCharacters = async function getCharacters() {
  var characters = [];
  await rdb.table('Personajes').run(connection).then(function (cursor, err) {

    cursor.toArray(function (err, result) {
      if (err) throw err;
      console.log(result.length);
      for (let i = 0; i < result.length; i++) {
        characters.push(result[i].personaje);
      }
      console.log(characters);
      console.log("Fin funcion");
    });

  });
  return characters;
}


const getPersonalities = async function getPersonalities() {
  var personalities = [];
  await rdb.table('Personalidades').run(connection).then(function (cursor, err) {

    cursor.toArray(function (err, result) {
      if (err) throw err;
      console.log(result.length);
      for (let i = 0; i < result.length; i++) {
        personalities.push(result[i].personalidad);
      }
      console.log(personalities);
      console.log("Fin funcion");
    });

  });
  return personalities;
}


const savePoints = async function savePoints(num_room, array_points, id_teams) {
  for (var i = 0; i < id_teams.length; i++) {
    cursor = await rdb.table('Equipo').get(id_teams[i]).run(connection).then(function (cursor, err) {
      if (err) { console.log("error"); console.log(err) };
      return cursor;
    });

    var puntos_act = parseInt(cursor.puntos) + parseInt(array_points[i]);
    await rdb.table('Equipo').get(id_teams[i]).update({ puntos: puntos_act }).run(connection).then(function () {
      console.log("Equipo " + id_teams[i] + " ahora tiene " + puntos_act + " puntos");
    })
  }
}

const getPoints = async function getPoints(id_teams) {
  var finally_points = [];
  console.log("ID TEAMS -> ");
  console.log(id_teams);
  for (var i = 0; i < id_teams.length; i++) {
    var puntos = await rdb.table('Equipo').get(id_teams[i]).run(connection).then(function (cursor, err) {
      if (err) { console.log("error"); console.log(err) };
      
        console.log("Estoy captando los puntos del equipo " + i);
        console.log(cursor.puntos);
      
      return cursor.puntos;
    });
    console.log(puntos);
    finally_points.push(puntos);
  }
  console.log("Finally_points");
  console.log(finally_points);
  return finally_points;
}


const existsRoom = async function existsRoom(name_r) {
  var exists = false;
  await rdb.table('Sesion').filter(rdb.row('nombre_sesion').eq(name_r)).run(connection, function (err, cursor) {
    if (err) console.log("Error");
    else {
      cursor.toArray(function (err, result) {
        if (err) throw err;
        console.log(result.length);
        if (result.length > 0) {
          exists = true;
        }
      });
    }
  });

  console.log(exists);
  return exists;

}

const joinRoom = async function joinRoom(name_r, password_room) {
  var num_room = -1;
  await rdb.table('Sesion').filter(rdb.row('nombre_sesion').eq(name_r)).run(connection, function (err, cursor) {
    if (err) console.log("Error");
    else {
      cursor.toArray(function (err, result) {
        if (err) throw err;
        console.log(result.length);
        if (result.length != 1) {
          console.log("Error al encontrar la sala");
        } else {
          //Comprobamos si la contraseña es correcta
          console.log(result[0].password_sesion);
          console.log(password_room);
          if (parseInt(result[0].password_sesion) == parseInt(password_room)) {
            num_room = result[0].id_sesion;
          }
        }
      });
    }
  });
  return num_room;
}


const getMod = async function getMod(id_sesion) {

  let moderador;
  await rdb.table('Jugadores').filter(rdb.row('id_sesion').eq(id_sesion)).run(connection, function (err, cursor) {
    if (err) console.log("Error");
    else {
      cursor.toArray(function (err, result) {
        if (err) throw err;
        else {
          console.log("Captando moderador");
          moderador = result.find(x => x.idModerador == true);
          console.log(moderador);
        }

      });
    }
  });
  return moderador;
}


//Añadimos export para que pueda ser utilizada la clase
module.exports = {
  connect,
  saveSession,
  saveModerator,
  saveTeams,
  savePlayer,
  getLandscape,
  savePoints,
  getPoints,
  getStage,
  updateStage,
  existsRoom,
  joinRoom,
  getGenders,
  getPlots,
  getCharacters,
  getPersonalities,
  getMod
}