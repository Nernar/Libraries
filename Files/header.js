/*

   Copyright 2016-2022 Nernar (github.com/nernar)

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
	name: "Files",
	version: 1,
	api: "Preloader",
	shared: true
});

toDigestMd5 = (function(){
	let digest = java.security.MessageDigest.getInstance("md5");
	return function(bytes) {
		digest.update(bytes);
		let byted = digest.digest()
		let sb = new java.lang.StringBuilder();
		for (let i = 0; i < byted.length; i++) {
			sb.append(java.lang.Integer.toHexString(0xFF & byted[i]));
		}
		return sb.toString();
	};
})();

Files = {};
