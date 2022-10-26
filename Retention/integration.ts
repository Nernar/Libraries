/**
 * Milliseconds from moment when library started.
 */
const launchTime = Date.now()

EXPORT("launchTime", launchTime)

/**
 * Determines engine: Inner Core v1 or Horizon v2.
 */
const isHorizon = (() => {
	// @ts-ignore
	let version = MCSystem.getInnerCoreVersion()
	return parseInt(version.toString()[0]) >= 2
})()

EXPORT("isHorizon", isHorizon)

/**
 * Minecraft version running by Inner Core.
 * It must be `0`, `11` or `16`.
 */
const minecraftVersion = (() => {
	// @ts-ignore
	let version = MCSystem.getMinecraftVersion()
	return parseInt(version.toString().split(".")[1])
})()

EXPORT("minecraftVersion", minecraftVersion)

/**
 * Currently running activity, it context must be
 * required to perform interactions with Android.
 */
const getContext = () => UI.getContext()

EXPORT("getContext", getContext)

/**
 * @internal
 */
let threadStack = []
/**
 * @internal
 */
let display = getContext()?.getWindowManager().getDefaultDisplay()
/**
 * @internal
 */
let metrics = getContext()?.getResources().getDisplayMetrics()
/**
 * @internal
 */
let reportAction = (error: any) => {
	try {
		if (isHorizon) {
			// @ts-ignore
			Packages.com.zhekasmirnov.innercore.api.log.ICLog.i("WARNING", Packages.com.zhekasmirnov.innercore.api.log.ICLog.getStackTrace(error))
		} else {
			// @ts-ignore
			Packages.zhekasmirnov.launcher.api.log.ICLog.i("WARNING", Packages.zhekasmirnov.launcher.api.log.ICLog.getStackTrace(error))
		}
	} catch {
		try {
			Logger.Log(typeof error == "object" ? error.name + ": " + error.message + "\n" + error.stack : "" + error, "WARNING")
		} catch {
			Logger.Log("" + error, "WARNING")
		}
	}
}

/**
 * Display error in window, possibly in particular,
 * useful for visualizing and debugging problems.
 */
const reportError = (error: any) => {
	if (reportAction) {
		reportAction(error)
	}
}

EXPORT("reportError", reportError)

/**
 * Registers exception report action, it will be used as
 * default when {@link handle}, {@link handleThread}, etc. fails.
 * @param when action to perform with error
 */
const registerReportAction = (when: (error: any) => void) => {
	reportAction = when
}

EXPORT("registerReportAction", registerReportAction)

/**
 * Displays a log window for user whether it is
 * needed or not. On latest versions, number of such
 * windows on screen is limited for performance reasons.
 * @param message additional information
 * @param title e.g. mod name
 * @param fallback when too much dialogs
 */
const showReportDialog = (message: string, title: string, fallback?: Function): void => {
	if (isHorizon) {
		try {
			// @ts-ignore
			Packages.com.zhekasmirnov.innercore.api.log.DialogHelper.openFormattedDialog("" + message, "" + title, fallback || null)
		} catch (e) {
			// @ts-ignore
			Packages.com.zhekasmirnov.innercore.api.log.DialogHelper.openFormattedDialog("" + message, "" + title)
		}
	} else {
		// @ts-ignore
		Packages.zhekasmirnov.launcher.api.log.DialogHelper.openFormattedDialog("" + message, "" + title)
	}
}

EXPORT("showReportDialog", showReportDialog)

/**
 * Delays the action in main thread pool
 * directly for the required time, unhandled
 * exceptions will cause crash.
 * @param action action
 * @param time expectation
 * @returns sheduled future when no associated context
 */
const handleOnThread = ((): (action: () => void, time?: number) => void | java.util.concurrent.ScheduledFuture<any> => {
	if (getContext()) {
		const HANDLER = new android.os.Handler()
		return (action: () => void, time?: number) => getContext()?.runOnUiThread(
			new java.lang.Runnable({
				run: () => HANDLER.postDelayed(
					new java.lang.Runnable({
						run: action
					}),
					time >= 0 ? time : 0
				)
			})
		)
	}
	const EXECUTOR = java.util.concurrent.Executors.newScheduledThreadPool(10)
	return (action: () => void, time?: number) => EXECUTOR.schedule(
		new java.lang.Runnable({
			run: action
		}),
		time >= 0 ? time : 0,
		java.util.concurrent.TimeUnit.MILLISECONDS
	)
})()

