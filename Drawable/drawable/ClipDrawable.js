ClipDrawable = function(drawable, location, side) {
	if (drawable !== undefined) {
		this.setDrawable(drawable);
	}
	if (location !== undefined) {
		this.setLocation(location);
	}
	if (side !== undefined) {
		this.setSide(side);
	}
	ScheduledDrawable.call(this);
};

ClipDrawable.prototype = new ScheduledDrawable;

ClipDrawable.prototype.process = function() {
	let drawable = this.getDrawable();
	if (drawable !== undefined) {
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
	}
	return new android.graphics.drawable.ClipDrawable(drawable, this.getLocation(), this.getSide());
};

ClipDrawable.prototype.getDrawable = function() {
	return this.drawable !== undefined ? this.drawable : null;
};

ClipDrawable.prototype.setDrawable = function(drawable) {
	if (drawable !== undefined) {
		this.drawable = drawable;
	} else delete this.drawable;
	this.invalidate();
};

ClipDrawable.prototype.getLocation = function() {
	return this.location !== undefined ? this.location : android.view.Gravity.LEFT;
};

ClipDrawable.prototype.setLocation = function(location) {
	this.location = Number(location);
	this.invalidate();
};

ClipDrawable.prototype.getSide = function() {
	return this.side !== undefined ? this.side : ClipDrawable.Side.HORIZONTAL;
};

ClipDrawable.prototype.setSide = function(side) {
	if (typeof side == "string") {
		if (ClipDrawable.Side.hasOwnProperty(side)) {
			side = ClipDrawable.Side[side];
		}
	}
	this.side = Number(side);
	this.invalidate();
};

ClipDrawable.prototype.toString = function() {
	return "[ClipDrawable " + this.getDrawable() + "@" + this.getLocation() + ":" + this.getSide() + "]";
};

ClipDrawable.Side = {};
ClipDrawable.Side.HORIZONTAL = 1;
ClipDrawable.Side.VERTICAL = 2;
