ScheduledDrawable = function() {
	CachedDrawable.call(this);
};

ScheduledDrawable.prototype = new CachedDrawable;

ScheduledDrawable.prototype.toDrawable = function() {
	let self = this;
	if (!this.isProcessed() && !this.isProcessing()) {
		let thread = this.thread = handleThread(function() {
			if (self.getThread() == thread) {
				self.toDrawableInThread();
			}
			if (self.getThread() == thread) {
				handle(function() {
					if (self.isProcessed()) {
						self.requestReattach();
					}
				});
				delete self.thread;
			}
		});
	}
	return this.source || null;
};

ScheduledDrawable.prototype.toDrawableInThread = function() {
	return CachedDrawable.prototype.toDrawable.call(this);
};

ScheduledDrawable.prototype.getThread = function() {
	return this.thread || null;
};

ScheduledDrawable.prototype.isProcessing = function() {
	return this.thread !== undefined;
};

ScheduledDrawable.prototype.invalidate = function() {
	if (this.isProcessing()) {
		this.getThread().interrupt();
		delete this.thread;
	}
	CachedDrawable.prototype.invalidate.apply(this, arguments);
};

ScheduledDrawable.prototype.toString = function() {
	return "[ScheduledDrawable object]";
};