EXPORT("handleOnThread", handleOnThread);

/**
 * Delays the action in main thread pool
 * safely for the required time.
 * @param action action
 * @param time expectation
 * @see {@link handleOnThread}
 */
const handle = (action: () => void, time?: number) => {
	return handleOnThread(() => {
		try {
			if (action) {
				action()
			}
		} catch (e) {
			reportError(e)
		}
	}, time)
}

EXPORT("handle", handle)

/**
 * Delays the action in main thread pool and
 * async waiting it in current thread.
 * @param action to be acquired
 * @param fallback default value
 * @returns action result or {@link fallback}
 * @see {@link handleOnThread}
 */
const acquire = (action: () => any, fallback?: any): any => {
	let completed = false
	handleOnThread(() => {
		try {
			if (action) {
				let value = action()
				if (value !== undefined) {
					fallback = value
				}
			}
		} catch (e) {
			reportError(e)
		}
		completed = true
	})
	while (!completed) {
		java.lang.Thread.yield()
	}
	return fallback
}

EXPORT("acquire", acquire)

/**
 * Interrupts currently stacked threads, it must
 * be implemented in your {@link java.lang.Thread Thread} itself.
 */
const interruptThreads = () => {
	while (threadStack.length > 0) {
		let thread = threadStack.shift()
		if (!thread.isInterrupted()) {
			thread.interrupt()
		}
	}
}

EXPORT("interruptThreads", interruptThreads)

/**
 * Processes some action, that can be
 * completed in foreground or background.
 * @param action action
 * @param priority number between 1-10
 */
const handleThread = (action: () => void, priority?: number) => {
	let thread = new java.lang.Thread(
		new java.lang.Runnable({
			run: () => {
				try {
					if (action) {
						action()
					}
				} catch (e) {
					reportError(e)
				}
				let index = threadStack.indexOf(thread)
				if (index != -1) threadStack.splice(index, 1)
			}
		})
	)
	threadStack.push(thread)
	if (priority !== undefined) {
		thread.setPriority(priority)
	}
	thread.start()
	return thread
}

EXPORT("handleThread", handleThread)

/**
 * Generates a random number from minimum to
 * maximum value. If only the first is indicated,
 * generation will occur with a probability of
 * one less than a given number.
 * @param min minimum number
 * @param max maximum number
 */
const random = (min: number, max?: number) => {
	max == undefined && (max = min - 1, min = 0)
	return Math.floor(Math.random() * (max - min + 1) + min)
}

EXPORT("random", random)

/**
 * Returns the difference between the current time
 * and the start time of the library.
 */
const getTime = () => Date.now() - launchTime

EXPORT("getTime", getTime)

/**
 * Returns `true` when numeral is verb in europic
 * languages, e.g. when count % 10 = 1, etc.
 * @param count integer
 */
const isNumeralVerb = (count: number) => {
	if (count < 0) count = Math.abs(count)
	return count % 10 == 1 && count % 100 != 11
}

EXPORT("isNumeralVerb", isNumeralVerb)

/**
 * Returns `true` when numeral is many in europic
 * languages, e.g. when count >= *5, count % 10 = 0, etc.
 * @param count integer
 */
const isNumeralMany = (count: number) => {
	if (count < 0) count = Math.abs(count)
	return count % 10 == 0 || count % 10 >= 5 || count % 100 - count % 10 == 10
}

EXPORT("isNumeralMany", isNumeralMany)

/**
 * Translates existing strokes, added via
 * {@link Translation.addTranslation}, replaces
 * formatted `%s`, `%d` and similiar arguments.
 * @param str stroke to translate
 * @param args to replace with `format`
 */
const translate = (str: string, args?: any[]) => {
	try {
		str = Translation.translate(str)
		if (args !== undefined) {
			if (!Array.isArray(args)) {
				args = [args]
			}
			args = args.map(value => "" + value)
			str = java.lang.String.format(str, args)
		}
		return "" + str
	} catch (e) {
		return "" + str
	}
}

