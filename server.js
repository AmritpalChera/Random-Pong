/*
Author: Amritpal Chera
Date: 08-04-2020
Description: This is the server side that deals with all incoming data and distributing it to the respective objects
*/

//make all necessary imports
let express= require('express')
let app = express();
let server  = require('http').Server(app);
//let compression = require('compression');
//let helmet = require('helmet');
//let cors = require('cors');
server.listen(8080);
const io = require('socket.io').listen(server);
const clientPath = "./client/"; //client path where the client files are stored
//app.use(cors());
//app.use(helmet());
//app.use(compression()); //compress all routes
app.use(express.static(clientPath)); 

const main  = require('./mainGame/local1.js'); //local main
const mainMulti  = require ('./mainGame/multi1.js'); //multiplayer main
      
let games = [], currentIndex = 0; //games: stores all current games on server, currentIndex: (games.length-1)
let randomWaiting = null;
io.on('connection', (socket)=>{

    socket.on('friendData', (data)=>{
        let index = getIndexofName(data[1]); //index of game
        let result = false;
        //data for joining game
        if (data[0]){
            if (index != -1 && !(games[index].player2)){ //if index exists and there isn't a player 2 
                result = true;
                games[index].player2 = socket;
                games[index].classify = "f";
                socket.join("f"+index); //socket joins the room named to classify the player
                io.to(getSocketRoom(socket)).emit('ready'); //send client the signal that game has started
                
                //start the game
                new mainMulti(games[index].points, games[index].randomnessLevel, [io, "f"+index], [games[index].player1, games[index].player2]);
                 
                //console.log(socket.rooms);
            }
        }
        //otherwise it must be for creating the game 
        else if (index === -1){
            result = true;
        }
   
        socket.emit('success', result);
    })  
                                     
    //receive the settings chosen by a certain player
    //data[0] will be classification --> "1 or r or f"
    //data[1] is points
    //data[2] is randomnesslevel
    //data[3] is serverName
    socket.on('settings', (data)=>{
        //console.log(socket);
        //console.log('settings entered');
        //console.log(socket.adapter.rooms);
        //console.log("waitingAt: "+ randomWaiting);
       // console.log("main settings: ",getSocketRoom(socket));
        if (data[0] === "l"){
            //console.log(getSocketRoom(socket));
            socket.emit('ready');
            
            new main(data[1], data[2], socket);
            
        } 
           
        else if (data[0] === "r" && randomWaiting === null){
            //socket.leave("r");
            socket.join("r"+currentIndex);
            //console.log("socketRoom", getSocketRoom(socket));
           // console.log("socketIndex", getSocketIndex(socket));
            games[currentIndex] = [];
            games[currentIndex].player1= socket;
            games[currentIndex].points = data[1];
            games[currentIndex].randomnessLevel = data[2];
            games[currentIndex].classify = "r";
            randomWaiting = currentIndex;
            currentIndex++;
        }
 
   
        else if(data[0] === "r"){
            //socket.leave("r");
            socket.join("r"+randomWaiting);
            //console.log("*******P2*********");
            //console.log("socketRoom:",getSocketRoom(socket));
           // console.log("socketIndex:",getSocketIndex(socket));
            games[randomWaiting].player2 = socket;
            games[randomWaiting].classify = "r";
            io.to(getSocketRoom(socket)).emit('ready'); 
            new mainMulti(games[randomWaiting].points, games[randomWaiting].randomnessLevel, [io, getSocketRoom(socket)],  [games[randomWaiting].player1, games[randomWaiting].player2]);

            
            randomWaiting = null;
        } 
    
        //only the first friend goes through settings
        else if (data[0] === "f"){
            //console.log('entere first player friend');
            //console.log(getSocketRoom(socket));
            //socket.leave("f");
            
            socket.join("f"+currentIndex);
            //console.log(getSocketRoom(socket));
            games[currentIndex] = [];
            games[currentIndex].player1 = socket;
            games[currentIndex].points = data[1];
            games[currentIndex].randomnessLevel = data[2];
            games[currentIndex].name = data[3];
            games[currentIndex].classify = "f";
            //console.log('after player1: ' , games);
            currentIndex++;
        }  
            
    })
   
      
    socket.on('disconnect', ()=>{
        clearGame(socket); //after a player disconnects, clear the game from 'game' variable
        console.log("games after leaving: "+games);
    })
 
     
})
  
function clearGame(socket){
    //find the index of the game using the socket id
    let _index = games.findIndex((e)=>{
        if (e && ((e.player1 && e.player1.id === socket.id) || (e.player2 && e.player2.id ===socket.id)))
            return true;
    })
    //console.log("index: "+_index);
    //console.log("classify: "+ classify);
    
    //if index is found, remove that index and inform client side of 'doneGame'
    if(_index != -1){ 
        io.to(games[_index].classify+_index).emit('doneGame');  
        games.splice(_index,1);
        currentIndex--;
        if (_index == randomWaiting)
            randomWaiting = null;
    }
    
}
     
server.on('error', (err)=>{
    console.error('Server error:', err);
} )

/*
server.listen(8080,()=>{
    console.log('RPS strated on port 8080');
});
*/

//finds the index of socket in games based on name
function getIndexofName(name){
    //console.log ("games: ", games);
    return(games.findIndex((element)=>{
        //console.log('element: ', element);
        if (element && element.name && (element.name === name)){
            return true;
        }
    }))
}
  /*
function getSocketIndex(socket){
    let room = getSocketRoom(socket);


    if (room != null){
        room = room.substring(1);
        return parseInt(room);
    }

    return -1;
   
}
 */ 

 //retreives information about a socket's room
function getSocketRoom(socket){
    let allRooms = socket.adapter.rooms;
    //console.log('****************socket************');
    //console.log(socket);
    //console.log("**************socket End*************");
    //console.log(allRooms);
    let socketId = socket.id;
    let roomId = null;

    for (var key in allRooms){
        if (key.length < 5){
            //console.log(allRooms[key].sockets);
            for (var id in allRooms[key].sockets){
                roomId = id;
            }
            //console.log(key);
            //console.log(roomId);
            if (roomId === socketId)
                return key;
        }
    }
    return null;

}
   