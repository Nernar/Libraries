let DrawableFactory = {
	setAlpha(drawable, alpha) {
		drawable.setAlpha(Number(alpha));
	},
	setAntiAlias(drawable, enabled) {
		drawable.setAntiAlias(Boolean(enabled));
	},
	setAutoMirrored(drawable, enabled) {
		drawable.setAutoMirrored(Boolean(enabled));
	},
	setFilterBitmap(drawable, enabled) {
		drawable.setFilterBitmap(Boolean(enabled));
	},
	setTintColor(drawable, color) {
		color = ColorDrawable.parseColor(color);
		if (android.os.Build.VERSION.SDK_INT >= 29) {
			// @ts-expect-error
			let filter = new android.graphics.BlendModeColorFilter(color, android.graphics.BlendMode.SRC_ATOP);
			drawable.setColorFilter(filter);
			return;
		}
		drawable.setColorFilter(color, android.graphics.PorterDuff.Mode.SRC_ATOP);
	},
	setMipMap(drawable, enabled) {
		drawable.setMipMap(Boolean(enabled));
	},
	setColorFilter(drawable, filter) {
		drawable.setColorFilter(filter);
	},
	setTileMode(drawable, modesOrX, y) {
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
	},
	setGravity(drawable, gravity) {
		drawable.setGravity(Number(gravity));
	},
	setLayoutDirection(drawable, direction) {
		drawable.setLayoutDirection(Number(direction));
	},
	setXfermode(drawable, mode) {
		drawable.setXfermode(mode);
	},
	setLevel(drawable, level) {
		return drawable.setLevel(Number(level));
	},
	setState(drawable, states) {
		if (!Array.isArray(states)) states = [states];
		states = states.map(function(state) {
			return Number(state);
		});
		return drawable.setState(states);
	},
	setVisible(drawable, first, second) {
		if (Array.isArray(first)) {
			second = first[1];
			first = first[0];
		}
		if (second === undefined) {
			second = first;
		}
		return drawable.setVisible(Boolean(first), Boolean(second));
	}
};
