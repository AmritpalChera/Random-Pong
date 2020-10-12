/*
Author: Amritpal Chera
Date: 08-04-2020
Description: This file is a link between the server side and the client side and controls events and objects shown on the screen
*/

import functions from './functions.js'; //functions is a file that stores all necessary functions to get the code working

let socket = io("https://random-pong.herokuapp.com/", {transports: ["websocket"]}); //connect socket to website url
//let socket = io('http://localhost:8080');

let module = new functions(socket);

//retrive all elements from the html screen for controlling

//introScreen
let mainPage = document.getElementById("introPage");
let instructionsPage = document.getElementById("instructions");
let instructionsMulti = document.getElementById("instructionsMulti");
let continueBtn  = document.getElementById("continue");
//first screen
let multiBtn= document.getElementById("singleBtn"); //choosing single player mode button
let localBtn = document.getElementById("doubleBtn"); //chosing two player mode button
let backgroundImg = document.getElementById("introImg");

//second screen : get points + randomness level
let settingsTitle = document.getElementById('settingsTitle');
let points = document.getElementById("points");
let randomnessLevel = document.getElementById("randomnessLevel");
let submitBtn = document.getElementById("submitPoints");
let label1 = document.getElementById("label1");
let label2 = document.getElementById("label2");

//multiplayer
let joinNameSpace = document.getElementById("joinNamespace");
let createNameSpace = document.getElementById("createNamespace");
let joinGameBtn = document.getElementById("joinGameBtn");
let createGameBtn = document.getElementById("createGameBtn");

let randomBtn = document.getElementById('randomBtn');
let friendBtn = document.getElementById('friendBtn');

//third screen: the canvas
let canvas = document.getElementById("myCanvas"); //mainGame Canvas
let ctx = canvas.getContext('2d');
//set default values for ctx
let grd = ctx.createLinearGradient(350, 450,700, 500);
grd.addColorStop(0,"#FF00D4");
grd.addColorStop(0.5, "#00FFCC");
grd.addColorStop(1, "#FF0000");
ctx.fillStyle = grd;

//last page:
let replayBtn = document.getElementById("replayBtn");


//All necessary variables
let clicks  = 0, map = []; //clicks: number of clicks for ctn Button, map: map of keys pressed
let classify = null; //'l' for local , 'f' for friends , 'r'for random
let gameDone = false; // true once the game is finished
let join = false; //true if this player is joining a game
let waiting = false; //true if this player is waiting for another
let pause = false; //used for the pause state in local mode
let time = 3; //starting point for countdown timer
let window = {width: 1000, height: 500}; //dimensions of the canvas window

//hide all buttons except first screen
module.hideMultiple([settingsTitle, friendBtn, randomBtn, joinNameSpace, createNameSpace, joinGameBtn,createGameBtn, instructionsPage, instructionsMulti, localBtn, multiBtn,canvas, label1, label2, points, randomnessLevel, submitBtn, replayBtn, localBtn, backgroundImg]);

//if continue btn is pressed, based on # of clicks, perform a specific action
continueBtn.onclick = () =>{
     clicks++;
     if (clicks === 1){
         module.showMultiple([localBtn, multiBtn, backgroundImg]);
         module.hideMultiple([continueBtn, mainPage]);
     }
     //no matter if local or multiplayer, show them the same settings
     else{
         if (classify != "l"){
             submitBtn.innerHTML = "GO!"
             module.showMultiple([randomBtn, friendBtn, backgroundImg]);
         }
         else{
            module.showMultiple([settingsTitle, randomnessLevel, points, label1, label2, submitBtn, backgroundImg]);
         }
        
         
         module.hideMultiple([continueBtn, instructionsMulti, instructionsPage]);
     }

}

randomBtn.onclick= ()=>{
    classify ="r";
    toggleWaitingMessage(); //makes waiting message appear on screen
    choosePath();
}

friendBtn.onclick = ()=>{
    module.showMultiple([joinNameSpace, joinGameBtn, createNameSpace, createGameBtn]);
    module.hideMultiple([randomBtn, friendBtn]);
}
localBtn.onclick = () =>{
    module.showMultiple([instructionsPage, continueBtn]);
    module.hideMultiple([localBtn, multiBtn, backgroundImg]); 
    classify = "l";
}

multiBtn.onclick = () =>{
    module.hideMultiple([localBtn, multiBtn, backgroundImg]);
    module.showMultiple([instructionsMulti, continueBtn]);
    //module.showMultiple([joinGameBtn, createGameBtn, joinNameSpace,createNameSpace]);
}



joinNameSpace.oninput =()=>{

    //a space is prohibited
    if (!joinNameSpace.value || (joinNameSpace.value.indexOf(" ", 0))!=-1){
        joinGameBtn.disabled = true;
    }
    else{
        joinGameBtn.disabled = false;
    }
}

