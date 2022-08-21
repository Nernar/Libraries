/**
 * @constructor
 * Creates a connection to specific remote address.
 * @param {string} [address] address
 */
Connectivity = function(address) {
	this.callback = {};
	address && this.setAddress(address);
};

/**
 * Returns url was set by connection.
 * @returns {Object|null} java url
 */
Connectivity.prototype.getUrl = function() {
	return this.url || null;
};

/**
 * Sets current url as an java object.
 * If you need set address, use appropriate method.
 * @param {Object|null} url java url
 */
Connectivity.prototype.setUrl = function(url) {
	if ("" + url === url) {
		Logger.Log("Connectivity: You should use Connectivity.setAddress instead of Connectivity.setUrl for string values", "WARNING");
		this.setAddress(url);
		return;
	}
	if (this.callback.hasOwnProperty("onUrlChanged")) {
		this.callback.onUrlChanged.call(this, url);
	}
	this.url = url;
};

/**
 * Use to specify remote address as a string.
 * @param {string} address address
 */
Connectivity.prototype.setAddress = function(address) {
	this.setUrl(new java.net.URL(address));
};

/**
 * Event receiver, use to track actions.
 * @param {Object} callback callback
 */
Connectivity.prototype.setCallback = function(callback) {
	if (callback && callback instanceof Object) {
		this.callback = callback;
		return;
	}
	this.callback = {};
};

/**
 * Opens and returns a data stream.
 * If url isn't specified, [[null]] is returned.
 * @returns {Object|null} java stream
 */
Connectivity.prototype.getStream = function() {
	try {
		return this.url ? this.url.openStream() : null;
	} catch (e) {
		let connection = this.getConnection();
		return connection ? connection.getInputStream() : null;
	}
};

/**
 * If connection doesn't exist, creates a new one.
 */
Connectivity.prototype.validateConnection = function() {
	if (this.connection == null || this.connection === undefined) {
		this.connection = this.url ? this.url.openConnection() : null;
		if (this.callback.hasOwnProperty("onCreateConnection")) {
			this.callback.onCreateConnection.call(this, this.connection);
		}
	}
};

/**
 * Opens or returns an existing connection.
 * @param {boolean} [force] if [[true]], willn't open a new connection
 * @returns {Object|null} java connection
 */
Connectivity.prototype.getConnection = function(force) {
	if (!force) this.validateConnection();
	return this.connection || null;
};

/**
 * Returns true if connection exists.
 * @returns {boolean} has connection
 */
Connectivity.prototype.hasConnection = function() {
	return this.getConnection(true) !== null;
};

/**
 * Connects to created url if it's created.
 * @throws if connection creation failed
 */
Connectivity.prototype.connect = function() {
	let connection = this.getConnection();
	if (connection) connection.connect();
	else MCSystem.throwException("Connectivity: Couldn't find any opened connection to connect");
	if (this.callback.hasOwnProperty("onConnect")) {
		this.callback.onConnect.call(this, connection);
	}
};

/**
 * Disconnects from existing connection.
 * If connection doesn't exist, nothing happens.
 */
Connectivity.prototype.disconnect = function() {
	let connection = this.getConnection();
	if (!connection) return;
	connection.disconnect();
	delete this.connection;
	if (this.callback.hasOwnProperty("onDisconnect")) {
		this.callback.onDisconnect.call(this, connection);
	}
};

/**
 * Gets length of output connection.
 * If connection failed, returns [[-1]].
 * @returns {number} bytes count
 */
Connectivity.prototype.getLength = function() {
	let connected = this.hasConnection();
	if (!connected) this.connect();
	let connection = this.getConnection(),
		length = connection ? connection.getContentLength() : -1;
	if (this.callback.hasOwnProperty("getLength")) {
		this.callback.getLength.call(this, length);
	}
	connected && this.disconnect();
	return length;
};

/**
 * Checks if there's has internet connection.
 * @returns {boolean} has connection
 */
Connectivity.isOnline = function() {
	let service = UI.getContext().getSystemService("connectivity");
	if (service == null) {
		return false;
	}
	let network = service.getActiveNetworkInfo();
	if (network == null || !network.isConnectedOrConnecting()) {
		return false;
	}
	return true;
};
