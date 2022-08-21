Drawable = new Function();

Drawable.prototype.isAttachedAsImage = function(view) {
	if (!view) return HashedDrawableMap.getAsImageAttachedViews(this).length > 0;
	return HashedDrawableMap.getDrawableAttachedToViewAsImage(view) == this;
};

Drawable.prototype.isAttachedAsBackground = function(view) {
	if (!view) return HashedDrawableMap.getAsBackgroundAttachedViews(this).length > 0;
	return HashedDrawableMap.getDrawableAttachedToViewAsBackground(view) == this;
};

Drawable.prototype.isAttached = function(view) {
	if (!view) return HashedDrawableMap.getAttachedViews(this).length > 0;
	return HashedDrawableMap.getDrawablesAttachedToView(view).indexOf(this) != -1;
};

Drawable.prototype.toDrawable = function() {
	return null;
};

Drawable.prototype.attachAsImage = function(view, force) {
	if (view && view.setImageDrawable !== undefined) {
		if (force || HashedDrawableMap.attachAsImage(view, this)) {
			view.setImageDrawable(this.toDrawable());
			return true;
		}
	}
	return false;
};

Drawable.prototype.deattachAsImage = function(view) {
	if (view && view.setImageDrawable !== undefined) {
		if (HashedDrawableMap.getDrawableAttachedToViewAsImage(view) == this) {
			if (HashedDrawableMap.deattachAsImage(view)) {
				view.setImageDrawable(null);
				return true;
			}
		}
		return false;
	}
	let attached = HashedDrawableMap.getAsImageAttachedViews(this);
	for (let i = 0; i < attached.length; i++) {
		this.deattachAsImage(attached[i]);
	}
	return attached.length > 0;
};

Drawable.prototype.attachAsBackground = function(view, force) {
	if (view && view.setBackgroundDrawable !== undefined) {
		if (force || HashedDrawableMap.attachAsBackground(view, this)) {
			view.setBackgroundDrawable(this.toDrawable());
			return true;
		}
	}
	return false;
};

Drawable.prototype.deattachAsBackground = function(view) {
	if (view && view.setBackgroundDrawable !== undefined) {
		if (HashedDrawableMap.getDrawableAttachedToViewAsBackground(view) == this) {
			if (HashedDrawableMap.deattachAsBackground(view)) {
				view.setBackgroundDrawable(null);
				return true;
			}
		}
		return false;
	}
	let attached = HashedDrawableMap.getAsBackgroundAttachedViews(this);
	for (let i = 0; i < attached.length; i++) {
		this.deattachAsBackground(attached[i]);
	}
	return attached.length > 0;
};

Drawable.prototype.requestDeattach = function(view) {
	let deattached = this.deattachAsImage(view);
	return this.deattachAsBackground(view) || deattached;
};

Drawable.prototype.reattachAsImage = function(view) {
	if (view && view.setImageDrawable !== undefined) {
		return this.attachAsImage(view, true);
	}
	let attached = HashedDrawableMap.getAsImageAttachedViews(this);
	for (let i = 0; i < attached.length; i++) {
		this.attachAsImage(attached[i], true);
	}
	return attached.length > 0;
};

Drawable.prototype.reattachAsBackground = function(view) {
	if (view && view.setBackgroundDrawable !== undefined) {
		return this.attachAsBackground(view, true);
	}
	let attached = HashedDrawableMap.getAsBackgroundAttachedViews(this);
	for (let i = 0; i < attached.length; i++) {
		this.attachAsBackground(attached[i], true);
	}
	return attached.length > 0;
};

Drawable.prototype.requestReattach = function(view) {
	let attached = this.reattachAsImage(view);
	return this.reattachAsBackground(view) || attached;
};

Drawable.prototype.toString = function() {
	return "[Drawable " + this.toDrawable() + "]";
};
