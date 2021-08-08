var socket = io.connect("http://localhost:80", { forceNew: true });

/**
 * Creamos la clase jugador que va a ser cada cliente,
 * así podremos controlar que jugador esta jugando en cada momento
 */
 class Player{
    constructor(name){
        this.name = name;
        this.isPlaying = false;
    }
}

//Cada cliente tendrá acceso a este script de manera única lo unico conjunto es el servidor
//Creamos la instancia jugador
var player = new Player();

//Funcion joinRoom
function joinRoom(){
    //Captamos el nombre del jugador
    let namePlayer = document.getElementById("name_player").value;

    if(namePlayer){
        console.log("El cliente va a enviar la petición "+namePlayer);
        player.name = namePlayer;
        player.isPlaying = false;
        /*Indicamos al servidor que el jugador se quiere unir al juego,
        para ello usamos el socket conectado al puerto 80 y emitimos la petición*/
        socket.emit("joinRoom",namePlayer);
    }
   
    
}

//Estamos pendientes a que el socket nos envie la url de la sala
socket.on("room",roomUrl);

function roomUrl(url){
    console.log("Llega a la función dle cliente");
    console.log("Url hacia comenzar juego recibida");
    //biblioteca jquery
    $("#content").load(url);   
}