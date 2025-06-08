function writeNativeObjectToJsonIo(object, primitiveArrays) {
	if (object === null || object === undefined) {
		MCSystem.throwException("JsonIo: Passed to writeNativeObject value must be defined");
	}
	let json = new JsonIo.Object();
	for (let element in object) {
		let someone = writeScriptableToJsonIo(object[element], primitiveArrays);
		someone !== undefined && json.put(element, someone);
	}
	return json;
}

function writeNativeArrayToJsonIo(array, primitiveArrays) {
	if (array === null || array === undefined) {
		MCSystem.throwException("JsonIo: Passed to writeNativeArray value must be defined");
	}
	let output = new java.util.ArrayList();
	for (let i = 0; i < array.length; i++) {
		let someone = writeScriptableToJsonIo(array[i], primitiveArrays);
		someone !== undefined && output.add(someone);
	}
	let json = new JsonIo.Object();
	if (primitiveArrays !== false) {
		// @ts-expect-error
		output = output.toArray();
	}
	json.put("@items", output);
	return json;
}

function writeScriptableToJsonIo(who, primitiveArrays) {
	try {
		if (who === null) {
			return null;
		}
		switch (typeof who) {
			case "number":
			case "boolean":
			case "string":
				return $.ScriptRuntime.toPrimitive(who);
			case "object":
				if (Array.isArray(who)) {
					return writeNativeArrayToJsonIo(who, primitiveArrays);
				}
				if (who instanceof $.Scriptable || who.toString() == "[object Object]") {
					return writeNativeObjectToJsonIo(who, primitiveArrays);
				}
				try {
					return $.Context.jsToJava(who, getClass(who));
				} catch (e) {
					return who;
				}
			case "function":
				try {
					return who.toSource();
				} catch (e) {
					log("JsonIo: toSource not called on " + who);
					log("JsonIo: " + e);
					return null;
				}
			case "undefined":
				return;
		}
	} catch (e) {
		log("JsonIo: Unsupported scriptable to json value " + who);
		log("JsonIo: " + e);
		return null;
	}
	MCSystem.throwException("JsonIo: Unknown type " + typeof who + " of " + who);
}

JsonIo.toJson = writeScriptableToJsonIo;

function readJsonIoToNativeObject(json, allowClasses) {
	if (!(json instanceof java.util.Map)) {
		MCSystem.throwException("JsonIo: Passed to readNativeObject value must be java.util.Map");
	}
	let iterator = json.keySet().iterator(),
		object = {};
	while (iterator.hasNext()) {
		let key = iterator.next(),
			someone = readJsonIoToScriptable(json.get(key), allowClasses);
		someone !== undefined && (object[key] = someone);
	}
	return object;
}

function readJsonIoToNativeArray(json, allowClasses) {
	if (json === null || json === undefined) {
		MCSystem.throwException("JsonIo: Passed to readNativeArray value must be defined");
	}
	let array = [];
	if (json instanceof java.util.List) {
		for (let i = 0; i < json.size(); i++) {
			let someone = readJsonIoToScriptable(json.get(i), allowClasses);
			someone !== undefined && array.push(someone);
		}
	} else {
		if (json instanceof java.util.Collection) {
			json = json.toArray();
		}
		for (let i = 0; i < json.length; i++) {
			let someone = readJsonIoToScriptable(json[i], allowClasses);
			someone !== undefined && array.push(someone);
		}
	}
	return array;
}

function readJsonIoToScriptable(json, allowClasses) {
	if (!(json instanceof JsonIo.Object)) {
		try {
			if (json == null) {
				return null;
			}
			if (json instanceof java.util.List || json instanceof java.util.Collection || getClass(json).__javaObject__.isArray()) {
				return readJsonIoToNativeArray(json, allowClasses);
			}
			if (json instanceof java.util.Map) {
				return readJsonIoToNativeObject(json, allowClasses);
			}
			return shouldReturnPrimitive(json);
		} catch (e) {
			if (allowClasses) {
				return json;
			}
			log("JsonIo: Unsupported class passed to JsonIo.fromJson: " + json + ", nothing will happened");
			log("JsonIo: " + e);
		}
		return undefined;
	}
	if (json.isPrimitive()) {
		return shouldReturnPrimitive(json.getPrimitiveValue());
	}
	if (json.isArray() || json.isCollection()) {
		return readJsonIoToNativeArray(json.getArray(), allowClasses);
	}
	if (json.isMap()) {
		return readJsonIoToNativeObject(json, allowClasses);
	}
	let value = json.get("value");
	if (value != null) {
		return shouldReturnPrimitive(value);
	}
	return readJsonIoToNativeObject(json, allowClasses);
}

JsonIo.fromJson = readJsonIoToScriptable;
