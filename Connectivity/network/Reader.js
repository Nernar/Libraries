/**
 * @constructor
 * Creates a connection to read text data.
 * @param {string} [address] address
 */
Connectivity.Reader = function(address) {
	address && this.setAddress(address);
};

Connectivity.Reader.prototype = new Connectivity;
Connectivity.Reader.prototype.charset = "UTF-8";

/**
 * Returns current charset of being read data.
 * @returns {string|null} charset
 */
Connectivity.Reader.prototype.getCharset = function() {
	return this.charset || null;
};

/**
 * Sets charset for new connections.
 * If charset is [[null]], system encoding will be used.
 * @param {string|null} character encoding
 * See {@link https://wikipedia.org/wiki/Character_encoding|character encoding} for more details.
 */
Connectivity.Reader.prototype.setCharset = function(charset) {
	if (charset) {
		this.charset = charset;
	} else delete this.charset;
	if (this.callback.hasOwnProperty("onCharsetChanged")) {
		this.callback.onCharsetChanged.call(this, this.charset);
	}
};

/**
 * Returns stream reader, or [[null]] if create failed.
 * @returns {Object|null} java stream reader
 */
Connectivity.Reader.prototype.getStreamReader = function() {
	let stream = this.getStream();
	if (!stream) return null;
	let charset = this.getCharset();
	if (!charset) {
		return new java.io.InputStreamReader(stream);
	}
	return new java.io.InputStreamReader(stream, charset);
};

/**
 * Returns [[true]] if read process is running.
 * @returns {boolean} in process
 */
Connectivity.Reader.prototype.inProcess = function() {
	return !!this.processing;
};

/**
 * Returns currently read data as an array.
 * Returns [[null]] if read process hasn't been started.
 * @returns {Object|null} readed array
 */
Connectivity.Reader.prototype.getCurrentlyReaded = function() {
	return this.result || null;
};

/**
 * Returns number of readed lines.
 * Returns [[-1]] if there is no connection.
 * @returns {number} readed lines count
 */
Connectivity.Reader.prototype.getReadedCount = function() {
	let readed = this.getCurrentlyReaded();
	return readed ? readed.length : -1;
};

/**
 * Returns readed result, or [[null]] if none.
 * @returns {string|null} result
 */
Connectivity.Reader.prototype.getResult = function() {
	let readed = this.getCurrentlyReaded();
	if (!readed) return null;
	return readed.join("\n");
};

/**
 * Reading process, isn't recommended run on main thread.
 * Wait until work is ended, and method will be return result.
 * @throws error will occur if there's no connection
 * @returns {string} read lines
 */
Connectivity.Reader.prototype.read = function() {
	let stream = this.getStreamReader();
	if (!stream) {
		MCSystem.throwException("Connectivity: Couldn't read stream, because one of params is missing");
	}
	let result = this.result = [],
		reader = new java.io.BufferedReader(stream);
	this.processing = true;
	if (this.callback.hasOwnProperty("onPrepare")) {
		this.callback.onPrepare.call(this);
	}
	while (this.inProcess()) {
		let line = reader.readLine();
		if (line == null) break;
		else result.push(line);
		if (this.callback.hasOwnProperty("onReadLine")) {
			this.callback.onReadLine.call(this, result, line);
		}
	}
	if (this.callback.hasOwnProperty("onComplete")) {
		this.callback.onComplete.call(this);
	}
	delete this.processing;
	reader.close();
	return this.getResult();
};
