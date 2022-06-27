class Player {
    constructor(name) {
      this.name = name;
      this.isPlaying = false;
      this.imagePlayer = "";
      this.moderador = false;
    }
    setImagePlayer(img){
      this.imagePlayer = img
    }
    setIsModerador(isModerador){
      this.moderador = isModerador;
    }
}



//Añadimos export para que pueda ser utilizada la clase
module.exports = Player;