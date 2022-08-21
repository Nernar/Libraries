getLoadedModList = function() {
	try {
		let mods = Packages.com.zhekasmirnov.apparatus.modloader.ApparatusModLoader.getSingleton().getAllMods();
		let sorted = new java.util.ArrayList();
		for (let i = 0; i < mods.size(); i++) {
			let mod = mods.get(i);
			if (mod instanceof Packages.com.zhekasmirnov.apparatus.modloader.LegacyInnerCoreMod) {
				sorted.add(mod.getLegacyModInstance());
			}
		}
		return sorted;
	} catch (e) {
		return InnerCorePackages.mod.build.ModLoader.instance.modsList;
	}
};

fetchScriptSources = function(mod) {
	let founded = {};
	let buildConfig = mod.buildConfig;
	let sources = buildConfig.sourcesToCompile;
	for (let i = 0; i < sources.size(); i++) {
		let source = sources.get(i);
		founded[source.path] = source.sourceName;
	}
	let directory = buildConfig.defaultConfig.libDir;
	if (directory != null) {
		let folder = new java.io.File(mod.dir, directory);
		if (folder.exists() && folder.isDirectory()) {
			let libraries = folder.listFiles();
			for (let i = 0; i < libraries.length; i++) {
				let library = libraries[i].getName();
				founded[directory + library] = library;
			}
		}
	}
	return founded;
};

setupLoadedSources = function(mods) {
	for (let i = 0; i < mods.size(); i++) {
		let source = mods.get(i);
		setupLoadedSources.mods[source] = fetchScriptSources(source);
		setupLoadedSources.sources[source] = source;
	}
};

setupLoadedSources.mods = {};
setupLoadedSources.sources = {};

getModName = function(id) {
	if (setupLoadedSources.sources.hasOwnProperty(id)) {
		let source = setupLoadedSources.sources[id];
		if (source) {
			return "" + source.getName();
		}
	}
	return "";
};

findAvailabledMods = function(name) {
	let array = [];
	for (let element in setupLoadedSources.mods) {
		let mod = getModName(element);
		if (mod == name) {
			array.unshift(element);
		} else if (!name || mod.startsWith(name)) {
			array.push(element);
		}
		let source = setupLoadedSources.sources[element];
		if (source.dir.endsWith("/" + name + "/")) {
			array.unshift(element);
		} else if (source.dir.indexOf("/" + name) != -1) {
			array.push(element);
		}
	}
	return array;
};

findRelatedSources = function(name, file) {
	let sources = findAvailabledMods(name);
	if (sources.length == 0) {
		return {};
	}
	let related = {};
	for (let i = 0; i < sources.length; i++) {
		let mod = sources[i],
			source = setupLoadedSources.mods[mod];
		for (let path in source) {
			let name = source[path];
			if (name == file) {
				if (!related.hasOwnProperty(mod)) {
					related[mod] = [];
				}
				related[mod].unshift(path);
			} else if (name.endsWith(file)) {
				if (!related.hasOwnProperty(mod)) {
					related[mod] = [];
				}
				related[mod].push(path);
			}
		}
	}
	return related;
};
