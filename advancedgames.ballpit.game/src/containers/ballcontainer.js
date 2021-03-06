/**
 * @author      Kevin Boogaard <{@link http://www.kevinboogaard.com/}>
 * @author      Alex Antonides <{@link http://www.alex-antonides.com/}>
 * @license     {@link https://github.com/kevinboogaard/Sports_World-Ball_Pit/blob/master/LICENSE}
 * @ignore
 */
var ballpit = ballpit || {};

ballpit.BallContainer = (function () {

     /**
     * @class BallContainer
     * @constructor
     */
    function BallContainer() {
        /**
         * @property {Array} _Balls;
         * @private
         */
        this._balls = [];
    }
    var p = BallContainer.prototype;
    
     /**
     * @method Update
     * @memberof BallContainer
     * @public
     * @param {Integer} deltaTime
     */
    p.Update = function (deltaTime) {
        var len = this._balls.length;
        for (var i = len - 1; i >= 0; i--) {
            var ball = this._balls[i];
            ball.Update(deltaTime);
        }
    };

    /**
     * @method AddBall
     * @memberof BallContainer
     * @public
     * @param {Vector2} position - the position of the added ball
     * @param {type} type - The type of a ball
     * @return {BallModel}
     */
    p.AddBall = function(position, type){
        var ballModel = new ballpit.EntityFactory.AddBall(position,type);
        this._balls.push(ballModel);
        return ballModel;
    };

    /**
     * @method AddRandomBall
     * @memberof BallContainer
     * @public
     * @param {Vector2} position - the position of the added ball
     * @return {BallModel}
     */
    p.AddRandomBall = function (position) {
        var keys = Object.keys(ballpit.BallTypes);
        var randomType = ballpit.BallTypes[keys[ keys.length * Math.random() << 0]];

        return this.AddBall(position, randomType);
    };

    /**
     * @method AddRandomBall
     * @memberof BallContainer
     * @public
     * @param {Vector2} position - the position of the added ball
     * @param {type} type - The type of the ball
     * @param {Vector2} destination - The destination of the ball
     * @return {BallModel}
     */
    p.AddBallEffect = function (position, type, destination) {
        var ballEffect = this.AddBall(position.Clone(), type);
        
        ballEffect.anchorX = 0.5;
        ballEffect.anchorY = 0.5;
            
        TweenLite.to(ballEffect, 1, { x: destination.x, y: destination.y, angle: 360 });
        TweenLite.to(ballEffect, 1, { scaleX: 0, scaleY: 0, ease: Power3.easeIn });

        return ballEffect;
    };
    
    /**
     * @method RemoveBall
     * @memberof BallContainer
     * @public
     * @param {ball} ball
     */
    p.RemoveBall = function(ball){
        var index = this._balls.indexOf(ball);
        this._balls.splice(index, 1);

        ball.Destroy( function () { 
            Listener.Dispatch(ADCore.Event.ON_MODEL_REMOVE, this, { "model": ball});
            ball.Dispose();
        }.bind(this));
    };

    /*
     * @method Dispose
     * @memberof BallContainer
     * @public
     */
    p.Dispose = function() {
        var len = this._balls.length;
        for (var i = len-1; i >= 0; i--) {
            var ball = this._balls[i];
            ball.Dispose();
            Listener.Dispatch(ADCore.Event.ON_MODEL_REMOVE, this, { "model": ball });
            this._balls.splice(i, 1);
        }
        delete this._balls;
    };

    return BallContainer;
})();