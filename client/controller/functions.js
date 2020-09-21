/*
Author: Amritpal Chera
Date: 08-04-2020
Description: This files includes functions to send data to server and to display data onto the canvas
*/
export default class functions {
    constructor(socket){
        this.socket = socket; //makes socket available to the rest of the class
        this.data =  null; //data coming in
    }

    //hides an array of elements
    hideMultiple(element){
        if(element.length >1){
            element.forEach(element1 => {
                element1.style.display = "none";
            });
        }    
    }

    //hides a single element
    hide (element){
        element.style.display = "none";
    }

    //shows an array of elements
    showMultiple(element){
        if(element.length > 1){
            element.forEach(element1=>{
                element1.style.display = "flex";
            })
        }   
    }
    //shows a single element
    show(element){
        element.style.display = "flex";
    }

    //sends data to the server
    sendData(message, data){
        this.socket.emit(message, data);
    }

    //draws a circle (ball)
    drawCircle(ctx, _x_loc, _y_loc, _radius, _speed_vector){
        ctx.beginPath();
        ctx.arc(_x_loc, _y_loc, _radius, 0, 2*Math.PI);
        if (_speed_vector < 4)
            ctx.fillStyle = "#B6FF33";
        else if (_speed_vector < 8)
            ctx.fillStyle = "#FF9900";
        else{
            ctx.fillStyle = ctx.createPattern(document.getElementById("ball"), "repeat");
        }
        ctx.fill();

    }
    //draws a rectangle (paddles)
    drawRect(ctx, _x_loc, _y_loc, ballSpeed, _paddleHeight, _paddleWidth){
        ctx.fillStyle = "#2DF4FF";

        if (ballSpeed > 9){
            let grd = ctx.createLinearGradient(_x_loc, _y_loc,(_x_loc+_paddleWidth), (_y_loc+_paddleHeight));
            grd.addColorStop(0,"#FF00D4");
            grd.addColorStop(0.5, "#00FFCC");
            grd.addColorStop(1, "#FF0000");
            ctx.fillStyle = grd;

            ctx.strokeStyle = "white";
            ctx.lineWidth = 3;
            ctx.strokeRect(_x_loc,_y_loc,_paddleWidth,_paddleHeight);
        }
        else if(ballSpeed > 6){
            ctx.fillStyle = "yellow";
        } 
        ctx.fillRect(_x_loc,_y_loc,_paddleWidth,_paddleHeight);
    
    }

    clearRect(ctx,_x_loc,_y_loc,width ,height){
        ctx.clearRect(_x_loc,_y_loc,width ,height);
    }

    drawImg (ctx, img, _x_loc, _y_loc, width, height){
        ctx.drawImage(img, _x_loc, _y_loc, width, height);
    }
    
    //distributes the coming in data to the respective functions
    //data = {ball: {x_loc: num, y_loc: num, ....}, racq1 : {x_loc: num, y_loc: num, ....}, points: {player1: 1, player2: 1}}
    draw(ctx ,data, writeData ){
        ctx.clearRect(0,0,1000,500);
        this.drawCircle(ctx,data['ball'].x_loc, data['ball'].y_loc, data['ball'].radius, data['ball'].speed_vector);
        this.drawRect(ctx,data['player1'].x_loc, data['player1'].y_loc, data['ball'].speed_vector, data['player1'].paddleHeight, data['player1'].paddleWidth);
        this.drawRect(ctx,data['player2'].x_loc, data['player2'].y_loc, data['ball'].speed_vector, data['player2'].paddleHeight, data['player2'].paddleWidth);
        this.write1(ctx, writeData);
    }

    write(ctx, text, _x_loc, _y_loc){
        ctx.clearRect(0,0,1000, 500);
        ctx.fillText(text, _x_loc, _y_loc);
    }

    
    write1 (ctx,data){
        for (var element in data){ 
            if (data[element]){
                ctx.fillText(data[element].text, data[element].x_loc, data[element].y_loc);
            }
           

        }
       
    }
    setFillStyle(ctx,fillstyle){
        ctx.fillStyle = fillstyle;
    }
    setFont (ctx, font){
        ctx.font = font;
    }
    
    
}

