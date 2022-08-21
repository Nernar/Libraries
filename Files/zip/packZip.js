Files.packZip = function(shrink, who, output) {
	let fos = new java.io.FileOutputStream(output),
		bos = new java.io.BufferedOutputStream(fos),
		zip = new java.util.zip.ZipOutputStream(bos); 
	for (let i = 0; i < who.length; i++) {
		let path = this.shrinkPathes(shrink, who[i]);
		this.writeFileToZip(who[i], path, zip);
	}
	zip.close();
};
