/*

   Copyright 2017-2022 Nernar (github.com/nernar)

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
    name: "Retention",
    version: 1,
    api: "AdaptedScript",
    shared: true
});
var _this = this;
/**
 * Milliseconds from moment when library started.
 */
var launchTime = Date.now();
EXPORT("launchTime", launchTime);
/**
 * Determines engine: Inner Core v1 or Horizon v2.
 */
var isHorizon = (function () {
    // @ts-ignore
    var version = MCSystem.getInnerCoreVersion();
    return parseInt(version.toString()[0]) >= 2;
})();
EXPORT("isHorizon", isHorizon);
/**
 * Minecraft version running by Inner Core.
 * It must be `0`, `11` or `16`.
 */
var minecraftVersion = (function () {
    // @ts-ignore
    var version = MCSystem.getMinecraftVersion();
    return parseInt(version.toString().split(".")[1]);
})();
EXPORT("minecraftVersion", minecraftVersion);
/**
 * Currently running activity, it context must be
 * required to perform interactions with Android.
 */
var getContext = function () { return UI.getContext(); };
EXPORT("getContext", getContext);
this.threadStack = [];
this.display = getContext().getWindowManager().getDefaultDisplay();
this.metrics = getContext().getResources().getDisplayMetrics();
this.reportAction = function (error) {
    try {
        if (isHorizon) {
            // @ts-ignore
            Packages.com.zhekasmirnov.innercore.api.log.ICLog.i("WARNING", Packages.com.zhekasmirnov.innercore.api.log.ICLog.getStackTrace(error));
        }
        else {
            // @ts-ignore
            Packages.zhekasmirnov.launcher.api.log.ICLog.i("WARNING", Packages.zhekasmirnov.launcher.api.log.ICLog.getStackTrace(error));
        }
    }
    catch (_a) {
        try {
            Logger.Log(typeof error == "object" ? error.name + ": " + error.message + "\n" + error.stack : "" + error, "WARNING");
        }
        catch (_b) {
            Logger.Log("" + error, "WARNING");
        }
    }
};
/**
 * Display error in window, possibly in particular,
 * useful for visualizing and debugging problems.
 */
var reportError = function (error) {
    if (_this.reportAction) {
        _this.reportAction(error);
    }
};
EXPORT("reportError", reportError);
/**
 * Registers exception report action, it will be used as
 * default when {@link handle}, {@link handleThread}, etc. fails.
 * @param when action to perform with error
 */
var registerReportAction = function (when) {
    _this.reportAction = when;
};
EXPORT("registerReportAction", registerReportAction);
/**
 * Displays a log window for user whether it is
 * needed or not. On latest versions, number of such
 * windows on screen is limited for performance reasons.
 * @param message additional information
 * @param title e.g. mod name
 * @param fallback when too much dialogs
 */
var showReportDialog = function (message, title, fallback) {
    if (isHorizon) {
        try {
            // @ts-ignore
            Packages.com.zhekasmirnov.innercore.api.log.DialogHelper.openFormattedDialog("" + message, "" + title, fallback || null);
        }
        catch (e) {
            // @ts-ignore
            Packages.com.zhekasmirnov.innercore.api.log.DialogHelper.openFormattedDialog("" + message, "" + title);
        }
    }
    else {
        // @ts-ignore
        Packages.zhekasmirnov.launcher.api.log.DialogHelper.openFormattedDialog("" + message, "" + title);
    }
};
EXPORT("showReportDialog", showReportDialog);
/**
 * Directly redirects native rhino JavaScript {@link Error} to
 * {@link java.lang.Throwable} instances.
 */
