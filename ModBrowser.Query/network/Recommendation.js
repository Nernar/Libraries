ModBrowser.Query.Recommendation = function(id) {
	this.setLanguage("en");
	this.setLimit(4);
	if (id !== undefined) {
		this.setId(id);
	}
};

ModBrowser.Query.Recommendation.prototype = new ModBrowser.Query;

ModBrowser.Query.Recommendation.prototype.updateAddress = function() {
	this.setAddressRelative("recommendations");
};

ModBrowser.Query.Recommendation.prototype.getId = function() {
	let query = this.getQuery();
	return query ? query.id | 0 : 0;
};

ModBrowser.Query.Recommendation.prototype.setId = function(id) {
	let query = this.getQuery();
	if (query) {
		if (id >= 0) {
			query.id = id;
		} else delete query.id;
	}
	this.updateAddress();
};

ModBrowser.Query.Recommendation.prototype.getLanguage = function() {
	let query = this.getQuery();
	return query ? query.lang | null : null;
};

ModBrowser.Query.Recommendation.prototype.setLanguage = function(lang) {
	let query = this.getQuery();
	if (query) {
		if (lang) {
			query.lang = lang;
		} else delete query.lang;
	}
	this.updateAddress();
};

ModBrowser.Query.Recommendation.prototype.getLimit = function() {
	let query = this.getQuery();
	return query ? query.limit | 0 : 0;
};

ModBrowser.Query.Recommendation.prototype.setLimit = function(limit) {
	let query = this.getQuery();
	if (query) {
		if (limit > 0) {
			query.limit = limit;
		} else delete query.limit;
	}
	this.updateAddress();
};
