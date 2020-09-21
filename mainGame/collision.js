
module.exports =  function checkCollision (ball, paddle1, paddle2){ //paddle1 is the left paddle
    const Y_TOL = 5;
    let x_tol_max = 1 ;
    let ball_left = ball.x_location - ball.radius;
    let ball_right = ball.x_location + ball.radius;
    let ball_top = ball.y_location - ball.radius;
    let ball_bott = ball.y_location + ball.radius;

    //left paddle
    //split into 2 scenarios for each side for height. 
    //consider top of the ball for both top of paddle and under the paddle and bott for both as well. 
    if(ball_left >= paddle1.x_location && ball_left <= (paddle1.x_location+paddle1.paddleWidth+x_tol_max)){
        if (ball_top <= (paddle1.y_location+paddle1.paddleHeight+Y_TOL) && (ball_bott+Y_TOL) >= paddle1.y_location){ //wrong logic
            return 0;
        }
        
    }

    //right paddle
    if (ball_right <= (paddle2.x_location+paddle2.paddleWidth) && ball_right >= (paddle2.x_location-x_tol_max)){
        if (ball_top <= (paddle2.y_location +paddle2.paddleHeight+Y_TOL) && ball_bott >= (paddle2.y_location-Y_TOL)){ //wrong logic
            return 1;
        }
    }

    //no collision
     return -1;

}