var resolveThrowable = (function () {
    var bytes = (function (base64) {
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            return java.util.Base64.getDecoder().decode(new java.lang.String(base64).getBytes());
        }
        return android.util.Base64.decode(new java.lang.String(base64).getBytes(), android.util.Base64.NO_WRAP);
    })("ZGV4CjAzNQA7yC65zIj/irByxZUNv+ejN5SKUkKw3cq4CgAAcAAAAHhWNBIAAAAA" +
        "AAAAAAwKAAAoAAAAcAAAABQAAAAQAQAADAAAAGABAAABAAAA8AEAABMAAAD4AQAA" +
        "AQAAAJACAAAICAAAsAIAALACAAC6AgAAwgIAAMUCAADJAgAAzgIAANQCAADbAgAA" +
        "AAMAABMDAAA3AwAAWwMAAH0DAACgAwAAtAMAANIDAADmAwAA/QMAACgEAABXBAAA" +
        "cwQAAJUEAAC4BAAA4QQAAAYFAAAeBQAAIQUAACUFAAA5BQAATgUAAG0FAABzBQAA" +
        "pwUAALAFAAC8BQAAxwUAANcFAADfBQAA7AUAAPsFAAAHAAAACAAAAAkAAAAKAAAA" +
        "CwAAAAwAAAANAAAADgAAAA8AAAAQAAAAEQAAABIAAAATAAAAFAAAABUAAAAWAAAA" +
        "FwAAABkAAAAbAAAAHAAAAAMAAAABAAAAOAYAAAQAAAAGAAAAZAYAAAYAAAAGAAAA" +
        "WAYAAAQAAAAGAAAASAYAAAUAAAAGAAAALAYAAAIAAAAIAAAAAAAAAAQAAAAMAAAA" +
        "QAYAAAIAAAANAAAAAAAAAAIAAAAQAAAAAAAAABkAAAARAAAAAAAAABoAAAARAAAA" +
        "OAYAABoAAAARAAAAUAYAAAAADAAdAAAAAAAJAAAAAAAAAAkAAQAAAAAABwAdAAAA" +
        "AAADACQAAAAAAAQAJAAAAAAAAwAlAAAAAAAEACUAAAAAAAMAJgAAAAAABAAmAAAA" +
        "AQAAACAAAAABAAYAIgAAAAQACgABAAAABgAJAAEAAAAJAAUAIQAAAAoACwABAAAA" +
        "DAABACQAAAAOAAIAHgAAAA4ACAAjAAAAEAAIACMAAAAAAAAAAQAAAAYAAAAAAAAA" +
        "GAAAAAAAAADcCQAAAAAAAAg8Y2xpbml0PgAGPGluaXQ+AAFMAAJMTAADTExMAARM" +
        "TExMAAVMTExMTAAjTGlvL25lcm5hci9yaGluby9UaHJvd2FibGVSZXNvbHZlcjsA" +
        "EUxqYXZhL2xhbmcvQ2xhc3M7ACJMamF2YS9sYW5nL0NsYXNzTm90Rm91bmRFeGNl" +
        "cHRpb247ACJMamF2YS9sYW5nL0lsbGVnYWxBY2Nlc3NFeGNlcHRpb247ACBMamF2" +
        "YS9sYW5nL05vQ2xhc3NEZWZGb3VuZEVycm9yOwAhTGphdmEvbGFuZy9Ob1N1Y2hN" +
        "ZXRob2RFeGNlcHRpb247ABJMamF2YS9sYW5nL09iamVjdDsAHExqYXZhL2xhbmcv" +
        "UnVudGltZUV4Y2VwdGlvbjsAEkxqYXZhL2xhbmcvU3RyaW5nOwAVTGphdmEvbGFu" +
        "Zy9UaHJvd2FibGU7AClMamF2YS9sYW5nL1Vuc3VwcG9ydGVkT3BlcmF0aW9uRXhj" +
        "ZXB0aW9uOwAtTGphdmEvbGFuZy9yZWZsZWN0L0ludm9jYXRpb25UYXJnZXRFeGNl" +
        "cHRpb247ABpMamF2YS9sYW5nL3JlZmxlY3QvTWV0aG9kOwAgTG9yZy9tb3ppbGxh" +
        "L2phdmFzY3JpcHQvQ29udGV4dDsAIUxvcmcvbW96aWxsYS9qYXZhc2NyaXB0L0Z1" +
        "bmN0aW9uOwAnTG9yZy9tb3ppbGxhL2phdmFzY3JpcHQvUmhpbm9FeGNlcHRpb247" +
        "ACNMb3JnL21vemlsbGEvamF2YXNjcmlwdC9TY3JpcHRhYmxlOwAWVGhyb3dhYmxl" +
        "UmVzb2x2ZXIuamF2YQABVgACVkwAEltMamF2YS9sYW5nL0NsYXNzOwATW0xqYXZh" +
        "L2xhbmcvT2JqZWN0OwAdYXNzdXJlQ29udGV4dEZvckN1cnJlbnRUaHJlYWQABGNh" +
        "bGwAMmNvbS56aGVrYXNtaXJub3YuaW5uZXJjb3JlLm1vZC5leGVjdXRhYmxlLkNv" +
        "bXBpbGVyAAdmb3JOYW1lAApnZXRNZXNzYWdlAAlnZXRNZXRob2QADmdldFBhcmVu" +
        "dFNjb3BlAAZpbnZva2UAC2ludm9rZVJoaW5vAA1pbnZva2VSdW50aW1lAC16aGVr" +
        "YXNtaXJub3YubGF1bmNoZXIubW9kLmV4ZWN1dGFibGUuQ29tcGlsZXIAAAADAAAA" +
        "EAAOAA4AAAABAAAACAAAAAIAAAAIABIAAgAAAA4ADgABAAAACQAAAAQAAAANABAA" +
        "EAATAAIAAAAGABMAAAAAABAABw4BERcCdx3FadN6AntoAEcABw4AHwAHDgEQEGYA" +
        "LgIAAAcOACcDAAAABywBERAbagBGAgAABw4APwMAAAAHLAEREBtqADoCAAAHDgAz" +
        "AwAAAAcsAREQG2oAAwAAAAMAAwBwBgAAQAAAABoAHwBxEAkAAAAMABoBHQASAiMi" +
        "EgBuMAoAEAIMAGkAAAAOAA0AIgEEAG4QDQAAAAwAcCALAAEAJwENABoAJwBxEAkA" +
        "AAAMABoBHQASAiMiEgBuMAoAEAIMAGkAAAAo4g0AIgEKAHAgDgABACcBDQAiAQoA" +
        "cCAOAAEAJwENACjyAAAAAAUAAQAGAAAAFwAIAB4AAAARAA0AAwMCEgQdBTcCBB0F" +
        "NwICMAU+AAABAAEAAQAAAIIGAAAEAAAAcBAMAAAADgADAAAAAwABAIcGAAAYAAAA" +
        "YgEAABIAHwAGABICIyITAG4wDwABAgwAHwANABEADQAiAQoAcCAOAAEAJwENACj5" +
        "AAAAAA4AAQABAgsWAw8AAAMAAgADAAAAkAYAAAkAAAByEBEAAQAMAHEwBAAQAgwA" +
        "EQAAAAgAAwAFAAEAlwYAADIAAAASARIEcQACAAAADAI4BQ4AchASAAUADAASAyMz" +
        "EwByUxAAJlAMABEAEgAfABAAKPUNAAcCcQACAAAADAM4BRAAchASAAUADAASESMR" +
        "EwBNAgEEclEQADdQDAAo5gcQHwAQACjzAgAAABUAAQABAQkYAwACAAMAAACkBgAA" +
        "CQAAAHIQEQABAAwAcTAEABACDAARAAAACAADAAUAAQCrBgAAMgAAABIBEgRxAAIA" +
        "AAAMAjgFDgByEBIABQAMABIDIzMTAHJTEAAmUAwAEQASAB8AEAAo9Q0ABwJxAAIA" +
        "AAAMAzgFEAByEBIABQAMABIRIxETAE0CAQRyURAAN1AMACjmBxAfABAAKPMCAAAA" +
        "FQABAAEBDxgDAAIAAwAAALgGAAAJAAAAchARAAEADABxMAQAEAIMABEAAAAIAAMA" +
        "BQABAL8GAAAyAAAAEgESBHEAAgAAAAwCOAUOAHIQEgAFAAwAEgMjMxMAclMQACZQ" +
        "DAARABIAHwAQACj1DQAHAnEAAgAAAAwDOAUQAHIQEgAFAAwAEhEjERMATQIBBHJR" +
        "EAA3UAwAKOYHEB8AEAAo8wIAAAAVAAEAAQEHGAEACQAAGgCYgATMDQGBgASIDwEK" +
        "oA8BCfAPAQmUEAEJlBEBCbgRAQm4EgEJ3BIAAA4AAAAAAAAAAQAAAAAAAAABAAAA" +
        "KAAAAHAAAAACAAAAFAAAABABAAADAAAADAAAAGABAAAEAAAAAQAAAPABAAAFAAAA" +
        "EwAAAPgBAAAGAAAAAQAAAJACAAACIAAAKAAAALACAAABEAAABwAAACwGAAADEAAA" +
        "AQAAAGwGAAADIAAACQAAAHAGAAABIAAACQAAAMwGAAAAIAAAAQAAANwJAAAAEAAA" +
        "AQAAAAwKAAA=");
    return java.lang.Class.forName("io.nernar.rhino.ThrowableResolver", false, (function () {
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            var buffer = java.nio.ByteBuffer.wrap(bytes);
            // @ts-ignore
            return new Packages.dalvik.system.InMemoryDexClassLoader(buffer, getContext().getClassLoader());
        }
        var dex = new java.io.File(__dir__ + ".dex/0");
        dex.getParentFile().mkdirs();
        dex.createNewFile();
        var stream = new java.io.FileOutputStream(dex);
        stream.write(bytes);
        stream.close();
        // @ts-ignore
        return new Packages.dalvik.system.PathClassLoader(dex.getPath(), getContext().getClassLoader());
    })()).newInstance();
})();
EXPORT("resolveThrowable", resolveThrowable);
/**
 * Delays the action in the interface
 * thread for the required time.
 * @param action action
 * @param time expectation
 */
