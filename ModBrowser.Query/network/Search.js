ModBrowser.Query.Search = function(query) {
	this.setLanguage("en");
	this.setLimit(20);
	if ("" + query == query) {
		this.setRequest(query);
	} else if (Number.isInteger(query)) {
		this.setAuthor(query);
	}
};

ModBrowser.Query.Search.prototype = new ModBrowser.Query;

ModBrowser.Query.Search.prototype.updateAddress = function() {
	this.setAddressRelative("search");
};

ModBrowser.Query.Search.prototype.getLanguage = function() {
	let query = this.getQuery();
	return query ? query.lang | null : null;
};

ModBrowser.Query.Search.prototype.setLanguage = function(lang) {
	let query = this.getQuery();
	if (query) {
		if (lang) {
			query.lang = lang;
		} else delete query.lang;
	}
	this.updateAddress();
};

ModBrowser.Query.Search.prototype.getLimit = function() {
	let query = this.getQuery();
	return query ? query.limit | 0 : 0;
};

ModBrowser.Query.Search.prototype.setLimit = function(limit) {
	let query = this.getQuery();
	if (query) {
		if (limit > 0) {
			query.limit = limit;
		} else delete query.limit;
	}
	this.updateAddress();
};

ModBrowser.Query.Search.prototype.getRequest = function() {
	let query = this.getQuery();
	return query ? query.q | null : null;
};

ModBrowser.Query.Search.prototype.setRequest = function(request) {
	let query = this.getQuery();
	if (query) {
		if (request) {
			query.q = request;
		} else delete query.q;
	}
	this.updateAddress();
};

ModBrowser.Query.Search.prototype.getAuthor = function() {
	let query = this.getQuery();
	return query ? query.author | 0 : 0;
};

ModBrowser.Query.Search.prototype.setAuthor = function(id) {
	let query = this.getQuery();
	if (query) {
		if (id >= 0) {
			query.author = id;
		} else delete query.author;
	}
	this.updateAddress();
};

ModBrowser.Query.Search.prototype.getTag = function() {
	let query = this.getQuery();
	return query ? query.tag | null : null;
};

ModBrowser.Query.Search.prototype.setTag = function(tag) {
	let query = this.getQuery();
	if (query) {
		if (tag) {
			query.tag = tag;
		} else delete query.tag;
	}
	this.updateAddress();
};
