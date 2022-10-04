/*

   Copyright 2018-2022 Nernar (github.com/nernar)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/
LIBRARY({
    name: "Transition",
    version: 1,
    shared: true,
    api: "AdaptedScript",
    dependencies: ["Retention:1"]
});
IMPORT("Retention:1");
/**
 * Used to create transitions: special
 * animations moving creatures in game.
 * @param {Object} params frames array
 * @param {number} params entity
 */
Transition = (function () {
    var identifier = 0;
    return function (params) {
        if (params) {
            if (typeof params == "object") {
                this.withFrames(params);
            }
            else if (typeof params == "number") {
                this.withEntity(params);
            }
            else
                MCSystem.throwException("Transition: Transition(object | number) allowed constructor");
        }
        this.id = "transition" + (identifier++);
    };
})();
Transition.prototype.frames = [];
Transition.prototype.fps = 60;
Transition.prototype.repointComparedVector = function (index, request) {
    var point = Transition.compareVectorPoint(this.frames[index], request);
    this.addPoint(point.x, point.y, point.z, point.yaw, point.pitch);
};
Transition.prototype.addFrame = function (x, y, z, yaw, pitch, duration, interpolator) {
    var request = this.fps * (duration > 0 ? duration : 1 / this.fps);
    if (interpolator != undefined) {
        this.frames.push([x / request, y / request, z / request, yaw / request, pitch / request, request, 1000 / this.fps, interpolator]);
    }
    else
        this.frames.push([x / request, y / request, z / request, yaw / request, pitch / request, request, 1000 / this.fps]);
    return this;
};
Transition.prototype.addPoint = function (x, y, z, yaw, pitch) {
    this.point[0] += x;
    this.point[1] += y;
    this.point[2] += z;
    this.point[3] += yaw;
    this.point[4] += pitch;
    return this;
};
Transition.prototype.getFrameCount = function () {
    return this.frames.length;
};
Transition.prototype.clearFrames = function () {
    this.frames = [];
};
Transition.prototype.getRelativePoint = function () {
    return {
        x: this.point[0] - this.starting[0],
        y: this.point[1] - this.starting[1],
        x: this.point[2] - this.starting[2],
        yaw: this.point[3] - this.starting[3],
        pitch: this.point[4] - this.starting[4]
    };
};
Transition.prototype.setPoint = function (x, y, z, yaw, pitch) {
    this.point = [x, y, z, yaw, pitch];
    return this;
};
Transition.prototype.setFramesPerSecond = function (limit) {
    if (limit <= 240 && limit > 0) {
        this.fps = limit;
    }
    else
        this.fps = 60;
    return this;
};
Transition.prototype.start = function () {
    if (!this.entity) {
        Logger.Log("Transition: Transition (id=" + this.id + ") withEntity(entity) must be called before start()", "ERROR");
        return;
    }
    if (!this.starting) {
        Logger.Log("Transition: Transition (id=" + this.id + ") withFrom(x, y, z, yaw, pitch) must be called before start()", "ERROR");
        return;
    }
    if (Transition.isTransitioning()) {
        return;
    }
    if (this.thread == undefined) {
        var scope_1 = Transition.currently = this;
        this.thread = handleThread(function () {
            try {
                var point = scope_1.point = scope_1.starting.slice();
                scope_1.__start && scope_1.__start(scope_1);
                Entity.setImmobile(scope_1.entity, true);
                for (var index = 0; index < scope_1.frames.length; index++) {
                    var frame = scope_1.frames[index];
                    for (var request = 0; request < frame[5]; request++) {
                        scope_1.repointComparedVector(index, request);
                        Entity.setPosition(scope_1.entity, point[0], point[1], point[2]);
                        Entity.setRotation(scope_1.entity, point[3], point[4]);
                        scope_1.__frame && scope_1.__frame(scope_1, index, request);
                        if (scope_1.thread) {
                            java.lang.Thread.sleep(frame[6]);
                        }
                        else {
                            index = scope_1.frames.length;
                            request = frame[5];
                        }
                        if (scope_1.thread.isInterrupted()) {
                            break;
                        }
                    }
                }
                Entity.setImmobile(scope_1.entity, false);
            }
            catch (e) {
                if (e.message == "java.lang.InterruptedException: null") {
                    return;
                }
                else if (e.message == "Cannot call method \"isInterrupted\" of undefined") {
                    return;
                }
                reportError(e);
            }
            delete Transition.currently;
            delete scope_1.thread;
            scope_1.__finish && scope_1.__finish(scope_1);
        });
    }
    return this;
};
Transition.prototype.stop = function () {
    Entity.setImmobile(this.entity, false);
    if (this.thread) {
        this.thread.interrupt();
    }
    delete this.thread;
    return this;
};
Transition.prototype.isStarted = function () {
    return !!this.thread;
};
Transition.prototype.withFrames = function (frames) {
    for (var i = 0; i < frames.length; i++) {
        this.addFrame(frames[i][0], frames[i][1], frames[i][2], frames[i][3], frames[i][4], frames[i][5], frames[i][6]);
    }
    return this;
};
Transition.prototype.withFrom = function (x, y, z, yaw, pitch) {
    this.starting = [x, y, z, yaw, pitch];
    return this;
};
Transition.prototype.withEntity = function (entity) {
    this.entity = entity;
    return this;
};
Transition.prototype.withOnStartListener = function (action) {
    this.__start = action;
    return this;
};
Transition.prototype.withOnFrameListener = function (action) {
    this.__frame = action;
    return this;
};
Transition.prototype.withOnFinishListener = function (action) {
    this.__finish = action;
    return this;
};
Transition.Interpolator = {};
Transition.Interpolator.LINEAR = 0;
Transition.Interpolator.ACCELERATE = 1;
Transition.Interpolator.DECELERATE = 2;
Transition.Interpolator.ACCELERATE_DECELERATE = 3;
Transition.compareVectorPoint = function (frame, request) {
    var center = frame[5] / 2, speedest = 1;
    switch (frame[7]) {
        case Transition.Interpolator.ACCELERATE:
            speedest = 2 * (request / frame[5]);
            break;
        case Transition.Interpolator.DECELERATE:
            speedest = 2 * ((frame[5] - request) / frame[5]);
            break;
        case Transition.Interpolator.ACCELERATE_DECELERATE:
            if (request > center) {
                speedest = 2 * (frame[5] - request) / center;
            }
            else
                speedest = 2 * (request / center);
            break;
    }
    return {
        x: frame[0] * speedest,
        y: frame[1] * speedest,
        z: frame[2] * speedest,
        yaw: frame[3] * speedest,
        pitch: frame[4] * speedest
    };
};
Transition.getCurrently = function () {
    return this.currently;
};
Transition.isTransitioning = function () {
    return !!this.getCurrently();
};
Callback.addCallback("LevelPreLeft", function () {
    if (Transition.isTransitioning()) {
        Transition.getCurrently().stop();
    }
});
EXPORT("Transition", Transition);
