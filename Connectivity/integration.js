/**
 * A quick way to create thread, errors are handled.
 * @param {Function} action action to handle
 * @param {Object|Function} [callback] fail callback
 * @param {any} connect will be passed into callback
 * @throws error if action isn't specified
 */
Connectivity.handle = function(action, callback, connect) {
	if (!(action instanceof Function)) {
		MCSystem.throwException("Connectivity: Nothing to network handle");
	}
	handleThread(function() {
		try {
			action();
		} catch (e) {
			try {
				if (callback && callback instanceof Object) {
					if (callback.hasOwnProperty("onFail")) {
						callback.onFail.call(connect);
						return;
					}
				} else if (callback instanceof Function) {
					callback.call(connect);
				}
				Logger.Log("Connectivity: Failed to read network data from a server", "WARNING");
			} catch (t) {
				Logger.Log("Connectivity: A fatal error occurred while trying to network connect", "ERROR");
			}
		}
	});
};

/**
 * A quick way to length content from connection.
 * @param {string} address url address
 * @param {Object|Function} callback action or callback
 * @returns {boolean} has process started
 */
Connectivity.lengthUrl = function(address, callback) {
	if (!Connectivity.isOnline()) {
		if (callback && callback instanceof Object) {
			if (callback.hasOwnProperty("isNotConnected")) {
				callback.isNotConnected();
			}
		}
		return false;
	}
	let connect = new Connectivity.Connect(address);
	if (callback && callback instanceof Object) {
		callback && connect.setCallback(callback);
	}
	this.handle(function() {
		if (callback) {
			if (callback instanceof Object) {
				connect.getLength();
			} else callback(connect.getLength());
		} else {
			Logger.Log("Connectivity: Network action after doing stream length is missed", "WARNING")
			connect.getLength();
		}
	}, callback, connect);
	return true;
};

/**
 * A quick way to read data from connection.
 * @param {string} address url address
 * @param {Object|Function} callback action or callback
 * @returns {boolean} has process started
 */
Connectivity.readUrl = function(address, callback) {
	if (!Connectivity.isOnline()) {
		if (callback && callback instanceof Object) {
			if (callback.hasOwnProperty("isNotConnected")) {
				callback.isNotConnected();
			}
		}
		return false;
	}
	let reader = new Connectivity.Reader(address);
	if (callback && callback instanceof Object) {
		callback && reader.setCallback(callback);
	}
	this.handle(function() {
		if (callback) {
			if (callback instanceof Object) {
				reader.read();
			} else callback(reader.read());
		} else {
			Logger.Log("Connectivity: Network action after doing stream reading is missed", "WARNING")
			reader.read();
		}
	}, callback, reader);
	return true;
};

/**
 * A quick way to download file from connection.
 * @param {string} address url address
 * @param {string} path file path
 * @param {Object|Function} [callback] action or callback
 * @returns {boolean} has process started
 */
Connectivity.downloadUrl = function(address, path, callback) {
	if (!Connectivity.isOnline()) {
		if (callback && callback instanceof Object) {
			if (callback.hasOwnProperty("isNotConnected")) {
				callback.isNotConnected();
			}
		}
		return false;
	}
	let writer = new Connectivity.Downloader(address, path);
	if (callback && callback instanceof Object) {
		callback && writer.setCallback(callback);
	}
	this.handle(function() {
		if (callback instanceof Function) {
			callback(writer.download());
			return;
		}
		writer.download();
	}, callback, writer);
	return true;
};

EXPORT("Connectivity", Connectivity);
