/**
 * @constructor
 * Processes thread besides [[sync()]] interface
 * context, that was used to indicate process.
 * Calls [[process()]] for every element requested
 * by [[next()]] besides [[execute()]] passed value.
 * @param {any} [obj] merges with prototype
 */
function Sequence(obj) {
	this.update = null;
	this.tick = null;
	this.complete = null;
	this.uncount = null;
	this.create = null;
	this.completed = null;
	if (obj !== undefined) {
		for (let element in obj) {
			this[element] = obj[element];
		}
	}
	this.id = "sequence" + (Sequence.uid++);
}

Sequence.uid = 0;

Sequence.prototype.getThread = function() {
	return this.thread !== undefined ? this.thread : null;
};

Sequence.prototype.getSynchronizeTime = function() {
	return this.between !== undefined ? this.between : 5;
};

Sequence.prototype.setSynchronizeTime = function(ms) {
	this.between = Number(ms);
};

Sequence.prototype.getPriority = function() {
	return this.priority !== undefined ? this.priority : 8;
};

Sequence.prototype.setPriority = function(priority) {
	this.priority = Number(priority);
	let thread = this.getThread();
	thread && thread.setPriority(this.getPriority());
};

Sequence.prototype.setFixedCount = function(count) {
	this.count = Number(count);
};

Sequence.prototype.getFixedCount = function() {
	return this.count !== undefined ? this.count : 1;
};

Sequence.prototype.setReportingEnabled = function(enabled) {
	this.reporting = Boolean(enabled);
};

Sequence.prototype.isReportingEnabled = function() {
	return this.reporting !== undefined ? this.reporting : true;
};

/**
 * Sync recursive action, that awaits when
 * process is completed, interrupted or cancelled.
 * @param {number} active process startup milliseconds
 */
Sequence.prototype.sync = function(active) {
	let sequence = this;
	handle(function() {
		if (sequence.completed == null) {
			if (sequence.updated) {
				sequence.update && sequence.update.call(sequence, sequence.count === undefined ?
					sequence.index : sequence.index / sequence.count * 100, sequence.index);
				delete sequence.updated;
			}
			sequence.tick && sequence.tick(sequence.index, Date.now() - active, active);
			sequence.sync && sequence.sync(active);
			return;
		}
		if (sequence.completed) {
			sequence.complete && sequence.complete.call(sequence, Date.now() - active, active);
		}
		delete sequence.completed;
		delete sequence.index;
	}, this.getSynchronizeTime());
};

/**
 * Action that launches main process and sync.
 * @param {any} [value] data to process
 */
Sequence.prototype.execute = function(value) {
	if (this.thread !== undefined && this.thread !== null) {
		MCSystem.throwException("Sequence: Sequence (id=" + this.id + ") is already running");
	}
	this.index = 0;
	this.thread = {};
	let sequence = this;
	handle(function() {
		let active = Date.now(), next;
		sequence.create && sequence.create.call(sequence, value, active);
		sequence.thread = handleThread(function() {
			try {
				if (sequence.uncount != null) {
					sequence.count = sequence.uncount.call(sequence, value);
					sequence.require();
				}
				while ((next = sequence.next.call(sequence, value, sequence.index)) !== undefined) {
					if (sequence.isInterrupted()) java.lang.Thread.sleep(1);
					sequence.index = sequence.process.call(sequence, next, value, sequence.index);
					sequence.require();
				}
				sequence.completed = true;
			} catch (e) {
				sequence.completed = false;
				handle(function() {
					sequence.cancel && sequence.cancel.call(sequence, e);
				});
			}
			delete sequence.thread;
			if (sequence.uncount != null) {
				delete sequence.count;
			}
			delete sequence.updated;
		}, sequence.getPriority());
		sequence.sync && sequence.sync(active);
	});
};

/**
 * Must be called inside [[process()]] or [[next()]]
 * if you want to force update process indexes.
 * Recommended to use if [[uncount()]] wouldn't
 * help in dynamical reupdate or just update progress.
 * @param {number} [index] currently progress
 * @param {number} [count] maximum value
 */
Sequence.prototype.require = function(index, count) {
	if (index !== undefined) {
		this.index = index;
	}
	if (count !== undefined) {
		this.count = count;
	}
	this.updated = true;
};

Sequence.prototype.shrink = function(addition) {
	if (addition !== undefined) {
		if (this.count === undefined) {
			this.count = 0;
		}
		this.count += addition;
	}
	this.updated = true;
};

/**
 * @async Wouldn't access interface thread.
 * Calls for every item inside [[process]], passed
 * value will be used into it. That action created
 * to communicate executing object with process,
 * split it to processable parts.
 * @param {any} value passed on execute
 * @param {number} index was returned by [[process()]]
 * @returns {any} value or element to [[process()]]
 */
Sequence.prototype.next = function(value, index) {
	if (index >= this.getFixedCount()) {
		return;
	}
	return ++index;
};

/**
 * @async Wouldn't access interface thread.
 * Main sequence process in thread;
 * handles object and returns index.
 * @param {any} element next result to handle
 * @param {any} value elements resolver
 * @param {number} index indicates progress
 * @returns {number} index to sync
 * @throws must be overwritten in usage
 */
Sequence.prototype.process = function(element, value, index) {
	MCSystem.throwException("Sequence: Sequence.process must be implemented");
};

Sequence.prototype.cancel = function(error) {
	if (error && error.message != "java.lang.InterruptedException: null") {
		if (this.isReportingEnabled()) reportError(error);
	}
};

Sequence.prototype.interrupt = function() {
	if (!this.isInterrupted()) {
		let thread = this.getThread();
		thread && thread.interrupt();
	}
};

Sequence.prototype.isInterrupted = function() {
	let thread = this.getThread();
	return thread && thread.isInterrupted();
};

Sequence.prototype.assureYield = function(thread) {
	if (this.getThread() === null) {
		return false;
	}
	while (this.getThread() !== null) {
		if (thread === undefined) {
			java.lang.Thread.yield();
		} else thread.yield();
	}
	return true;
};

EXPORT("Sequence", Sequence);
