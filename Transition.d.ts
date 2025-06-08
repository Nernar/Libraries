/**
 * Used to create transitions: special
 * animations moving creatures in game.
 * @param {Object} params frames array
 * @param {number} params entity
 */
declare function Transition(params: any): void;
declare class Transition {
    /**
     * Used to create transitions: special
     * animations moving creatures in game.
     * @param {Object} params frames array
     * @param {number} params entity
     */
    constructor(params: any);
    id: string;
    frames: any[];
    fps: any;
    repointComparedVector(index: any, request: any): void;
    addFrame(x: any, y: any, z: any, yaw: any, pitch: any, duration: any, interpolator: any): this;
    addPoint(x: any, y: any, z: any, yaw: any, pitch: any): this;
    getFrameCount(): number;
    clearFrames(): void;
    getRelativePoint(): {
        x: number;
        y: number;
        z: number;
        yaw: number;
        pitch: number;
    };
    setPoint(x: any, y: any, z: any, yaw: any, pitch: any): this;
    point: any[];
    setFramesPerSecond(limit: any): this;
    start(): this;
    thread: java.lang.Thread;
    stop(): this;
    isStarted(): boolean;
    withFrames(frames: any): this;
    withFrom(x: any, y: any, z: any, yaw: any, pitch: any): this;
    starting: any[];
    withEntity(entity: any): this;
    entity: any;
    withOnStartListener(action: any): this;
    __start: any;
    withOnFrameListener(action: any): this;
    __frame: any;
    withOnFinishListener(action: any): this;
    __finish: any;
}
declare namespace Transition {
    let uid: number;
    let currently: any;
    namespace Interpolator {
        let LINEAR: number;
        let ACCELERATE: number;
        let DECELERATE: number;
        let ACCELERATE_DECELERATE: number;
    }
    function compareVectorPoint(frame: any, request: any): {
        x: number;
        y: number;
        z: number;
        yaw: number;
        pitch: number;
    };
    function getCurrently(): any;
    function isTransitioning(): boolean;
}
