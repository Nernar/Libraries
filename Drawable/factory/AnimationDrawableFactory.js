AnimationDrawableFactory = {};

AnimationDrawableFactory.setEnterFadeDuration = function(drawable, duration) {
	drawable.setEnterFadeDuration(Number(duration));
};

AnimationDrawableFactory.setExitFadeDuration = function(drawable, duration) {
	drawable.setExitFadeDuration(Number(duration));
};

AnimationDrawableFactory.setOneShot = function(drawable, enabled) {
	drawable.setOneShot(Boolean(enabled));
};
