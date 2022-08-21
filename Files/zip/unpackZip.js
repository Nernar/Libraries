Files.unpackZip = function(source, output) {
	let zip = new java.util.zip.ZipFile(source),
		entries = zip.entries();
	while (entries.hasMoreElements()) {
		let element = entries.nextElement(),
			result = new java.io.File(output, element.getName());
		if (element.isDirectory()) {
			result.mkdirs();
		} else {
			result.getParentFile().mkdirs();
			this.writeStreamToFile(zip.getInputStream(element), result);
		}
	}
	zip.close();
};
