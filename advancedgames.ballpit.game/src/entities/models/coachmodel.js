/**
 * @author      Kevin Boogaard <{@link http://www.kevinboogaard.com/}>
 * @author      Alex Antonides <{@link http://www.alex-antonides.com/}>
 * @license     {@link https://github.com/kevinboogaard/Sports_World-Ball_Pit/blob/master/LICENSE}
 * @ignore
 */
var ballpit = ballpit || {};

/**
 * @namespace Event
 */
this.Event; // For documentation purposes.
ballpit.Event = ballpit.Event || {};

/**
 * @property {String} ON_TASK_BEGIN
 * @memberof Event
 * @readonly
 */
ballpit.Event.ON_TASK_BEGIN = "on_tast_begin";

/**
 * @property {String} ON_TASK_DONE
 * @memberof Event
 * @readonly
 */
ballpit.Event.ON_TASK_DONE = "on_task_done";

/**
 * @property {String} ON_STAGE_BEGIN
 * @memberof Event
 * @readonly
 */
ballpit.Event.ON_STAGE_BEGIN = "on_stage_begin";

/**
 * @property {String} ON_STAGE_DONE
 * @memberof Event
 * @readonly
 */
ballpit.Event.ON_STAGE_DONE = "on_stage_done";

/**
 * @property {String} ON_COACH_STATE_EMOTION_CHANGE
 * @memberof Event
 * @readonly
 */
ballpit.Event.ON_COACH_STATE_EMOTION_CHANGE = "on_coach_state_emotion_change";


ballpit.Coach = ballpit.Coach || {};

/**
 * @namespace CoachEmotions
 */
let CoachEmotions = {}; // For documentation purposes.
ballpit.Coach.Emotions = CoachEmotions; 

/**
 * @property {String} NEUTRAL
 * @memberof CoachEmotions
 * @readonly
 */
ballpit.Coach.Emotions.NEUTRAL = "neutral";

/**
 * @property {String} ANGRY
 * @memberof CoachEmotions
 * @readonly
 */
ballpit.Coach.Emotions.ANGRY = "angry";

/**
 * @property {String} HAPPY
 * @memberof CoachEmotions
 * @readonly
 */
ballpit.Coach.Emotions.HAPPY = "happy";

/**
 * @property {String} SUPER_ANGRY
 * @memberof CoachEmotions
 * @readonly
 */
ballpit.Coach.Emotions.SUPER_ANGRY = "super_angry";

/**
 * @property {String} SUPER_HAPPY
 * @memberof CoachEmotions
 * @readonly
 */
ballpit.Coach.Emotions.SUPER_HAPPY = "super_happy";

/**
 * @namespace CoachStates
 */
let CoachStates = {}; // For documentation purposes.
ballpit.Coach.States = CoachStates; 

/**
 * @property {String} IDLE
 * @memberof CoachStates
 * @readonly
 */
ballpit.Coach.States.IDLE = "idle";

/**
 * @property {String} WALK
 * @memberof CoachStates
 * @readonly
 */
ballpit.Coach.States.WALK = "walk";

/**
 * @property {String} TALK
 * @memberof CoachStates
 * @readonly
 */
ballpit.Coach.States.TALK = "talk";

