CachedDrawable = function() {
	Drawable.call(this);
	if (this.cacheWhenCreate) {
		this.toDrawable();
	}
};

CachedDrawable.prototype = new Drawable;

CachedDrawable.prototype.cacheWhenCreate = false;

CachedDrawable.prototype.toDrawable = function() {
	if (!this.isProcessed()) {
		try {
			let drawable = this.process();
			if (!this.isProcessed()) {
				if (drawable) this.describe(drawable);
				this.source = drawable;
			}
		} catch (e) {
			Logger.Log("Drawable: CachedDrawable.toDrawable: " + e, "WARNING");
		}
	}
	return this.source || null;
};

CachedDrawable.prototype.isProcessed = function() {
	return this.source !== undefined;
};

CachedDrawable.prototype.process = function() {
	MCSystem.throwException("Drawable: CachedDrawable.process must be implemented");
};

CachedDrawable.prototype.getDescriptor = function() {
	return this.descriptor || null;
};

CachedDrawable.prototype.setDescriptor = function(descriptor) {
	if (descriptor != null && typeof descriptor == "object") {
		this.descriptor = descriptor;
		this.requireDescribe();
	} else delete this.descriptor;
};

CachedDrawable.prototype.describe = function(drawable) {
	let descriptor = this.getDescriptor();
	if (descriptor != null) {
		Drawable.applyDescribe.call(this, drawable, descriptor);
	}
};

CachedDrawable.prototype.requireDescribe = function() {
	if (this.isProcessed()) {
		let drawable = this.toDrawable();
		if (drawable) this.describe(drawable);
		return;
	}
	this.toDrawable();
};

CachedDrawable.prototype.invalidate = function() {
	delete this.source;
	if (this.cacheWhenCreate) {
		this.toDrawable();
	}
	this.requestReattach();
};
