Files.write = function(file, text) {
	Files.writeBytes(file, new java.lang.String(text).getBytes());
};
