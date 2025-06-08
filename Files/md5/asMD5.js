Files.asMD5 = function(file, simpleCompare) {
	if (!(file instanceof java.io.File)) {
		file = new java.io.File(file);
	}
	if (simpleCompare) {
		let size = new java.lang.String(file.length());
		return toDigestMd5(size.getBytes());
	}
	return toDigestMd5(this.readBytes(file));
};
