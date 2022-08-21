/**
 * @constructor
 * Loads a data stream into specified stream.
 * Must be overwritten with any prototype.
 * See [[getOutputStream()]] method for details.
 * @param {string} [address] address
 */
Connectivity.Writer = function(address) {
	address && this.setAddress(address);
};

Connectivity.Writer.prototype = new Connectivity;
Connectivity.Writer.prototype.size = 8192;

/**
 * Returns buffer size for reading data.
 * Returns [[-1]] if default value setted.
 * @returns {number} buffer size
 */
Connectivity.Writer.prototype.getBufferSize = function() {
	return this.size || -1;
};

/**
 * Sets read buffer size.
 * @param {number|null} size buffer size
 */
Connectivity.Writer.prototype.setBufferSize = function(size) {
	if (size) this.size = size;
	else delete this.size;
};

/**
 * Returns length of readed data 
 * Returns [[-1]] if there is no connection.
 * @returns {number} readed data length
 */
Connectivity.Writer.prototype.getReadedCount = function() {
	return this.count ? this.count : this.inProcess() ? 0 : -1;
};

/**
 * Returns a stream reader, can be overwritten in prototypes.
 * @returns {Object|null} java input stream
 */
Connectivity.Writer.prototype.getStreamReader = function() {
	let stream = this.getStream();
	if (!stream) return null;
	let size = this.getBufferSize();
	if (!size) {
		return new java.io.BufferedInputStream(stream);
	}
	return new java.io.BufferedInputStream(stream, size);
};

/**
 * Returns output stream, must be overwritten by any prototype.
 * @throws error if not overwritten by prototype
 */
Connectivity.Writer.prototype.getOutputStream = function() {
	MCSystem.throwException("Connectivity: Connectivity.Writer.getOutputStream must be implemented");
};

/**
 * Returns [[true]] if download process is running.
 * @returns {boolean} in process
 */
Connectivity.Writer.prototype.inProcess = function() {
	return !!this.processing;
};

/**
 * Loads a file into given output data stream.
 * @throws error will occur if there's no connection
 * @throws error if output stream is invalid
 */
Connectivity.Writer.prototype.download = function() {
	let stream = this.getStreamReader(),
		output = this.getOutputStream();
	if (!stream) {
		MCSystem.throwException("Connectivity: Couldn't download stream, because input stream is missing");
	}
	if (!output) {
		MCSystem.throwException("Connectivity: Couldn't download stream, because output stream is missing");
	}
	this.connect(), this.count = 0;
	this.processing = true;
	let size = this.getLength();
	if (this.callback.hasOwnProperty("onPrepare")) {
		this.callback.onPrepare.call(this, size);
	}
	let data = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
	while (this.inProcess()) {
		let count = stream.read(data);
		if (count == -1) {
			break;
		} else {
			output.write(data, 0, count);
			if (this.callback.hasOwnProperty("onProgress")) {
				this.callback.onProgress.call(this, count, size);
			}
			this.count += count;
		}
	}
	if (this.callback.hasOwnProperty("onComplete")) {
		this.callback.onComplete.call(this, size);
	}
	this.processing = false;
	this.disconnect();
	output.flush();
	output.close();
	stream.close();
};
