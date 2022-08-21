BitmapDrawable = function(bitmap, options) {
	if (options !== undefined) {
		this.setOptions(options);
	}
	if (bitmap !== undefined) {
		this.setBitmap(bitmap);
	}
	ScheduledDrawable.call(this);
};

BitmapDrawable.prototype = new ScheduledDrawable;

BitmapDrawable.prototype.process = function() {
	let bitmap = this.getBitmap(),
		options = this.getOptions();
	if (bitmap != null) {
		bitmap = BitmapDrawableFactory.wrap(bitmap, options);
		if (!(bitmap instanceof android.graphics.Bitmap)) {
			bitmap = this.getCorruptedThumbnail();
			if (bitmap != null) {
				bitmap = BitmapDrawableFactory.wrap(bitmap, options);
			}
		}
		this.wrapped = bitmap;
	}
	if (bitmap == null) {
		return (this.wrapped = null);
	}
	return new android.graphics.drawable.BitmapDrawable(bitmap);
};

BitmapDrawable.prototype.describe = function(drawable) {
	if (drawable.getBitmap() == null) {
		return;
	}
	drawable.setFilterBitmap(false);
	drawable.setAntiAlias(false);
	ScheduledDrawable.prototype.describe.apply(this, arguments);
};

BitmapDrawable.prototype.getBitmap = function() {
	return this.bitmap || null;
};

BitmapDrawable.prototype.setBitmap = function(bitmap) {
	if (BitmapDrawableFactory.sameAs(this.bitmap, bitmap)) {
		return;
	}
	if (bitmap !== undefined) {
		this.bitmap = bitmap;
	} else delete this.bitmap;
	this.invalidate();
};

BitmapDrawable.prototype.getWrappedBitmap = function() {
	return this.wrapped || null;
};

BitmapDrawable.prototype.getOptions = function() {
	return this.options || null;
};

BitmapDrawable.prototype.setOptions = function(options) {
	if (options !== undefined) {
		this.options = options;
	} else delete this.options;
};

BitmapDrawable.prototype.getCorruptedThumbnail = function() {
	return this.corrupted !== undefined ? this.corrupted : "menuBoardWarning";
};

BitmapDrawable.prototype.setCorruptedThumbnail = function(bitmap) {
	if (BitmapDrawableFactory.sameAs(this.corrupted, bitmap)) {
		return;
	}
	if (bitmap !== undefined) {
		this.corrupted = bitmap;
	} else delete this.corrupted;
	this.invalidate();
};

BitmapDrawable.prototype.recycle = function() {
	let wrapped = this.getWrappedBitmap();
	if (wrapped != null) wrapped.recycle();
	delete this.wrapped;
};

BitmapDrawable.prototype.requestDeattach = function() {
	let state = ScheduledDrawable.prototype.requestDeattach.call(this);
	if (!this.isAttached()) {
		delete this.source;
		this.recycle();
		return true;
	}
	return state;
};

BitmapDrawable.prototype.toString = function() {
	return "[BitmapDrawable " + this.getBitmap() + "]";
};
