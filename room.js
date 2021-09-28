//Clase sala de juego
var fs = require('fs');
var Reader = require('filereader');
const { Console } = require('console');

class Room {
  constructor() {
    //url página principal
    this._url = "./start_game.html";
    //array de jugadores
    this._players = [];

    this._layouts = ["./first_door.html" , "./second_door.html"];

    //Fase 1
    this._landscapeCards = [
      "landscape_card_0.png",
      "landscape_card_1.png",
      "landscape_card_2.png"
    ];

    this._lastDoor = -1;

    this._objectCardSelected = null;

    this.title_plots = []; 

    this.descriptions_plots = [];
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

  /**
   * Funccion para añadir jugadores a la sala de juego
   * recibe como parámetro el nombre del jugador
   * @param {string} player
   */
  addPlayer(player) {
    this._players.push(player);
  }

  get_url_door(index) {
    return this._layouts[index];
  }

  get landscapeCards() {
    return this._landscapeCards;
  }

  get players() {
    return this._players;
  }

  chooseLandscape(card) {
    if (this._landscapeCards.includes(card)) {
      this._objectCardSelected = card;
    }
  }

  
  getGender(){
    //Leemos los ficheros
    var gender = readFile('genre.txt')
    const myGenders = gender.split("\n");

    //myGenders.forEach(element=>console.log("Elemento => " + element));

    //Generamos un numero aleatorio parasaber cual será el genero
    var num_ran = Math.floor(Math.random() * myGenders.length);
    return myGenders[num_ran];

  }

  getPlots(){
    //Leemos los ficheros
    var plots = readFile('master-plots.txt')
    const myPlots = plots.split("\n");
    var array_num = [];
    var selectedPlots= [];
    var i = 0;
    var components= [];
    this.title_plots = [];
    this.descriptions_plots = [];
    while(i<3){
        var num_ran = Math.floor(Math.random() * myPlots.length);
        if(!array_num.includes(num_ran)){
          array_num.push(num_ran);
          components = myPlots[num_ran].split('=>');
          this.title_plots.push(components[0]);
          this.descriptions_plots.push(components[1]);
          i+=1;
        }
    }
    return this.title_plots;
  }

}

function readFile(name_file){
  return fs.readFileSync(name_file , 'utf8');
}

//Añadimos export para que pueda ser utilizada la clase
module.exports = Room;
