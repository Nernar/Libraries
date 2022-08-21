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
	name: "JsonIo",
	version: 1,
	api: "AdaptedScript",
	shared: true
});

$ = new JavaImporter();
$.importPackage(org.mozilla.javascript);
$.importPackage(Packages.com.cedarsoftware.util.io);

JsonIo = {};
JsonIo.Writer = $.JsonWriter;
JsonIo.Reader = $.JsonReader;
JsonIo.Object = $.JsonObject;

shouldReturnPrimitive = function(value) {
	if (value instanceof java.lang.CharSequence) {
		return "" + value;
	}
	if (value instanceof java.lang.Number) {
		return value - 0;
	}
	if (value instanceof java.lang.Boolean) {
		return !!value;
	}
	return $.ScriptRuntime.toObject(this, value);
};
