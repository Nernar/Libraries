ModBrowser.Query.Version = function(id) {
	if (id !== undefined) {
		this.setId(id);
	}
};

ModBrowser.Query.Version.prototype = new ModBrowser.Query;

ModBrowser.Query.Version.prototype.updateAddress = function() {
	this.setAddressRelative("version");
};

ModBrowser.Query.Version.prototype.getId = function() {
	let query = this.getQuery();
	return query ? query.id | 0 : 0;
};

ModBrowser.Query.Version.prototype.setId = function(id) {
	let query = this.getQuery();
	if (query) {
		if (id >= 0) {
			query.id = id;
		} else delete query.id;
	}
	this.updateAddress();
};
