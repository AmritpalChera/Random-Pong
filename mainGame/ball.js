/*
Author: Amritpal Chera
Date: 08-04-2020
Description: This file makes all necessary calculation for the ball. All locations are integers for faster render time
*/
module.exports =  class ball {

    constructor (window){
        this.window = window;
        this._max_start_bound_box = {
            x_min: window.width/2-200,
            x_max:  window.width/2+200,
            y_min: 0,
            y_max:window.height,
        };

        this._ball_limits = { //consider calculations in Quadrant 1 of the cartesian plain
            speed_max: 17,
            speed_min: 3,
            angle_max: Math.PI*7/18, //70 degrees
            angle_min: Math.PI/6, //30 degrees 
            y_speed_max: null,
            x_speed_max: null,
        };

        //ball limits calculated based on max angle and max speed
        this._ball_limits["y_speed_max"] = Math.sin(this._ball_limits["angle_max"])*this._ball_limits["speed_max"], //basic soh cah toa; calculations based on angle
        this._ball_limits["x_speed_max"] = Math.sqrt(Math.pow(this._ball_limits["speed_max"],2) - Math.pow(this._ball_limits["y_speed_max"],2)); //pythagorean theorem, calculations based on y
        this._x_location =null;
        this._y_location = null;
        this._radius = Math.ceil(window.height*0.02);
        this._y_speed =0;
        this._x_speed = 0;
        this._speed_vector = 0; //overall speed (hypotenuse)
        this._friction = 0.1; //factor used to add the racket speed to the ball speed
        this._angle = null;
        this.gravity = ['ATTRACTION TOWARDS SLOWER TIME!', 'TOO MANY GRAVITONS!', 'DARK ENERGY!', 'SPACE DISTORTION'];
        this.change_ball_move = null;
        this.data = null;
        this.initialize();
    }

    get x_location (){
        return this._x_location;
    }

    get y_location (){
        return this._y_location;
    }

    get radius (){
        return this._radius;
    }

    get speed_vector(){
        return this._speed_vector;
    }

    get angle(){
        return this._angle;
    }
    get y_speed(){
        return this._y_speed;
    }


    getRandIntInclusive(max, min){
        max = Math.floor(max);
        min = Math.floor(min);
        return (Math.floor(Math.random()*(max-min+1))+min);
    }
    getRandDubInclusive(max, min){
        return ((Math.random()*(max-min))+min);
    }

    get message(){
        return this.gravity[this.getRandIntInclusive(-1,4)];
    }
  
    //calculation during the game

    //slows the ball down
    slow_me(){
       let temp_x = this._x_speed;
       let temp_y = this._y_speed;

        this._y_speed = Math.floor(Math.abs(Math.sin(this._angle)*this._speed_vector));
        this._x_speed = Math.ceil(Math.abs(Math.cos(this._angle)*this._speed_vector));

        if (temp_x < 0){
            this._x_speed = -this._x_speed;
        }

        if(temp_y < 0){
            this._y_speed = -this._y_speed;
        }
    }


    //only for starting the game
    initialize(){ //selects a random direction, and speed for the ball.
        //pick an angle between 15 and 75 degrees (in rads)
        this._angle = this.getRandDubInclusive(this._ball_limits["angle_max"], this._ball_limits["angle_min"]);
        
        //set overall speed between the speed limit-3 and min speed ; ball should always start slow 
        this._speed_vector = this.getRandIntInclusive(4, this._ball_limits["speed_min"]);
        //this._speed_vector = this.getRandIntInclusive(2, this._ball_limits["speed_min"]);

        //calculate speed of each axis
        this._y_speed = Math.floor(Math.abs(Math.sin(this._angle)*this._speed_vector)); //soh cah toa
        this._x_speed  = Math.ceil(Math.sqrt(Math.pow(this._speed_vector,2) - Math.pow(this._y_speed,2))); //pythagorean theorem

        this._x_location = Math.ceil(Math.random()*(this._max_start_bound_box["x_max"] - this._max_start_bound_box["x_min"]) )+ this._max_start_bound_box["x_min"];
        this._y_location = Math.ceil(Math.random()*(this._max_start_bound_box["y_max"] - this._max_start_bound_box["y_min"])) + this._max_start_bound_box["y_min"];

        //set direction for each x and y (- or +):
        if (this.getRandIntInclusive(1,0) === 0){
            this._x_speed = -this._x_speed; //switch the sign
        } 
        if (this.getRandIntInclusive(1,0) === 0){
            this._y_speed = -this._y_speed; //switch the sign
            
        } 
        if (this._y_location <= (this._radius+2) || this._y_location >= (this.window.height - this._radius -2)){
            this._y_speed = -this._y_speed;     
        }
        /*
        this._x_location+=this._x_speed;
        this._y_location+=this._y_speed;
        //document.fillText(this._x_location, 200,200);
        */
    }


    //reverses the x_speed of the ball and adds some speed
    reverseTest(speed, random){

        speed = Math.ceil(Math.abs(speed)*this._friction);
        if (speed < 1 && this.speed_vector <= 6){
            speed = 1;
        }

        else if (speed > 3 && this.speed_vector >= 6 ){
            speed = 2;
        }
        
        if ((this._speed_vector+speed) <= this._ball_limits['speed_max']){
             this._speed_vector += speed;
        }
        let x_positive = false;
        if ( this._x_speed > 0){
            x_positive = true;
        }
        
        let y_positive = false;
        if (this._y_speed > 0){
            y_positive = true;
        }
    
        //************************************* */
        
        this._angle = this.getRandDubInclusive(this._ball_limits['angle_max'], this._ball_limits['angle_min']); 
    
        this._y_speed = Math.floor(Math.abs(Math.sin(this._angle)*this._speed_vector));
        if(!y_positive && random < 2){
            this._y_speed = -this._y_speed;
        }
        else if (!y_positive && (this.getRandIntInclusive(0,5) === 2)){
            this._y_speed = -this._y_speed;
        }
    
        //have the new x_speed always positive
        this._x_speed = Math.ceil(Math.abs(Math.cos(this._angle)*this._speed_vector));

        //if x was also positive before, then make the current negative
        if(x_positive){
            this._x_speed = -this._x_speed;
            this._x_location -=this.window.width*0.005;
        }
        else{
            this._x_location +=this.window.width*0.005;       
        }

    }


    //returns if the ball is in the middle of the screen
    inMiddle(){
        if (this._max_start_bound_box['x_max'] - 50 > this._x_location){
            if (this._max_start_bound_box['x_min']+50 < this._x_location){
                if(this._y_location < (this.window.height/2+300)){
                    if (this._y_location > (this.window.height/2 -300)){
                        return true;
                    }
                }
                
            }
        }
        return false;
    }


    //random is the randomnessLevel of the game
    move(random){
        if (Math.abs(this._speed_vector - this._ball_limits['speed_max']) < 1.5){
            setTimeout(()=>{
                this._speed_vector = this._ball_limits['speed_min'];
                this.slow_me();
            },5000); 
            
        }
        
        if (this.inMiddle() && this.getRandIntInclusive(1,100)===3 && random > 0){
            this.random_calc();
            return -2;
        }
         //returns 0 if ball goes out from left side of canvas
        if (this._x_location < -this._radius*2){
            //outOfBounds(false); // right side = true
            return 0;
        }

        //returns 1 if the ball goes out from the right side of the canvas
        else if  (this._x_location > (this.window.width+this._radius*2)){
            return  1;
            //outOfBounds(true);
        }
       

        if (this._y_location <= this._radius+1){
            this._y_speed = -this._y_speed;
            this._y_location+=this._y_speed+this._radius+1;
            
        }
        else if (this._y_location >= this.window.height - this._radius -1){
            this._y_speed = -this._y_speed;
            this._y_location+=this._y_speed-this._radius-1;
        }
        else{
            this._x_location+=this._x_speed;
            this._y_location+=this._y_speed;
        }

        //returns -1 if the ball is still in play
        return -1;
    }

    //function to return data of the ball to display on canvas
    getData(){
        this.data = {
            x_loc: this.x_location,
            y_loc: this.y_location,
            radius: this._radius,
            speed_vector: this._speed_vector,
            ballspeed: this._y_speed
            
        }
        return (this.data);
    }


    

    //random calculation of the angle 
    random_calc(){
        //pick an angle between 15 and 75 degrees (in rads)
        this._speed_vector = Math.sqrt(Math.pow(this._x_speed,2)+Math.pow(this._y_speed,2));
        this._angle = this.getRandDubInclusive(this._ball_limits["angle_max"], this._ball_limits["angle_min"]);
        
        this._y_speed = Math.floor(Math.abs(Math.sin(this._angle)*this._speed_vector));
        this._x_speed = Math.ceil(Math.abs(Math.cos(this._angle)*this._speed_vector));

        //set direction for each x and y (- or +):
        if (this.getRandIntInclusive(1,0) === 0){
            this._x_speed = -this._x_speed; //switch the sign
        } 
        if (this.getRandIntInclusive(1,0) === 0){
            this._y_speed = -this._y_speed; //switch the sign
        } 

    }




}