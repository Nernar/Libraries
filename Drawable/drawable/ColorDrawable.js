ColorDrawable = function(color) {
	if (color !== undefined) {
		this.setColor(color);
	}
	Drawable.call(this);
};

ColorDrawable.prototype = new Drawable;

ColorDrawable.prototype.toDrawable = function() {
	return new android.graphics.drawable.ColorDrawable(this.getColor());
};

ColorDrawable.prototype.getColor = function() {
	return this.color !== undefined ? this.color : android.graphics.Color.TRANSPARENT;
};

ColorDrawable.prototype.setColor = function(color) {
	if (color !== undefined) {
		this.color = ColorDrawable.parseColor(color);
	} else delete this.color;
	this.requestReattach();
};

ColorDrawable.prototype.toString = function() {
	return "[ColorDrawable " + this.getColor() + "]";
};

ColorDrawable.parseColor = function(value) {
	if (typeof value == "number") {
		return value;
	} else if (value) {
		let stroke = String(value);
		if (stroke.startsWith("#")) {
			return android.graphics.Color.parseColor(stroke);
		}
		stroke = stroke.toUpperCase();
		try {
			return android.graphics.Color[stroke];
		} catch (e) {
			// Not found
		}
	}
};
