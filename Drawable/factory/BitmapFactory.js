BitmapFactory = {};

BitmapFactory.decodeBytes = function(bytes, options) {
	try {
		if (options !== undefined) {
			return android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length, options);
		}
		return android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
	} catch (e) {
		Logger.Log("Drawable: BitmapFactory failed to decode bytes " + bytes, "WARNING");
	}
	return null;
};

BitmapFactory.decodeFile = function(path, options) {
	let file = path instanceof java.io.File ? path : new java.io.File(path);
	try {
		if (options !== undefined) {
			return android.graphics.BitmapFactory.decodeFile(file, options);
		}
		return android.graphics.BitmapFactory.decodeFile(file);
	} catch (e) {
		Logger.Log("Drawable: BitmapFactory failed to decode file " + file.getName(), "WARNING");
	}
	return null;
};

BitmapFactory.decodeAsset = function(path, options) {
	try {
		let file = new java.io.File(__dir__ + "assets", path);
		if (!file.exists() || file.isDirectory()) {
			file = new java.io.File(file.getPath() + ".dnr");
		}
		return this.decodeFile(file, options);
	} catch (e) {
		Logger.Log("Drawable: BitmapFactory failed to decode asset " + path, "WARNING");
	}
	return null;
};

BitmapFactory.createScaled = function(bitmap, dx, dy) {
	if (dy === undefined) dy = dx;
	let width = bitmap.getWidth(),
		height = bitmap.getHeight();
	bitmap = android.graphics.Bitmap.createBitmap(bitmap, 0, 0, width, height);
	if (dy === undefined) return bitmap;
	return android.graphics.Bitmap.createScaledBitmap(bitmap, dx, dy, false);
};