EXPORT("translate", translate)

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
const translateCounter = (count: number, whenZero: string, whenVerb: string, whenLittle: string, whenMany: string, args?: any[]) => {
	try {
		if (args !== undefined) {
			if (!Array.isArray(args)) {
				args = [args]
			}
		} else args = [count]
		if (!(count == 0 || isNumeralMany(count))) {
			let stroke = "" + count
			stroke = stroke.substring(0, stroke.length - 2)
			args = args.map(value => value == count ? stroke : value)
		}
		return translate(count == 0 ? whenZero : isNumeralVerb(count) ? whenVerb :
			isNumeralMany(count) ? whenMany : whenLittle, args)
	} catch (e) {
		reportError(e)
	}
	return translate(whenZero, args)
}

EXPORT("translateCounter", translateCounter)

/**
 * Shortcut to currently context decor window.
 */
const getDecorView = () => getContext()?.getWindow().getDecorView()

EXPORT("getDecorView", getDecorView)

/**
 * Maximum display metric, in pixels.
 */
const getDisplayWidth = () => Math.max(display?.getWidth(), display?.getHeight())

EXPORT("getDisplayWidth", getDisplayWidth)

/**
 * Relative to display width value.
 * @param x percent of width
 */
const getDisplayPercentWidth = (x: number): number => Math.round(getDisplayWidth() / 100 * x)

EXPORT("getDisplayPercentWidth", getDisplayPercentWidth)

/**
 * Minimum display metric, in pixels.
 */
const getDisplayHeight = () => Math.min(display?.getWidth(), display?.getHeight())

EXPORT("getDisplayHeight", getDisplayHeight)

/**
 * Relative to display height value.
 * @param y percent of height
 */
const getDisplayPercentHeight = (y: number): number => Math.round(getDisplayHeight() / 100 * y)

EXPORT("getDisplayPercentHeight", getDisplayPercentHeight)

/**
 * Dependent constant per pixel size on display.
 */
const getDisplayDensity = () => metrics?.density

EXPORT("getDisplayDensity", getDisplayDensity)

/**
 * Relative dependent on pixel size width value.
 * @param x percent of width
 */
const getRelativeDisplayPercentWidth = (x: number): number => Math.round(getDisplayWidth() / 100 * x / metrics?.density)

EXPORT("getRelativeDisplayPercentWidth", getRelativeDisplayPercentWidth)

/**
 * Relative dependent on pixel size height value.
 * @param y percent of height
 */
const getRelativeDisplayPercentHeight = (y: number): number => Math.round(getDisplayHeight() / 100 * y / metrics?.density)

EXPORT("getRelativeDisplayPercentHeight", getRelativeDisplayPercentHeight)

/**
 * Applies Android TypedValue `COMPLEX_UNIT_DIP`.
 * @param value to change dimension
 */
const toComplexUnitDip = (value: number): number => android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_DIP, value, metrics)

EXPORT("toComplexUnitDip", toComplexUnitDip)

/**
 * Applies Android TypedValue `COMPLEX_UNIT_SP`.
 * @param value to change dimension
 */
const toComplexUnitSp = (value: number): number => android.util.TypedValue.applyDimension(android.util.TypedValue.COMPLEX_UNIT_SP, value, metrics)

EXPORT("toComplexUnitSp", toComplexUnitSp)

/**
 * For caching, you must use the check amount
 * files and any other content, the so-called hashes.
 * @param bytes to perform digest, e.g. `new java.lang.String(?).getBytes()`
 */
const toDigestMd5 = (() => {
	let digest = java.security.MessageDigest.getInstance("md5")
	return (bytes: native.Array<number>): string => {
		digest.update(bytes)
		let byted = digest.digest()
		let sb = new java.lang.StringBuilder()
		for (let i = 0; i < byted.length; i++) {
			sb.append(java.lang.Integer.toHexString(0xFF & byted[i]))
		}
		return sb.toString()
	}
})()

EXPORT("toDigestMd5", toDigestMd5)

/**
 * Uses device vibrator service to make vibration.
 * @param milliseconds to vibrate
 */
const vibrate = (() => {
	let service = getContext()?.getSystemService(android.content.Context.VIBRATOR_SERVICE)
	return (milliseconds: number): void => service?.vibrate(milliseconds)
})()

EXPORT("vibrate", vibrate)
