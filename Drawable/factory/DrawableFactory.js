DrawableFactory = {};

DrawableFactory.setAlpha = function(drawable, alpha) {
	drawable.setAlpha(Number(alpha));
};

DrawableFactory.setAntiAlias = function(drawable, enabled) {
	drawable.setAntiAlias(Boolean(enabled));
};

DrawableFactory.setAutoMirrored = function(drawable, enabled) {
	drawable.setAutoMirrored(Boolean(enabled));
};

DrawableFactory.setFilterBitmap = function(drawable, enabled) {
	drawable.setFilterBitmap(Boolean(enabled));
};

DrawableFactory.setTintColor = function(drawable, color) {
	color = ColorDrawable.parseColor(color);
	if (android.os.Build.VERSION.SDK_INT >= 29) {
		let filter = new android.graphics.BlendModeColorFilter(color, android.graphics.BlendMode.SRC_ATOP);
		drawable.setColorFilter(filter);
		return;
	}
	drawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_ATOP);
};

DrawableFactory.setMipMap = function(drawable, enabled) {
	drawable.setMipMap(Boolean(enabled));
};

DrawableFactory.setColorFilter = function(drawable, filter) {
	drawable.setColorFilter(filter);
};

DrawableFactory.setTileMode = function(drawable, modesOrX, y) {
	if (Array.isArray(modesOrX)) {
		y = modesOrX[1];
		modesOrX = modesOrX[0];
	}
	if (modesOrX === undefined) {
		modesOrX = android.graphics.Shader.TileMode.CLAMP;
	}
	if (y !== undefined) {
		drawable.setTileModeX(modesOrX);
		drawable.setTileModeY(y);
		return;
	}
	drawable.setTileModeXY(modesOrX);
};

DrawableFactory.setGravity = function(drawable, gravity) {
	drawable.setGravity(Number(gravity));
};

DrawableFactory.setLayoutDirection = function(drawable, direction) {
	drawable.setLayoutDirection(Number(direction));
};

DrawableFactory.setXfermode = function(drawable, mode) {
	drawable.setXfermode(mode);
};

DrawableFactory.setLevel = function(drawable, level) {
	return drawable.setLevel(Number(level));
};

DrawableFactory.setState = function(drawable, states) {
	if (!Array.isArray(states)) states = [states];
	states = states.map(function(state) {
		return Number(state);
	});
	return drawable.setState(states);
};

DrawableFactory.setVisible = function(drawable, first, second) {
	if (Array.isArray(first)) {
		second = first[1];
		first = first[0];
	}
	if (second === undefined) {
		second = first;
	}
	return drawable.setVisible(Boolean(first), Boolean(second));
};
