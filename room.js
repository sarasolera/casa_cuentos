
var fs = require('fs');
var Reader = require('filereader');

const path = require('path');

function readDirectory(){
  return fs.readdirSync(
    path.resolve(__dirname, 'public/assets/images/objects/'),
    (err, files) => {
      if (err) throw err;
      return files;
    }
  );

}

//Clase sala de juego
class Room {
  constructor() {
    this.num_room;
    this.num_players = 0 ;
    this.isAllPlayer = false;
    //url página principal
    this._url = "./start_game.html";

    this._layouts = ["./first_door.html" , "./second_door.html","./third_door.html" , "./stage_one.html" , "./stage_two.html" , "./stage_three.html","./score.html"];
    this._landscapeCards = [];

    //array de jugadores
    this._players = [];

    //Numero de equipos
    this.num_teams = 0;
    this.array_teams = [];
    this.score_teams = [];
    //moderador
    this.thereIsModerador = false;
    this.nameModerador = "";
    //Fase 1
    this._lastDoor = -1;

    this._objectCardSelected = null;

    this.gender = '';

    //Tramas
    this.title_plots = []; 
    this.descriptions_plots = [];
    this.plots_showed = false;

    this.actual_characters = [];
    this.selected_characters = [];

    //this.characters = ['Aliados' , 'Cambiante' , 'Embaucador', 'Guardian' , 'Heraldo' , 'Heroe' , 'Mentor' , 'Sombra'];
    this.characters = [];
    this.actual_personalities = [];
    this.selected_personalities  = [];
    //this.personalities = ['Bravucon' , 'Fanatico' , 'Gafe' , 'Lider' , 'Mistico' , 'Niño' , 'Superviviente' , 'Tradicionalista' , 'Vividor'];
    this.personalities = [];

    //Variable para saber si tenemos ya 3 cartas personaje seleccionadas
    this.allSelectedCard = false;


    //Personajes secundarios , caracter secundario y evento
    this.second_characters = ['Gigante' , 'Hada' , 'Mago' , 'Animal' , 'Bruja' , 'Duende' , 'Pirata' , 'Fantasma'];
    this.second_personalities = ['Feliz' , 'Amable', 'Valiente' , 'Vago' , 'Triste' , 'Visionario', 'Introvertido' ];
    this.events = ['Competición' , 'Batalla' , 'Sueño' , 'Persecución' , 'Transformación' , 'Trampa' , 'Muerte'];
    this.lastEvent='';
    this.id_teams = [];

    //messages 
    this.messages = [];
  }

  /**
   * Funcion para almacenar mensajes
   */

  addMessage(message){
    this.messages.push(message);
  }

  /** funcion para obtener los mensajes */

  getMessages(){
    return this.messages;
  }


  /**
   * Función get de la url principal
   */
  get url() {
    return this._url;
  }
  /**
   * Función ser de la url
   */
  set url(value) {
    this._url = value;
  }


  saveTeams(){
    console.log("Generando Equipos");
    var tam_players = this._players.length;

    //equipos individuales
    if(this._players.length  < 4){
      this.num_teams =  tam_players;
      
      for(var i = 0 ; i < this._players.length ; i++){
        var array_player = [];
        array_player.push(this._players[i]);
        this.array_teams.push(array_player);
      }
      
    }
    else if(this._players.length == 4){
      //dos equipos
      this.num_teams = 2;
      this.array_teams = [ [this._players[0],this._players[1]] , [this._players[2],this._players[3]]];
    }
    else if(this._players.length == 5){
      //2 equipos 
      this.num_teams = 2;
      this.array_teams = [ [this._players[0],this._players[1]] , [this._players[2],this._players[3] , this._players[4]]];
    }
    else{
      // si son 6 -> 3 equipos de dos personas
      this.num_teams = 3;
      this.array_teams = [ [this._players[0],this._players[1]] , [this._players[2],this._players[3]] , [this._players[4],this._players[5] ] ];
    }    
  }

  /**
   * Función para añadir un moderador
   */
  addModerador(player){
    
    if(this.thereIsModerador ){
      return false;
    }
    this.thereIsModerador = true;
    console.log("Añadiendo moderador => " + player);
    this.nameModerador = player;
    return true;
  }
  
  /**
   * Función para comprobar si hay alguien que tiene el mismo nombre
   * @param {string} name_player 
   */
  isNameUsed(n_player , n_file){
    var isUsed = false;
    var i = 0;
    while(!isUsed && i < this.players.length){
      if(this._players[i].name == n_player){
        isUsed = true;
      }
      i++;
    }
    return isUsed;
  }
  /**
   * Funccion para añadir jugadores a la sala de juego
   * recibe como parámetro el nombre del jugador
   * @param {string} player
   */
  addPlayer(n_player , n_file) {
    var object_p = {name:n_player,image:n_file}
    this.num_players+=1;
    this._players.push(object_p);
  }

  get_url_door(index) {
    return this._layouts[index];
  }

  get landscapeCards() {
    return this._landscapeCards;
  }

  set landscapeCards(landscapes){
    this._landscapeCards = landscapes;
    console.log("Cartas almacenadas -> ");
    console.log(this._landscapeCards);
  }

  get players() {
    return this._players;
  }

  chooseLandscape(card) {
    console.log("Carta que viene a la función")
    console.log(card);
    console.log("CARTAS EN ROOM")
    console.log(this._landscapeCards)
    if (this._landscapeCards.includes(card)) {
      this._objectCardSelected = card;
    }
    else{
      console.log("NO incluye la carta");
    }
  }