ballpit.CoachModel = (function () {

    /**
     * @class CoachModel
     * @extends Entity
     * @constructor 
     * @param {Vector2} position
     * @param {TaskHandler} taskhandler
     */
    function CoachModel(position, taskhandler) {
        ADCore.Entity.call(this, position);

        /**
         * @property {Boolean} InTraining
         * @public
         * @readonly
         * @default false
         */
        this.inTraining = false;

        /**
         * @property {States} State
         * @public
         * @readonly
         * @default States.IDLE
         */
        this.state = ballpit.Coach.States.IDLE;

        /**
         * @property {Emotions} Emotion
         * @public
         * @readonly
         * @default Emotions.NEUTRAL
         */
        this.emotion = ballpit.Coach.Emotions.NEUTRAL;

        /**
         * @property {TaskHandler} _Taskhandler
         * @private
         */
        this._taskhandler = taskhandler;

        /**
         * @property {Array} _Tasks
         * @private
         * @default Empty
         */
        this._tasks = [];

        /**
         * @property {Stopwatch} _Stopwatch
         * @private
         */
        this._stopwatch = SetStopwatch();

        /**
         * @property {Integer} AmoundCombos
         * @public
         */
        this.amountCombos = 0;

        /**
         * @property {Integer} AmoundTasks
         * @public
         */
        this.amountTasks = 0;

        Listener.Listen(ballpit.Event.ON_BALL_ALIGN, this, this._onBallAlign.bind(this));
        Listener.Listen(ballpit.Event.ON_STAGE_BEGIN, this, this._onStageBegin.bind(this));
        Listener.Listen(ballpit.Event.ON_STAGE_DONE, this, this._onStageDone.bind(this));
    }
    CoachModel.prototype = Object.create(ADCore.Entity.prototype);
    CoachModel.prototype.constructor = CoachModel;
    var p = CoachModel.prototype;

    /**
     * @method Start
     * @memberof CoachModel
     * @public
     */
    p.Start = function () {
        this.inTraining = true;

        if (this._tasks.length === 0) {
            this._tasks = this._taskhandler.GetNewStage();
            Listener.Dispatch(ballpit.Event.ON_STAGE_BEGIN, this);
        }

        if(this._stopwatch) this._stopwatch.Start();
    };
    
    /**
     * @method Stop
     * @memberof CoachModel
     * @public
     */
    p.Stop = function () {
        this.inTraining = false;
        if(this._stopwatch) this._stopwatch.Stop();
    };
    
    /**
     * @method Reset
     * @memberof CoachModel
     * @public
     */
    p.Reset = function () {
        if (this._stopwatch) this._stopwatch.Reset();

        if (this.inTraining) {
            this._tasks = [];
            this.Start();
        } else {
            this._tasks = [];
            this.Stop();
        }
    };

    /**
     * @method _OnBallAlign
     * @memberof CoachModel
     * @private
     * @param {Object} caller
     * @param {Object} params
     * @param {TileModel} params.owner
     * @param {Array} params.aligned
     * @ignore
     */
    p._onBallAlign = function (caller, params) {
        if (this.inTraining === false) return;

        var current_task = this._tasks[0];
        var current_type = current_task.type;

        var type = params.owner.occupier.type;
        var amount = params.aligned.length + 1; // + 1 = owner.

        if (current_type === type) {
            current_task.amount -= amount;
            if (current_task.amount < 0) current_task.amount = 0;

            if (current_task.amount <= 0) {
                Listener.Dispatch(ballpit.Event.ON_TASK_DONE, this);
                this.amountTasks++;

                this._tasks.splice(0, 1);

                if (this._tasks.length === 0) {
                    Listener.Dispatch(ballpit.Event.ON_STAGE_DONE, this);

                    this.Stop();
                    this._stopwatch.Round();

                    setTimeout(function () {
                        this.Start();
                    }.bind(this), Settings.Game.DELAY_PER_ROUND * 1000);
                    return;
                }

                Listener.Dispatch(ballpit.Event.ON_TASK_BEGIN, this);
            }
        }

        this.amountCombos++;
    };

    /**
     * @method _OnStageBegin
     * @memberof CoachModel
     * @private
     * @ignore
     */
    p._onStageBegin = function () {
        this.emotion = ballpit.Coach.Emotions.NEUTRAL;
        this.state = ballpit.Coach.States.IDLE;
        Listener.Dispatch(ballpit.Event.ON_COACH_STATE_EMOTION_CHANGE, this);
    };
    
    /**
     * @method _OnStageDone
     * @memberof CoachModel
     * @private
     * @ignore
     */
    p._onStageDone = function () {
        this.emotion = ballpit.Coach.Emotions.HAPPY;
        this.state = ballpit.Coach.States.IDLE;
        Listener.Dispatch(ballpit.Event.ON_COACH_STATE_EMOTION_CHANGE, this);
    };
    
    /**
     * @method Dispose
     * @memberof CoachModel
     * @public
     */
    p.Dispose = function () {
        delete this.inTraining;
        delete this.state;
        delete this.emotion;
        delete this._taskhandler;
        delete this._tasks;

        ClearStopwtach(this._stopwatch);
        delete this._stopwatch;

        Listener.Mute(ballpit.Event.ON_BALL_ALIGN, this);
        Listener.Mute(ballpit.Event.ON_STAGE_BEGIN, this);
        Listener.Mute(ballpit.Event.ON_STAGE_DONE, this);
    };

    /**
     * Getters & Setters internal function.
     * 
     * @method GettersAndSetters
     * @memberof CoachModel
     * @private 
     * @ignore
     */
    p.__entity_gettersAndSetters = p.gettersAndSetters;
    p.gettersAndSetters = function () {
        this.Get( "activeTask", function () {
            return this._tasks[0];
        });
        this.__entity_gettersAndSetters();
    };

    return CoachModel;
})();