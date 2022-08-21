jsonIoWriterEnum = 0;
JsonIo.COMPLETED = jsonIoWriterEnum++;
JsonIo.UNCLOSED = jsonIoWriterEnum++;
JsonIo.UNCHANGED = jsonIoWriterEnum++;

getJsonIoWriter = function(stream, args) {
	if (stream === null || stream === undefined) {
		MCSystem.throwException("JsonIo: JsonIo.getWriter stream must be defined");
	}
	if (args !== undefined) {
	    if (!(args instanceof java.util.HashMap)) {
	        args = writeNativeObjectToJsonIo(args, false);
	    }
		return new JsonIo.Writer(stream, args);
	}
	return new JsonIo.Writer(stream);
};

writeJsonIoToStream = function(stream, json, args) {
	if (json === undefined) {
		log("JsonIo: undefined passed to JsonIo.writeStream, nothing will happened");
		return JsonIo.UNCHANGED;
	}
	let writer = getJsonIoWriter(stream, args);
	writer.write(json);
	writer.flush();
	try {
		writer.close();
		return JsonIo.COMPLETED;
	} catch (e) {
		return JsonIo.UNCLOSED;
	}
};

writeScriptableToStream = function(stream, who, args, primitiveArrays) {
	if (!(who instanceof JsonIo.Object)) {
		who = writeScriptableToJsonIo(who, primitiveArrays);
	}
	return writeJsonIoToStream(stream, who, args);
};

JsonIo.getWriter = getJsonIoWriter;
JsonIo.writeStream = writeScriptableToStream;

getJsonIoReader = function(streamOrString, args) {
	if (streamOrString === null || streamOrString === undefined) {
		return new JsonIo.Reader();
	}
	if (!(streamOrString instanceof java.io.InputStream)) {
		args = args || null;
	}
	if (args !== undefined) {
	    if (!(args instanceof java.util.HashMap)) {
	        args = writeNativeObjectToJsonIo(args, false);
	    }
		return new JsonIo.Reader(streamOrString, args);
	}
	return new JsonIo.Reader(streamOrString);
};

readJsonIoFromStream = function(streamOrString, args) {
	let reader = getJsonIoReader(streamOrString, args),
		json = reader.readObject();
	try {
		reader.close();
	} catch (e) {
		log("JsonIo: readJsonIoFromStream: " + e);
	}
	return json;
};

readScriptableFromStream = function(streamOrString, args, allowClasses) {
	let json = readJsonIoFromStream(streamOrString, args);
	return readJsonIoToScriptable(json, allowClasses);
};

JsonIo.getReader = getJsonIoReader;
JsonIo.readStream = readScriptableFromStream;
