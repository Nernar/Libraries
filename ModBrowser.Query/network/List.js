ModBrowser.Query.List = function() {
	this.setLanguage("en");
	this.setLimit(20);
	this.setOffset(0);
};

ModBrowser.Query.List.prototype = new ModBrowser.Query;

ModBrowser.Query.List.prototype.updateAddress = function() {
	this.setAddressRelative("list");
};

ModBrowser.Query.List.prototype.previous = function() {
	let query = this.getQuery();
	if (!query) return false;
	if (!query.hasOwnProperty("count")) {
		query.count = 20;
	}
	let count = query.start - query.count;
	if (query.hasOwnProperty("start")) {
		if (count > 0) {
			query.start -= query.count;
		} else {
			query.count -= query.start;
			delete query.start;
		}
	} else return false;
	this.updateAddress();
	return true;
};

ModBrowser.Query.List.prototype.next = function() {
	let query = this.getQuery();
	if (!query) return false;
	if (!query.hasOwnProperty("count")) {
		query.count = 20;
	}
	if (query.hasOwnProperty("start")) {
		query.start += query.count;
	} else query.start = 0;
	this.updateAddress();
	return true;
};

ModBrowser.Query.List.prototype.getLanguage = function() {
	let query = this.getQuery();
	return query ? query.lang | null : null;
};

ModBrowser.Query.List.prototype.setLanguage = function(lang) {
	let query = this.getQuery();
	if (query) {
		if (lang) {
			query.lang = lang;
		} else delete query.lang;
	}
	this.updateAddress();
};

ModBrowser.Query.List.prototype.getLimit = function() {
	let query = this.getQuery();
	return query ? query.count | 0 : 0;
};

ModBrowser.Query.List.prototype.setLimit = function(limit) {
	let query = this.getQuery();
	if (query) {
		if (limit > 0) {
			query.count = limit;
		} else delete query.count;
	}
	this.updateAddress();
};

ModBrowser.Query.List.prototype.getOffset = function() {
	let query = this.getQuery();
	return query ? query.start | 0 : 0;
};

ModBrowser.Query.List.prototype.setOffset = function(offset) {
	let query = this.getQuery();
	if (query) {
		if (offset >= 0) {
			query.start = offset;
		} else delete query.start;
	}
	this.updateAddress();
};

ModBrowser.Query.List.prototype.setRange = function(start, end) {
	this.setLimit(end - start);
	this.setOffset(start);
};

ModBrowser.Query.List.prototype.getSort = function() {
	let query = this.getQuery();
	return query ? query.sort | null : null;
};

ModBrowser.Query.List.prototype.setSort = function(sort) {
	let query = this.getQuery();
	if (query) {
		if (sort) {
			query.sort = sort;
		} else delete query.sort;
	}
	this.updateAddress();
};

ModBrowser.Query.List.prototype.getIds = function() {
	let query = this.getQuery();
	return query ? query.ids ? query.ids.split(",") : null : null;
};

ModBrowser.Query.List.prototype.setIds = function(ids) {
	let query = this.getQuery();
	if (query) {
		if ("" + ids == ids) {
			query.ids = id;
		} else if (ids && ids.length > 0) {
			query.ids = ids.join(",");
		} else delete query.ids;
	}
	this.updateAddress();
};
