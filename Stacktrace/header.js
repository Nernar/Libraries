/*

   Copyright 2021-2022 Nernar (github.com/nernar)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

*/

LIBRARY({
	name: "Stacktrace",
	version: 1,
	api: "AdaptedScript",
	shared: true
});

launchTime = Date.now();
isHorizon = (function() {
	let version = MCSystem.getInnerCoreVersion();
	return parseInt(version.toString()[0]) >= 2;
})();
InnerCorePackages = isHorizon ? Packages.com.zhekasmirnov.innercore : Packages.zhekasmirnov.launcher;

isValidFile = function(file) {
	if (file instanceof java.io.File) {
		return file.isFile();
	}
	return false;
};
