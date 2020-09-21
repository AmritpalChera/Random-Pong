/*
Author: Amritpal Chera
Date: 08-04-2020
Description: This files deals with the gameplay in multiplayer mode. Rooms are used to increase in-game performance
*/
const racq = require ('./Player.js'); 
const comet = require ('./ball.js');
const checkCollision = require ('./collision.js');

module.exports = class mainMulti {
    constructor(points, randomness, sockets, players){
        this.window = {
            height: 500,
            width: 1000
        };
        this.randomnessLevel = parseInt(randomness);
        this.player1 = new racq(this.window, false);
        this.player2 = new racq(this.window, true);
        this.ball = new comet(this.window);
        this.io = sockets[0]; //the io server
        this.room = sockets[1]; //the room of the socket in io
        this.connections = [players[0], players[1]]; //the sockets themselves
        this.points = parseInt(points); //the points the game is upto
        
        this.data = null; //data of the current game
        this.outOfBounds = -1;
        this.collide = null; 
        this.message = null;
        this.messagetxt = null; //message to display on the screen
        //this.randomnessLevel = 1;
        this.map0 = []; //keystrokes for player 1
        this.map1 = []; //keystrokes for player 2
        this.writeData = {}; //writing data to send to players

        //notice how game() is only called in one of the following handelers. 
        //this is because both will be called when the browser is ready to render the next frame
        //we only need to update the game state once during both these calls
        this.connections[0].on('calculateLocal', (map)=>{  
            this.map0 = map;                
        })
        
    
        this.connections[1].on('calculateLocal', (map)=>{  
            this.map1 = map;
            this.game();
            
        })
        
    }


    game(){
       //this.update_keys();
        this.outOfBounds = this.ball.move(this.randomnessLevel);
        //if outBounds reuturns -2 then display a message
        if(this.outOfBounds === 0){
            this.player2.addPoint();
            this.ball.initialize();
        }
        else if (this.outOfBounds === 1){
            this.player1.addPoint();
            this.ball.initialize();
        }
        else if (this.outOfBounds === -2){
            this.message = true;
            this.messagetxt = this.ball.message;
        }
        
        //if the screen should display the message, display it for 2 seconds
        if (this.message){
            setTimeout(()=>{
                this.message = false;
                this.writeData.message = null;
            },2000);

            this.writeData['message'] = {
                text: this.messagetxt,
                x_loc:  Math.floor(this.window.width/2-this.messagetxt.length*this.window.width*0.01), 
                y_loc: Math.floor(this.window.height*0.95)
            }
        
        }

        //the data to write on the screen of each player
        this.writeData['player1Points'] = {
            text: this.player1.points,
            x_loc: Math.floor(this.window.width/2-this.window.width*0.1),
            y_loc: Math.floor(this.window.height*0.1)
        }

        this.writeData['player2Points'] = {
            text: this.player2.points,
            x_loc: Math.floor(this.window.width/2+this.window.width*0.1),
            y_loc: Math.floor(this.window.height*0.1)
        }
        
        //move the rackets based on the inputs from the players

        if(this.map0[38]){
            this.player1.move_up(this.ball);
        }
        else if (this.map0[40]){
            this.player1.move_down(this.ball);
        }
        else{
            this.player1.move_stop();
        }

        if(this.map1[38]){
            this.player2.move_up(this.ball);
        }
        else if (this.map1[40]){
            this.player2.move_down(this.ball);
        }
        else{
            this.player2.move_stop();
        }

        this.collide  = checkCollision(this.ball, this.player1, this.player2);

        //the data of the ball and each racket
        this.data = {
            "ball" : this.ball.getData(),
            "player1" : this.player1.getData(),
            "player2" : this.player2.getData()
        }


        if (this.collide === 0){
            this.ball.reverseTest(this.player1.y_speed, this.randomnessLevel);
        }
        else if (this.collide ===1){
            this.ball.reverseTest(this.player2.y_speed, this.randomnessLevel);
        }
    
        //check if one of the players won the game

        if (this.player1.points === this.points){
            //console.log('helllo');
            this.writeData['Winner'] = {
                text: "Winner",
                x_loc: Math.floor(this.window.width*0.1),
                y_loc: Math.floor(this.window.height/2)
            }

            this.writeData['loser'] = {
                text: "Nice Try!",
                x_loc: Math.floor(this.window.width*0.8),
                y_loc: Math.floor(this.window.height/2)
            }

            this.io.to(this.room).emit("doneGame");
           // this.connections[0].emit('fillText', "Winner", this.window.width*0.1, this.window.height/2);
            //this.connections[0].emit('fillText',"Nice Try!", this.window.width*0.8, this.window.height/2);
            //this.connections[0].emit('doneGame');
            //this.connections[1].emit('doneGame');
            
        }

        else if(this.player2.points === this.points){  
            //console.log('helllo111111');
            this.writeData['Winner'] = {
                text: "Nice Try!",
                x_loc: Math.floor(this.window.width*0.1),
                y_loc: Math.floor(this.window.height/2)
            }

            this.writeData['loser'] = {
                text: "Winner",
                x_loc: Math.floor(this.window.width*0.8),
                y_loc: Math.floor(this.window.height/2)
            }
            this.io.to(this.room).emit("doneGame");
            //this.connections[1].emit('fillText', "Nice Try!", this.window.width*0.1, this.window.height/2);
            //this.connections[1].emit('fillText',"Winner", this.window.width*0.8, this.window.height/2);
            //this.connections[0].emit('doneGame');
            //this.connections[1].emit('doneGame');
            
        }

        this.io.to(this.room).emit("data", this.data, this.writeData); //emit the data to the room instead of individual players
        //this.connections[0].emit("data", this.data, this.writeData); 
        //this.connections[1].emit("data", this.data, this.writeData); 
    }

}