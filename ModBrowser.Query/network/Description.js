ModBrowser.Query.Description = function(id) {
	this.setLanguage("en");
	if (id !== undefined) {
		this.setId(id);
	}
};

ModBrowser.Query.Description.prototype = new ModBrowser.Query;

ModBrowser.Query.Description.prototype.updateAddress = function() {
	this.setAddressRelative("description");
};

ModBrowser.Query.Description.prototype.getLanguage = function() {
	let query = this.getQuery();
	return query ? query.lang | null : null;
};

ModBrowser.Query.Description.prototype.setLanguage = function(lang) {
	let query = this.getQuery();
	if (query) {
		if (lang) {
			query.lang = lang;
		} else delete query.lang;
	}
	this.updateAddress();
};

ModBrowser.Query.Description.prototype.getId = function() {
	let query = this.getQuery();
	return query ? query.id | 0 : 0;
};

ModBrowser.Query.Description.prototype.setId = function(id) {
	let query = this.getQuery();
	if (query) {
		if (id >= 0) {
			query.id = id;
		} else delete query.id;
	}
	this.updateAddress();
};

ModBrowser.Query.Description.prototype.getCommentLimit = function() {
	let query = this.getQuery();
	return query ? query.limit | 0 : 0;
};

ModBrowser.Query.Description.prototype.setCommentLimit = function(limit) {
	let query = this.getQuery();
	if (query) {
		if (limit >= 0) {
			query.comments_limit = limit;
		} else delete query.comments_limit;
	}
	this.updateAddress();
};
