# La Casa de los Cuentos
Repositorio creado para desarrollar mi TFG un juego online multisala y multijugador que incluye videoconferencia. El objetivo del juego será crear historias colaborativas para ello el sistema proporcionará recursos y el moderador irá guiando la historia.

## Herramientas utilizadas

### Nodejs y express
Para crear un servidor que responda a las peticiones de nuestros jugadores he utilizado nodejs un entorno que permite esto de manera muy sencilla y además incorpora expressjs es uno de los framework mas conocidos de nodejs.

### Rethinkdb
Además he utilizado una base de datos nosql para almacenar los datos de la partida para almacenar las diferentes sesiones, los diferentes jugadores y los diferentes equipos.

Para la base de datos hay dos opciones:
  - Acceder a la base de datos desplegada, entonces simplemente se ejecuta el servidor.
  - Base de datos local, para ellos es necesario instalar Rethinkdb a través de los comandos explicados en la página oficial, y modificar el código del archivo db.js comentar la conexión con la base de datos desplegada y descomentar la conexión con la base de datos local. Tras ello se debe ejecutar rethinkdb con:
    - sudo rethinkdb
    - Esto da accesso a la interfaz a través del puerto 8080.
  Y crear la base de datos y las tablas todas las operaciones están añadidas a un fichero en la carpeta script_db, el fichero script-db.txt tiene la creación de base de datos y la insercción en tablas.



#### Instalar dependencias 
  - npm install
#### Ejecución
  - sudo node server.js
  - Accediendo a localhost ya podemos ver el juego.