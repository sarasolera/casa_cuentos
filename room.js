//Clase sala de juego

class Room{
    constructor(){
        //url página principal
        this._url = "./start_game.html";
        //array de jugadores
        this._players = [];
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
     addPlayer(player){
        this._players.push(player)
    }
}


//Añadimos export para que pueda ser utilizada la clase
module.exports = Room;