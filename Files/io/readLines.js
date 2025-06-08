Files.readLines = function(file, startInd, endInd) {
	if (!file.exists()) return null;
	let reader = new java.io.BufferedReader(new java.io.FileReader(file)),
		result = [],
		count = -1,
		line;
	while (count <= endInd && (line = reader.readLine())) {
		if (count >= startInd) {
			result.push("" + line);
		}
		count++;
	}
	return result.length > 0 ? result : null;
};
