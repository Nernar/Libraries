let AnimationDrawableFactory = {
	setEnterFadeDuration(drawable, duration) {
		drawable.setEnterFadeDuration(Number(duration));
	},
	setExitFadeDuration(drawable, duration) {
		drawable.setExitFadeDuration(Number(duration));
	},
	setOneShot(drawable, enabled) {
		drawable.setOneShot(Boolean(enabled));
	}
};
