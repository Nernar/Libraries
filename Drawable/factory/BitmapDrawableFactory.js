let BitmapDrawableFactory = {
	required: {},
	mapped: {},
	getMappedFileByKey(key) {
		return this.mapped[key] || null;
	},
	requireByKey(key, options) {
		if (this.isRequired(key)) {
			return this.required[key];
		}
		if (this.mapped.hasOwnProperty(key)) {
			let file = this.getMappedFileByKey(key);
			this.required[key] = BitmapFactory.decodeFile(file, options);
			return this.requireByKey(key);
		}
		log("Drawable: Bitmap " + key + " not found or mapped incorrecly");
		return null;
	},
	findMappedByTag(tag) {
		let mapped = [];
		for (let key in this.mapped) {
			if (tag == "*") {
				mapped.push(key);
				continue;
			}
			let element = String(key).toLowerCase();
			if (element.indexOf(tag) != -1) {
				mapped.push(key);
			}
		}
		return mapped;
	},
	getRequiredCount() {
		let count = 0;
		for (let element in this.required) {
			count++;
		}
		return count;
	},
	isRequired(key) {
		return this.required.hasOwnProperty(key);
	},
	generateKeyFor(path, root) {
		if (root === undefined) {
			let parent = new java.io.File(path).getParentFile();
			root = String(parent.getPath());
		}
		if (root != false) {
			path = String(path).replace(String(root), String());
		}
		let splited = String(path).split("/");
		let key, previous;
		do {
			let next = splited.shift();
			if (splited.length == 0) {
				let index = next.lastIndexOf(".");
				if (index > 0) {
					next = next.substring(0, index);
				}
			}
			if (key === undefined) {
				key = next;
			} else if (previous != next) {
				key += next.charAt(0).toUpperCase();
				if (next.length > 1) {
					key += next.substring(1);
				}
			}
			previous = next;
		} while (splited.length > 0);
		if (key !== undefined) {
			return key.replace(/\W/g, String());
		}
		MCSystem.throwException("Drawable: invalid path provided in BitmapDrawableFactory: " + path);
	},
	getMappedCount() {
		let count = 0;
		for (let element in this.mapped) {
			count++;
		}
		return count;
	},
	isMapped(key) {
		return this.mapped.hasOwnProperty(key);
	},
	map(file, root) {
		if (file instanceof java.io.File) {
			file = file.getPath();
		}
		if (root === undefined) root = file;
		let key = this.generateKeyFor(file, root);
		return this.mapAs(key, file);
	},
	mapAs(key, file) {
		if (!(file instanceof java.io.File)) {
			file = new java.io.File(file);
		}
		this.mapped[key] = file;
		return key;
	},
	MIME_TYPES: [".png", ".jpg", ".jpeg", ".bmp"],
	listFileNames(path, explore, root) {
		let files = [],
			file = new java.io.File(path);
		if (root === undefined) root = path;
		if (file.isFile()) return [String(path).replace(root, String())];
		if (!String(root).endsWith("/") && String(root).length > 0) {
			root += "/";
		}
		let list = file.listFiles() || [];
		for (let i = 0; i < list.length; i++) {
			if (list[i].isFile()) {
				files.push(String(list[i]).replace(root, String()));
			} else if (explore) {
				files = files.concat(BitmapDrawableFactory.listFileNames(list[i], explore, root));
			}
		}
		return files.sort();
	},
	mapDirectory(path, explore, root) {
		let mapped = [];
		if (path instanceof java.io.File) {
			path = path.getPath();
		}
		if (root === undefined) root = path;
		let entries = (function() {
			let files = BitmapDrawableFactory.listFileNames(path, explore, root),
				formatted = [];
			for (let item in BitmapDrawableFactory.MIME_TYPES) {
				for (let name in files) {
					if (files[name].endsWith(BitmapDrawableFactory.MIME_TYPES[item])) {
						formatted.push(files[name]);
					}
				}
			}
			return formatted.sort();
		})();
		for (let i = 0; i < entries.length; i++) {
			let entry = new java.io.File(root, entries[i]);
			mapped.push(this.map(entry, root));
		}
		return mapped;
	},
	require(value, options) {
		if (value instanceof android.graphics.Bitmap) {
			if (this.isRequired(value)) return this.required[value];
			return this.required[value] = value;
		} else if (String(value).endsWith(".dnr")) {
			if (this.isRequired(value)) return this.required[value];
			let asset = BitmapFactory.decodeAsset(value, options);
			return this.required[value] = asset;
		} else if (String(value).indexOf("/") != -1 || (value instanceof java.io.File)) {
			if (this.isRequired(value)) return this.required[value];
			let file = BitmapFactory.decodeFile(value, options);
			return this.required[value] = file;
		}
		return this.requireByKey(value, options);
	},
	wrap(value, options) {
		let required = this.require(value, options);
		if (required == null) return required;
		return BitmapFactory.createScaled(required);
	},
	sameAs(from, to) {
		if (to instanceof android.graphics.Bitmap) {
			if (from instanceof android.graphics.Bitmap) {
				return from.sameAs(to);
			}
		}
		if (from instanceof java.io.File) {
			from = from.getPath();
		}
		if (to instanceof java.io.File) {
			to = to.getPath();
		}
		return from == to;
	},
	recycle(key) {
		if (this.isRequired(key)) {
			let required = this.required[key];
			if (required && !required.isRecycled()) {
				required.recycle();
			}
			return delete this.required[key];
		}
		return false;
	},
	recycleRequired() {
		for (let key in this.required) {
			this.recycle(key);
		}
	}
};