  getLandscapeCard(){
    return this._objectCardSelected;
  }
  
  saveLandscapeCards(cards){
    //De todas las cartas nos quedamos con 3
    this._landscapeCards =  getArrayUnique(this._landscapeCards , cards);
  }

  setGender(genders){
    if(genders != undefined){
      //Generamos un numero aleatorio parasaber cual será el genero
      var num_ran = Math.floor(Math.random() * genders.length);
      this.gender = genders[num_ran];
    }    
  }

  getGender(){
    return this.gender;
  }
 
  setPlots(plots,descriptions){
    var array_num = [];
    var selectedPlots= [];
    var i = 0;

    this.title_plots = [];
    this.descriptions_plots = [];
    while(i<3){
        var num_ran = Math.floor(Math.random() * plots.length);
        if(!array_num.includes(num_ran)){
          array_num.push(num_ran);
          this.title_plots.push(plots[num_ran]);
          this.descriptions_plots.push(descriptions[num_ran]);
          i+=1;
        }
    }
    console.log("Tramas => " + this.title_plots);
    console.log("Descripciones => "+ this.descriptions_plots);
    this.plots_showed = true;

  
  }

  getTitlePlots(){
    return this.title_plots;
  }

  getDescripcionPlots(){
    return this.descriptions_plots;
  }

  setCharacters(charac){
    if(charac != undefined){
      this.characters = charac;
      console.log("Personajes actuales -> " );
      console.log(this.characters);
      this.actual_characters = getArrayUnique(this.selected_characters , this.characters);
    }
  }

  getCharacters(){
    return this.actual_characters;
  }

  //CARTAS DE PERSONALIDAD

  setPersonalities(pers){
    this.personalities = pers;
    console.log("Personalidades actuales -> " );
    console.log(this.personalities);
    this.actual_personalities = getArrayUnique( this.selected_personalities , this.personalities);
  }

  getPersonalities(){
    return this.actual_personalities;
  }


  selectedCard(num_card,characters){
    var tam = 0; 
    if(characters == true){
      this.selected_characters.push(this.actual_characters[num_card]);
      tam = this.selected_characters.length;
    }else{
      this.selected_personalities.push(this.actual_personalities[num_card]);
      tam = this.selected_personalities.length;
    }
    
    if(tam == 3){
      return true;
    }
    return false;
   
  }

  getRandomElement(tam , array_element){
    var i = 0;
    var random_number = [];
    var result_array = [];
    while(i<tam){
      var num_ran = Math.floor(Math.random() * array_element.length);
      if(!random_number.includes(num_ran)){
        random_number.push(num_ran);
        result_array.push(array_element[num_ran]);
        i+=1;
      }

    }
    return result_array;
  }

  getIcons(){
    var files = readDirectory();
    var tam = this.num_teams * 2;
    var array_num = [];
    var array_files = this.getRandomElement(tam,files);
    
    console.log("Array files => "+array_files);
    return array_files;
  }

  getSecondCharacters(){
    console.log("Numero de equipos" + this.num_teams)
    var tam = this.num_teams;
    var array_num = [];
    var array_secondCharacter = this.getRandomElement(tam,this.second_characters);
    console.log("Array files => "+array_secondCharacter);
    return array_secondCharacter;
  }

  getSecondPersonalities(){
    var tam = this.num_teams;
    var array_num = [];
    var array_secondPersonalities = this.getRandomElement(tam,this.second_personalities);
   
    return array_secondPersonalities;
  }

  getEvent(){
    console.log("Captando evento");
    var eventSelected = false;
    while(!eventSelected){

      var num_ram = Math.floor(Math.random() * this.events.length);
      console.log("CNUm rand");
      console.log(num_ram);
      if(this.events[num_ram] != this.lastEvent){
        this.lastEvent = this.events[num_ram];
        eventSelected = true;
      }
    }
    
    return this.lastEvent;
  }
f
  addPoints(array_points){
    for(var i = 0 ; i < this.num_teams;i++){
      this.score_teams[i].score = parseInt(this.score_teams[i].score) + parseInt(array_points[i]);
    }

    console.log("Puntos ");
    console.log(this.score_teams);
  }


  getAdjectivesPlaces(){
    var adjectives =  readFile('places.txt');
    const adjectives_array = adjectives.split("\n");
    return this.getRandomElement(3 , adjectives_array);
  }

  getSentences(){
    var sen =  readFile('sentences.txt');
    const sentences = sen.split("\n");
    const mySentences = sentences.slice(0 , sentences.length-1);
    return this.getRandomElement(this.num_teams , mySentences);
  }
  
}

function readFile(name_file){
  return fs.readFileSync(name_file , 'utf8');
}
/* En el caso de personajes finaly array selected_caracter // data_array characters*/
function  getArrayUnique(finally_array , data_array){

  console.log("Array de seleccionados => " + finally_array );

  var i = 0
  var actual_array = []
  while(i<3){
    var num_ran = Math.floor(Math.random() * data_array.length);
    var charac = data_array[num_ran];
    if(!actual_array.includes(charac) && !finally_array.includes(charac)){
      i+=1;
      actual_array.push(charac);
    }
  }
  console.log("Array elegido => " + actual_array);

  return actual_array;
}


//Añadimos export para que pueda ser utilizada la clase
module.exports = Room;
