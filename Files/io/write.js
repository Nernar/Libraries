Files.write = function(file, text) {
	Files.writeBytes(file, java.lang.String(text).getBytes());
};