var handle = function (action, time) {
    getContext().runOnUiThread(new java.lang.Runnable({
        run: function () { return new android.os.Handler().postDelayed(new java.lang.Runnable({
            run: function () {
                try {
                    if (action) {
                        action();
                    }
                }
                catch (e) {
                    reportError(e);
                }
            }
        }), time >= 0 ? time : 0); }
    }));
};
EXPORT("handle", handle);
/**
 * Delays the action in the interface and
 * async waiting it in current thread.
 * @param action to be acquired
 * @param fallback default value
 * @returns action result or {@link fallback}
 */
var acquire = function (action, fallback) {
    var completed = false;
    getContext().runOnUiThread(new java.lang.Runnable({
        run: function () {
            try {
                if (action) {
                    var value = action();
                    if (value !== undefined) {
                        fallback = value;
                    }
                }
            }
            catch (e) {
                reportError(e);
            }
            completed = true;
        }
    }));
    while (!completed) {
        java.lang.Thread.yield();
    }
    return fallback;
};
EXPORT("acquire", acquire);
/**
 * Interrupts currently stacked threads, it must
 * be implemented in your {@link java.lang.Thread Thread} itself.
 */
var interruptThreads = function () {
    while (_this.threadStack.length > 0) {
        var thread = _this.threadStack.shift();
        if (!thread.isInterrupted()) {
            thread.interrupt();
        }
    }
};
EXPORT("interruptThreads", interruptThreads);
/**
 * Processes some action, that can be
 * completed in foreground or background.
 * @param action action
 * @param priority number between 1-10
 */
