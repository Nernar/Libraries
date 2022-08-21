/**
 * @constructor
 * Loads a stream to file.
 * @param {string} [address] address
 * @param {string} [path] file path
 */
Connectivity.Downloader = function(address, path) {
	address && this.setAddress(address);
	path && this.setPath(path);
};

Connectivity.Downloader.prototype = new Connectivity.Writer;

/**
 * Returns currently specified file.
 * @returns {Object|null} java file
 */
Connectivity.Downloader.prototype.getFile = function() {
	return this.file || null;
};

/**
 * Sets java file to stream.
 * If argument isn't given, removes it.
 * @param {Object|null} file java file
 */
Connectivity.Downloader.prototype.setFile = function(file) {
	if (file) {
		this.file = file;
	} else delete this.file;
	if (this.callback.hasOwnProperty("onFileChanged")) {
		this.callback.onFileChanged.call(this, file);
	}
};

/**
 * Returns currently file path.
 * Returns [[null]] if file isn't specified.
 * @returns {string|null} specified path
 */
Connectivity.Downloader.prototype.getPath = function() {
	let file = this.getFile();
	return file ? file.getPath() : null;
};

/**
 * Sets path to file, replaces current file.
 * @param {string} path file path
 */
Connectivity.Downloader.prototype.setPath = function(path) {
	let file = new java.io.File(path);
	if (file) this.setFile(file);
};

/**
 * Returns output stream from file.
 * If file isn't specified, will return [[null]].
 * @returns {Object|null} output stream
 */
Connectivity.Downloader.prototype.getOutputStream = function() {
	let file = this.getFile();
	if (!file) return null;
	if (!file.exists()) {
		file.getParentFile().mkdirs();
		file.createNewFile();
	}
	let stream = new java.io.FileOutputStream(file);
	if (!stream) return null;
	return new java.io.BufferedOutputStream(stream);
};
