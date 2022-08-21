Files.writeFileToZip = function(path, absolute, zip) {
	let fis = new java.io.FileInputStream(path),
		bis = new java.io.BufferedInputStream(fis, 4096),
		entry = new java.util.zip.ZipEntry(absolute),
		buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 4096),
		line;
	zip.putNextEntry(entry);
	while ((line = bis.read(buffer, 0, 4096)) >= 0) {
		zip.write(buffer, 0, line);
	}
	bis.close();
};
