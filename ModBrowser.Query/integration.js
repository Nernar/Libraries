ModBrowser.getDownloader = function(id, isHorizon) {
	if (id == undefined || id == null) {
		return null;
	}
	let downloader = new Connectivity.Downloader();
	if (isHorizon || isHorizon === undefined) {
		downloader.setAddress("https://icmods.mineprogramming.org/api/download?horizon&id=" + id);
	} else downloader.setAddress("https://icmods.mineprogramming.org/api/download?id=" + id);
	return downloader;
};

EXPORT("ModBrowser", ModBrowser);