createNameSpace.oninput =()=>{
    //a space is prohibited
    if (!createNameSpace.value || (createNameSpace.value.indexOf(" ", 0))!=-1){
        createGameBtn.disabled = true;
    }
    else{
        createGameBtn.disabled = false;
    }
    
}

joinGameBtn.onclick = ()=>{
    join = true;
    sendFriendData(joinNameSpace.value); //send  data to server
    //module.sendData('joinGame', joinNameSpace.value);
}

createGameBtn.onclick = ()=>{
    join = false;
    sendFriendData(createNameSpace.value); //send data to server
    //module.sendData('createGame', createNameSpace.value);
}

function sendFriendData(serverName){
    module.sendData('friendData', [join, serverName]);
}

let setName = null;


//success will be called 3 times in total for multiplayer
//when successfully creating game, then joining successfully for both players
//creating game != joining game
socket.on('success', (success)=>{
    if (join){
        if(!success){
            alert('Namespace does not exist');
        }
        else{
            
            module.hideMultiple([joinGameBtn, createGameBtn, joinNameSpace, backgroundImg, createNameSpace]);
            module.show(canvas);
            
        }
    }
    else{
        if(!success){
            alert('The name is taken. Choose a different one');
        }
        else{
            setName = createNameSpace.value;
            module.showMultiple([settingsTitle, randomnessLevel, submitBtn, points, label1, label2]);
            module.hideMultiple([settingsTitle, createGameBtn, joinGameBtn, createNameSpace, joinNameSpace]);
            classify = "f";
            toggleWaitingMessage();
            //emitClassification();
            alert('share the typed namespace (' + createNameSpace.value +') with your friend');
        }
    }
       
})

function toggleWaitingMessage (){
    waiting = !waiting;
    ctx.clearRect(0,0,window.width,window.height);
    if (waiting && classify != "l"){
        ctx.font = "700 30px Arial";
        ctx.fillText('Waiting For Another Player', 300, 450);
    }

}


socket.on('ready', ()=>{
    toggleWaitingMessage();
    ctx.font = "90px Arial";
    countdownStartGame(3);
    
});

function countdownStartGame (i) {  
    ctx.clearRect(0,0, window.width, window.height);
    ctx.fillText(time, 490, 490);        
    setTimeout(function () {
        time--;  
        //console.log(time);
        if (time < 1){
            ctx.font = "30px Arial";
            requestAnimationFrame(game);
        }                    
        if (--i) countdownStartGame(i);      //call loop again if i is greater than 0
    }, 1000)

 };    




//default value is going to be 5
label1.innerHTML = "Points: " + points.value;
points.oninput = ()=>{
    label1.innerHTML= "Points: "+ points.value;
   // module.sendData('settings', [points.value. randomnessLevel.value]);
}

//default value is going to be 1
label2.innerHTML = "Randomness: "+randomnessLevel.value;
randomnessLevel.oninput = ()=>{
    label2.innerHTML= "Randomness: "+randomnessLevel.value;
    
}

//this function is called after the settings have been chosen
//choosePath: displays different objects based on classification of player: 'l' or 'f' or 'r'
function choosePath(){
    //emitClassification();
    module.show(canvas);
    module.sendData('settings',[classify, points.value, randomnessLevel.value, setName]);
    if (classify === "f" || classify ==="l"){   
        module.hideMultiple([settingsTitle, label1, label2, randomnessLevel, points, submitBtn, backgroundImg]);
        /*
         (classify === "l"){
            requestAnimationFrame(game);
        }*/
    }
    else if (classify === "r"){
        module.hideMultiple([randomBtn, friendBtn]);   
    }

}

//when go has been pressed: queue to start main game
submitBtn.onclick = ()=>{
    choosePath();
    //module.showMultiple([backgroundImg, joinGameBtn, createGameBtn, joinNameSpace,createNameSpace]); 
};

socket.on('data', (data, writeData)=>{
    module.draw(ctx,data, writeData);
})


//on key press, update keypress data even if game didn't start; it will be handeled by sever
onkeydown = onkeyup=  function (e){ 
    e= e || event;
    map[e.keyCode] = (e.type === 'keydown');

    if (map[32] && classify === "l"){
        togglePause();
    }
    
}

function togglePause(){
    pause = !pause;
    if (!pause){
        game();
    }
}
replayBtn.onclick = ()=>{
    location.href = "/";
}


function game(){
    //this data will be sent when the browser is ready to render once again regardless if the user moves or not
    //on server side, call the function game only once on the multi1.js side
    module.sendData('calculateLocal', map);
    if (!gameDone && !pause){
        requestAnimationFrame(game); 
    }
        
}

//once the game is done, hide the canvas and show the replay button
//click on replay will reload the game, hence, no hiding necessary 
socket.on('doneGame', ()=>{
    gameDone = true;
    setInterval(()=>{
        module.hide(canvas);
        module.showMultiple([backgroundImg, replayBtn]);
    }, 3000);    
})







 

