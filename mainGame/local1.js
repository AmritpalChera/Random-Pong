/*
Author: Amritpal Chera
Date: 08-04-2020
Description: This files deals with the gameplay of the local game
*/
const racq = require ('./Player.js'); 
const comet = require ('./ball.js');
const checkCollision = require ('./collision.js');

module.exports = class main {
    constructor(points, randomness, socket){
        this.window = {
            height: 500,
            width: 1000
        };
        this.randomnessLevel = parseInt(randomness);
        this.player1 = new racq(this.window, false);
        this.player2 = new racq(this.window, true);
        this.ball = new comet(this.window);
        this.connection = socket; //the socket which is connected to local
        this.points = parseInt(points); //the umber of points to play upto
        
        this.data = null; //data to display on screen
        this.outOfBounds = -1;
        this.collide = null; 
        this.message = null;
        this.messagetxt = null;
        this.pause = false; 
        this.map = []; //stores which keys are pressed by the socket
        this.writeData = {}; //writing to be displayed for the socket

        //handler called to update the gamestate based on animationFrame
        this.connection.on('calculateLocal', (map)=>{  
            this.map = map;  
            this.game();
             
        })
        
    }
   
    game(){
        //console.log("w: " + this.map[87] + "s: " + this.map[83] + "up: " + this.map[38] + "down: "+ this.map[40]);

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
        
        //if a message must be displayed, then display it for 2 seconds
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

        //the writing that must be displayed to both players
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

        
        //update the racket position based on the keystrokes by the players
        
        if (this.map[38] && this.map[87]){
            this.player2.move_up(this.ball);
            this.player1.move_up(this.ball);
        }
        
        //both down
        else if (this.map[40] && this.map[83]){
            this.player2.move_down(this.ball);
            this.player1.move_down(this.ball);
        }
     
        //both opposite
        //player 1 up
        else if (this.map[87] && this.map[40]){
            this.player1.move_up(this.ball);
            this.player2.move_down(this.ball);
        }
     
        //player 1 down and still opposite
        else if (this.map[83] && this.map[38]){
            this.player1.move_down(this.ball);
            this.player2.move_up(this.ball);
        }
     
        else if (this.map[38]){
            this.player2.move_up(this.ball);
        
        }
    
        else if (this.map[87]){
            this.player1.move_up(this.ball);
        }
    
        else if(this.map[40]){   
            this.player2.move_down(this.ball);
        }
    
        else if (this.map[83]){
            this.player1.move_down(this.ball);
        }
    
        if (!this.map[83] && !this.map[87]){
            this.player1.move_stop();
        }
            
        if (!this.map[30] && !this.map[40])
            this.player2.move_stop();

        //check if the ball collides with the racket
        this.collide  = checkCollision(this.ball, this.player1, this.player2);


        //the data to be sent to client side to display: ball and racket for each player
        this.data = {
            "ball" : this.ball.getData(),
            "player1" : this.player1.getData(),
            "player2" : this.player2.getData()
        }

        
        //if collision on left paddle
        if (this.collide === 0){
            this.ball.reverseTest(this.player1.y_speed, this.randomnessLevel);
        }

        //if collision on right paddle
        else if (this.collide ===1){
            this.ball.reverseTest(this.player2.y_speed, this.randomnessLevel);
        }

        //check if one of the players reached the set points for the game 

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
        // this.connections[0].emit('fillText', "Winner", this.window.width*0.1, this.window.height/2);
            //this.connections[0].emit('fillText',"Nice Try!", this.window.width*0.8, this.window.height/2);
            this.connection.emit('doneGame');  
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
            //this.connections[1].emit('fillText', "Nice Try!", this.window.width*0.1, this.window.height/2);
            //this.connections[1].emit('fillText',"Winner", this.window.width*0.8, this.window.height/2);
            this.connection.emit('doneGame');
                
        } 
    
    

    this.connection.emit("data", this.data, this.writeData); //send the data to the socket
    //this.connections[1].emit("data", this.data, this.writeData); 
    }   

} 