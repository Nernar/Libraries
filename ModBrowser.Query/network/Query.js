ModBrowser.Query = function() {
	this.query = {};
};

ModBrowser.Query.prototype = new Connectivity.Reader;

ModBrowser.Query.prototype.getQuery = function() {
	return this.query || null;
};

ModBrowser.Query.prototype.formatQuery = function() {
	let query = this.getQuery();
	if (!query) return null;
	let result = [];
	for (let item in query) {
		let value = query[item];
		result.push(item + (value !== null && value !== undefined
			? "=" + value : ""));
	}
	return result.length > 0 ? result.join("&") : null;
};

ModBrowser.Query.prototype.setAddress = function(address) {
	let query = this.formatQuery();
	if (query) address += "?" + query;
	this.setUrl(new java.net.URL(address));
};

ModBrowser.Query.prototype.setAddressRelative = function(page) {
	this.setAddress("https://icmods.mineprogramming.org/api/" + page);
};

ModBrowser.Query.prototype.setIsHorizon = function(value) {
	let query = this.getQuery();
	if (query) {
		if (value === undefined || value == true) {
			query.horizon = null;
		} else delete query.horizon;
	}
};

ModBrowser.Query.prototype.getJSON = function() {
	return JSON.parse(this.getResult());
};

ModBrowser.Query.Sort = {};
ModBrowser.Query.Sort.POPULAR = "popular";
ModBrowser.Query.Sort.NEW = "new";
ModBrowser.Query.Sort.REDACTION = "redaction";
ModBrowser.Query.Sort.UPDATED = "updated";
