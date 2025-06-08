let HashedDrawableMap = {
	attachedViews: {},
	attachedAsImage: {},
	attachedAsBackground: {},
	isImageAttachedToView(view) {
		return this.attachedAsImage.hasOwnProperty(view);
	},
	isBackgroundAttachedToView(view) {
		return this.attachAsBackground.hasOwnProperty(view);
	},
	isAttachedToView(view) {
		if (this.attachedViews.hasOwnProperty(view)) {
			if (view && view.isAttachedToWindow) {
				return view.isAttachedToWindow();
			}
			// That's not view, right?
			return true;
		}
		return false;
	},
	getDrawableAttachedToViewAsImage(view) {
		return this.attachedAsImage[view] || null;
	},
	getDrawableAttachedToViewAsBackground(view) {
		return this.attachedAsBackground[view] || null;
	},
	getDrawablesAttachedToView(view) {
		let image = this.getDrawableAttachedToViewAsImage(view),
			background = this.getDrawableAttachedToViewAsBackground(view);
		if (image != background) return [image, background];
		return [image];
	},
	getAttachedViewsInMap(map, drawable) {
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
	},
	getAsImageAttachedViews(drawable) {
		return this.getAttachedViewsInMap(this.attachedAsImage, drawable);
	},
	getAsBackgroundAttachedViews(drawable) {
		return this.getAttachedViewsInMap(this.attachedAsBackground, drawable);
	},
	getAttachedViews(drawable) {
		return this.getAsImageAttachedViews(drawable).concat
			(this.getAsBackgroundAttachedViews(drawable));
	},
	attachInMap(map, view, drawable) {
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
	},
	attachAsImage(view, drawable) {
		return this.attachInMap(this.attachedAsImage, view, drawable);
	},
	attachAsBackground(view, drawable) {
		return this.attachInMap(this.attachedAsBackground, view, drawable);
	},
	deattachInMap(map, view) {
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
	},
	deattachAsImage(view) {
		return this.deattachInMap(this.attachedAsImage, view);
	},
	deattachAsBackground(view) {
		return this.deattachInMap(this.attachedAsBackground, view);
	}
};
