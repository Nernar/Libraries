HashedDrawableMap = {};
HashedDrawableMap.attachedViews = {};
HashedDrawableMap.attachedAsImage = {};
HashedDrawableMap.attachedAsBackground = {};

HashedDrawableMap.isImageAttachedToView = function(view) {
	return this.attachedAsImage.hasOwnProperty(view);
};

HashedDrawableMap.isBackgroundAttachedToView = function(view) {
	return this.attachAsBackground.hasOwnProperty(view);
};

HashedDrawableMap.isAttachedToView = function(view) {
	if (this.attachedViews.hasOwnProperty(view)) {
		if (view && view.isAttachedToWindow) {
			return view.isAttachedToWindow();
		}
		// That's not view, right?
		return true;
	}
	return false;
};

HashedDrawableMap.getDrawableAttachedToViewAsImage = function(view) {
	return this.attachedAsImage[view] || null;
};

HashedDrawableMap.getDrawableAttachedToViewAsBackground = function(view) {
	return this.attachedAsBackground[view] || null;
};

HashedDrawableMap.getDrawablesAttachedToView = function(view) {
	let image = this.getDrawableAttachedToViewAsImage(view),
		background = this.getDrawableAttachedToViewAsBackground(view);
	if (image != background) return [image, background];
	return [image];
};

HashedDrawableMap.getAttachedViewsInMap = function(map, drawable) {
	let attached = [];
	if (map == null || typeof map != "object") {
		return attached;
	}
	for (let element in map) {
		if (map[element] == drawable) {
			let view = this.attachedViews[element];
			if (view != null) attached.push(view);
		}
	}
	return attached;
};

HashedDrawableMap.getAsImageAttachedViews = function(drawable) {
	return this.getAttachedViewsInMap(this.attachedAsImage, drawable);
};

HashedDrawableMap.getAsBackgroundAttachedViews = function(drawable) {
	return this.getAttachedViewsInMap(this.attachedAsBackground, drawable);
};

HashedDrawableMap.getAttachedViews = function(drawable) {
	return this.getAsImageAttachedViews(drawable).concat
		(this.getAsBackgroundAttachedViews(drawable));
};

HashedDrawableMap.attachInMap = function(map, view, drawable) {
	let attached = false;
	if (!this.isAttachedToView(view)) {
		this.attachedViews[view] = view;
		attached = true;
	}
	if (!map.hasOwnProperty(view) || map[view] != drawable) {
		map[view] = drawable;
		return true;
	}
	return attached;
};

HashedDrawableMap.attachAsImage = function(view, drawable) {
	return this.attachInMap(this.attachedAsImage, view, drawable);
};

HashedDrawableMap.attachAsBackground = function(view, drawable) {
	return this.attachInMap(this.attachedAsBackground, view, drawable);
};

HashedDrawableMap.deattachInMap = function(map, view) {
	let deattached = false;
	if (map.hasOwnProperty(view)) {
		delete map[view];
		deattached = true;
	}
	if (!this.isAttachedToAsImage(view) && !this.isAttachedToAsBackground(view)) {
		delete this.attachedViews[view];
		return true;
	}
	return deattached;
};

HashedDrawableMap.deattachAsImage = function(view) {
	return this.deattachInMap(this.attachedAsImage, view);
};

HashedDrawableMap.deattachAsBackground = function(view) {
	return this.deattachInMap(this.attachedAsBackground, view);
};
