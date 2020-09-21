/*
Author: Amritpal Chera
Date: 08-04-2020
Description: This file deals with all racket calculations. The locations are integers for increased in-game performance
*/
module.exports =   class player {
    constructor(window, rightSide){ //multiplayer is a boolean value, true for right paddle and false for left
        this.window = window; //stores the window height
        this._paddleHeight = window.height*0.15;
        this._paddleWidth = window.width*0.01;
        this._y_location = window.height/2-this._paddleHeight;
       //console.log(window.height);
        this._x_location = window.width*0.05; 
        if (rightSide){this._x_location = window.width - window.width*0.05}; 
        this._y_speed =0;
        this._points = 0;
        this._friction = 0.8;
        this.data = null;
        
    }

    

    get points(){
        return this._points;
    }

    addPoint (){
        this._points++;
    }

    resetPoints(){
        this._points =0;
    }

    get y_speed(){
        return this._y_speed;
    }

    get y_location(){
        return this._y_location;
    }
    get x_location(){
        return this._x_location;
    }
    get paddleHeight(){
        return this._paddleHeight;
    }
    get paddleWidth(){
        return this._paddleWidth;
    }

    //to move the racket up
    move_up(ball){
       this._y_speed = Math.abs(ball.speed_vector);
        this._y_location -= this._y_speed;

        if (this._y_location  <= 0){
            this._y_location =0;
        }

    }

    //to moce the racket down
    move_down(ball){
       this._y_speed = Math.abs(ball.speed_vector);
        this._y_location+=this._y_speed;
        //this._y_location += 1;

        
        if(this._y_location > this.window.height-this._paddleHeight){
            this._y_location = this.window.height - this._paddleHeight;
            
        }
        
    }

    //to stop the racket 
    move_stop(){
        if (this._y_speed != 0 ){
            this._y_speed = 0;
        }
       
    }

  
    //used to send data to the client side to draw on canvas
    getData(){
        this.data = {
            x_loc: this._x_location,
            y_loc: this._y_location,
            paddleHeight: this._paddleHeight,
            paddleWidth: this._paddleWidth
        }
        return (this.data);
    }

 };