var handleThread = function (action, priority) {
    var thread = new java.lang.Thread(new java.lang.Runnable({
        run: function () {
            try {
                if (action) {
                    action();
                }
            }
            catch (e) {
                reportError(e);
            }
            var index = _this.threadStack.indexOf(thread);
            if (index != -1)
                _this.threadStack.splice(index, 1);
        }
    }));
    _this.threadStack.push(thread);
    if (priority !== undefined) {
        thread.setPriority(priority);
    }
    thread.start();
    return thread;
};
EXPORT("handleThread", handleThread);
/**
 * Generates a random number from minimum to
 * maximum value. If only the first is indicated,
 * generation will occur with a probability of
 * one less than a given number.
 * @param min minimum number
 * @param max maximum number
 */
var random = function (min, max) {
    max == undefined && (max = min - 1, min = 0);
    return Math.floor(Math.random() * (max - min + 1) + min);
};
EXPORT("random", random);
/**
 * Returns the difference between the current time
 * and the start time of the library.
 */
var getTime = function () { return Date.now() - launchTime; };
EXPORT("getTime", getTime);
/**
 * Returns `true` when numeral is verb in europic
 * languages, e.g. when count % 10 = 1, etc.
 * @param count integer
 */
var isNumeralVerb = function (count) {
    if (count < 0)
        count = Math.abs(count);
    return count % 10 == 1 && count % 100 != 11;
};
EXPORT("isNumeralVerb", isNumeralVerb);
/**
 * Returns `true` when numeral is many in europic
 * languages, e.g. when count >= *5, count % 10 = 0, etc.
 * @param count integer
 */
var isNumeralMany = function (count) {
    if (count < 0)
        count = Math.abs(count);
    return count % 10 == 0 || count % 10 >= 5 || count % 100 - count % 10 == 10;
};
EXPORT("isNumeralMany", isNumeralMany);
/**
 * Translates existing strokes, added via
 * {@link Translation.addTranslation}, replaces
 * formatted `%s`, `%d` and similiar arguments.
 * @param str stroke to translate
 * @param args to replace with `format`
 */
var translate = function (str, args) {
    try {
        str = Translation.translate(str);
        if (args !== undefined) {
            if (!Array.isArray(args)) {
                args = [args];
            }
            args = args.map(function (value) { return "" + value; });
            str = java.lang.String.format(str, args);
        }
        return "" + str;
    }
    catch (e) {
        return "" + str;
    }
};
EXPORT("translate", translate);
/**
 * Translates existing strokes by numeral, added via
 * {@link Translation.addTranslation}, replaces
 * formatted `%s`, `%d` and similiar arguments.
 * Uses simply europic languages verbs in counters.
 * @param count numeric integer to perform translation
 * @param whenZero count = 0
 * @param whenVerb count % 10 = 1, see {@link isNumeralVerb}
 * @param whenLittle any case instead of others when's
 * @param whenMany count >= *5, count % 10 = 0, see {@link isNumeralMany}
 * @param args to replace with `format`, when count = value it will be remapped additionally
 */
