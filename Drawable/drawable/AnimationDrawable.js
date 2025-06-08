function AnimationDrawable(frames) {
	this.clearFrames();
	if (frames !== undefined) {
		this.addFrames(frames);
	}
	ScheduledDrawable.call(this);
}

AnimationDrawable.prototype = new ScheduledDrawable;

AnimationDrawable.prototype.describe = function(where) {
	if (where.getNumberOfFrames() > 0) {
		this.invalidate();
		return;
	}
	ScheduledDrawable.prototype.describe.apply(this, arguments);
	let descriptor = this.getDescriptor();
	if (descriptor != null) {
		AnimationDrawable.applyDescribe.call(this, drawable, descriptor);
	}
	let basic = this.getDefaultDuration();
	if (this.isStartingWhenProcess()) this.start();
	for (let i = 0; i < this.getFrameCount(); i++) {
		let frame = this.getFrameAt(i),
			drawable = frame.getDrawable();
		if (drawable instanceof ScheduledDrawable) {
			if (!drawable.isProcessed()) {
				drawable.toDrawable();
				while (drawable.isProcessing()) {
					java.lang.Thread.yield();
				}
			}
		}
		if (drawable instanceof Drawable) {
			drawable = drawable.toDrawable();
		}
		let duration = frame.getDuration();
		if (!(duration > 0)) duration = basic;
		where.addFrame(drawable, duration);
	}
	if (this.isStoppingWhenCompleted()) this.stop();
	else if (!this.isStartingWhenProcess()) this.start();
};

AnimationDrawable.prototype.process = function() {
	return new android.graphics.drawable.AnimationDrawable();
};

AnimationDrawable.prototype.clearFrames = function() {
	this.frames = [];
	this.requireDescribe();
};

AnimationDrawable.prototype.getFrames = function() {
	return this.frames;
};

AnimationDrawable.prototype.getFrameCount = function() {
	return this.getFrames().length;
};

AnimationDrawable.prototype.indexOfFrame = function(frame) {
	if (!(frame instanceof AnimationDrawable.Frame)) {
		for (let i = 0; i < this.getFrameCount(); i++) {
			let drawable = this.getFrameAt(i);
			if (drawable == frame) return i;
		}
	}
	return this.getFrames().indexOf(frame);
};

AnimationDrawable.prototype.getFrameAt = function(index) {
	return this.getFrames()[index] || null;
};

AnimationDrawable.prototype.addFrame = function(frame, duration) {
	if (!(frame instanceof AnimationDrawable.Frame)) {
		frame = new AnimationDrawable.Frame(frame, duration);
	}
	this.getFrames().push(frame);
	this.requireDescribe();
};

AnimationDrawable.prototype.addFrames = function(frames, duration) {
	if (!Array.isArray(frames)) frames = [frames];
	frames = frames.slice().map(function(element) {
		if (!(element instanceof AnimationDrawable.Frame)) {
			return new AnimationDrawable.Frame(element, duration);
		}
		return element;
	});
	this.frames = this.getFrames().concat(frames);
	this.requireDescribe();
};

AnimationDrawable.prototype.hasFrame = function(frame) {
	return this.indexOfFrame(frame) != -1;
};

AnimationDrawable.prototype.removeFrame = function(frame) {
	let index = this.indexOfFrame(frame);
	if (index == -1) return;
	this.getFrames().splice(index, 1);
	this.requireDescribe();
};

AnimationDrawable.prototype.getCurrentIndex = function() {
	return this.isProcessed() ? this.toDrawable().getCurrentIndex() : 0;
};

AnimationDrawable.prototype.setCurrentIndex = function(index) {
	if (this.isProcessed()) {
		this.toDrawable().setCurrentIndex(Number(index));
	}
};

AnimationDrawable.prototype.isRunning = function() {
	return this.isProcessed() ? this.toDrawable().isRunning() : false;
};

AnimationDrawable.prototype.start = function() {
	if (this.isProcessed()) {
		this.toDrawable().start();
		return true;
	}
	return false;
};

AnimationDrawable.prototype.stop = function() {
	if (this.isProcessed()) {
		this.toDrawable().stop();
		return true;
	}
	return false;
};

AnimationDrawable.prototype.getDefaultDuration = function() {
	return this.duration > 0 ? this.duration : 1000;
};

AnimationDrawable.prototype.setDefaultDuration = function(duration) {
	this.duration = Number(duration);
	this.requireDescribe();
};

AnimationDrawable.prototype.isStartingWhenProcess = function() {
	return this.starting != undefined ? this.starting : false;
};

AnimationDrawable.prototype.setIsStartingWhenProcess = function(enabled) {
	this.starting = Boolean(enabled);
	this.requireDescribe();
};

AnimationDrawable.prototype.isStoppingWhenCompleted = function() {
	return this.stopping != undefined ? this.stopping : false;
};

AnimationDrawable.prototype.setIsStoppingWhenCompleted = function(enabled) {
	this.stopping = Boolean(enabled);
	this.requireDescribe();
};

AnimationDrawable.prototype.toString = function() {
	return "[AnimationDrawable " + this.getFrames() + "]";
};

AnimationDrawable.Frame = function(drawable, duration) {
	if (drawable !== undefined) {
		this.setDrawable(drawable);
	}
	if (duration > 0) {
		this.setDuration(duration);
	}
};

AnimationDrawable.Frame.prototype.getDrawable = function() {
	return this.drawable || null;
};

AnimationDrawable.Frame.prototype.setDrawable = function(drawable) {
	if (drawable !== undefined) {
		this.drawable = drawable;
	} else delete this.drawable;
};

AnimationDrawable.Frame.prototype.getDuration = function() {
	return this.duration || 0;
};

AnimationDrawable.Frame.prototype.setDuration = function(duration) {
	this.duration = Number(duration);
};

AnimationDrawable.Frame.prototype.toString = function() {
	return "[Frame " + this.getDrawable() + "@" + this.getDuration() + "]";
};