var translateCounter = function (count, whenZero, whenVerb, whenLittle, whenMany, args) {
    try {
        if (args !== undefined) {
            if (!Array.isArray(args)) {
                args = [args];
            }
        }
        else
            args = [count];
        if (!(count == 0 || isNumeralMany(count))) {
            var stroke_1 = "" + count;
            stroke_1 = stroke_1.substring(0, stroke_1.length - 2);
            args = args.map(function (value) { return value == count ? stroke_1 : value; });
        }
        return translate(count == 0 ? whenZero : isNumeralVerb(count) ? whenVerb :
            isNumeralMany(count) ? whenMany : whenLittle, args);
    }
    catch (e) {
        reportError(e);
    }
    return translate(whenZero, args);
};
EXPORT("translateCounter", translateCounter);
/**
 * Shortcut to currently context decor window.
 */
var getDecorView = function () { return getContext().getWindow().getDecorView(); };
EXPORT("getDecorView", getDecorView);
/**
 * Maximum display metric, in pixels.
 */
var getDisplayWidth = function () { return Math.max(_this.display.getWidth(), _this.display.getHeight()); };
EXPORT("getDisplayWidth", getDisplayWidth);
/**
 * Relative to display width value.
 * @param x percent of width
 */
var getDisplayPercentWidth = function (x) { return Math.round(getDisplayWidth() / 100 * x); };
EXPORT("getDisplayPercentWidth", getDisplayPercentWidth);
/**
 * Minimum display metric, in pixels.
 */
var getDisplayHeight = function () { return Math.min(_this.display.getWidth(), _this.display.getHeight()); };
EXPORT("getDisplayHeight", getDisplayHeight);
/**
 * Relative to display height value.
 * @param y percent of height
 */
var getDisplayPercentHeight = function (y) { return Math.round(getDisplayHeight() / 100 * y); };
EXPORT("getDisplayPercentHeight", getDisplayPercentHeight);
/**
 * Dependent constant per pixel size on display.
 */
var getDisplayDensity = function () { return _this.metrics.density; };
EXPORT("getDisplayDensity", getDisplayDensity);
/**
 * Relative dependent on pixel size width value.
 * @param x percent of width
 */
var getRelativeDisplayPercentWidth = function (x) { return Math.round(getDisplayWidth() / 100 * x / _this.metrics.density); };
EXPORT("getRelativeDisplayPercentWidth", getRelativeDisplayPercentWidth);
/**
 * Relative dependent on pixel size height value.
 * @param y percent of height
 */
var getRelativeDisplayPercentHeight = function (y) { return Math.round(getDisplayHeight() / 100 * y / _this.metrics.density); };
EXPORT("getRelativeDisplayPercentHeight", getRelativeDisplayPercentHeight);
/**
 * Applies Android TypedValue `COMPLEX_UNIT_DIP`.
 * @param value to change dimension
 */
var toComplexUnitDip = function (value) { return android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, value, _this.metrics); };
EXPORT("toComplexUnitDip", toComplexUnitDip);
/**
 * Applies Android TypedValue `COMPLEX_UNIT_SP`.
 * @param value to change dimension
 */
var toComplexUnitSp = function (value) { return android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_SP, value, _this.metrics); };
EXPORT("toComplexUnitSp", toComplexUnitSp);
/**
 * For caching, you must use the check amount
 * files and any other content, the so-called hashes.
 * @param bytes to perform digest, e.g. `new java.lang.String(?).getBytes()`
 */
var toDigestMd5 = (function () {
    var digest = java.security.MessageDigest.getInstance("md5");
    return function (bytes) {
        digest.update(bytes);
        var byted = digest.digest();
        var sb = new java.lang.StringBuilder();
        for (var i = 0; i < byted.length; i++) {
            sb.append(java.lang.Integer.toHexString(0xFF & byted[i]));
        }
        return sb.toString();
    };
})();
EXPORT("toDigestMd5", toDigestMd5);
/**
 * Uses device vibrator service to make vibration.
 * @param milliseconds to vibrate
 */
var vibrate = (function () {
    var service = getContext().getSystemService(android.content.Context.VIBRATOR_SERVICE);
    return function (milliseconds) { return service.vibrate(milliseconds); };
})();
EXPORT("vibrate", vibrate);
