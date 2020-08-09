/**
 * Creates a connection to remote server.
 */
declare class Network {
	
	/**
	 * Creates a connection.
	 * For example:
	 * 
	 * ```ts
	 * let connect = new Network();
	 * connect.setAddress("https://google.com");
	 * Logger.Log("Length: " + connect.getLength());
	 * ```
	 */
	constructor();
	
	/**
	 * Creates a connection to specific remote address.
	 * For example:
	 * 
	 * ```ts
	 * let connect = new Network("https://google.com");
	 * Logger.Log("Length: " + connect.getLength());
	 * ```
	 * 
	 * @param address address
	 */
	constructor(address: string);
	
	/**
	 * Returns url was set by connection.
	 * @returns java url
	 */
	getUrl(): Object | null;
	
	/**
	 * Sets current url as an java object.
	 * If you need set address, use appropriate method.
	 * @param url java url
	 */
	setUrl(url: Object | null): void;

	/**
	 * Use to specify remote address as a string.
	 * @param address address
	 * @returns is installed successfully
	 */
	setAddress(address: string): boolean;
	
	/**
	 * Event receiver, use to track actions.
	 * @param callback callback
	 */
	setCallback(callback: Network.Callback): void;
	
	/**
	 * Opens and returns a data stream.
	 * If url isn't specified, [[null]] is returned.
	 * @returns java stream
	 */
	getStream() : Object | null;
	
	/**
	 * If connection doesn't exist, creates a new one.
	 */
	validateConnection(): void;
	
	/**
	 * Open or returns an existing connection.
	 * @returns java connection
	 */
	getConnection(): void;
	
	/**
	 * Opens or returns an existing connection.
	 * @param force if [[true]], willn't open a new connection
	 * @returns java connection
	 */
	getConnection(force: boolean): Object | null;

	/**
	 * Returns true if connection exists.
	 * @returns has connection
	 */
	hasConnection(): boolean;
	
	/**
	 * Connects to created url if it's created.
	 * @throws if connection creation failed
	 */
	connect(): void;
	
	/**
	 * Disconnects from existing connection.
	 * If connection doesn't exist, nothing happens.
	 */
	disconnect(): void;
	
	/**
	 * Gets length of output connection.
	 * If connection failed, returns [[-1]].
	 * @returns bytes count
	 */
	getLength(): number;
}

/**
 * Use to manage your current connections.
 */
declare namespace Network {
	
	/**
	 * Use callbacks to track actions.
	 * Never load them during processes.
	 */
	interface Callback {
		
		/**
		 * Called if the url has been changed.
		 */
		onUrlChanged(network: Network, url: Object | null): void;
		
		/**
		 * Called when any connection is opened.
		 * Usually during any processes.
		 */
		onCreateConnection(network: Network, connection: Object | null): void;
		
		/**
		 * Called during connection.
		 */
		onConnect(network: Network, connection: Object | null): void;
		
		/**
		 * Called during disconnection.
		 */
		onDisconnect(network: Network, connection: Object | null): void;
		
		/**
		 * Called if a stream size has been requested somewhere.
		 * Especially useful not ask for size again during process.
		 */
		getLength(network: Network, length: number): void;
	}
	
	/**
	 * Checks if there's has internet connection.
	 * Based on application context.
	 * @returns has connection
	 */
	function isOnline(): boolean;
	
	/**
	 * Checks if there's has internet connection.
	 * @param context interface context
	 * @returns has connection
	 */
	function isOnline(context: Object): boolean;
	
	/**
	 * Use to read data from a connection.
	 */
	class Reader extends Network {
		
		/**
		 * Creates a connection to read text data.
		 * For example:
		 * 
		 * ```ts
		 * let reader = new Network.Reader();
		 * reader.setAddress("https://google.com");
		 * Logger.Log(reader.read());
		 * ```
		 */
		constructor();
		
		/**
		 * Creates a connection to read text data.
		 * For example:
		 * 
		 * ```ts
		 * let reader = new Network.Reader("https://google.com");
		 * Logger.Log(reader.read());
		 * ```
		 * 
		 * @param address address
		 */
		constructor(address: string);
		
		/**
		 * Event receiver, use to track actions.
		 * @param callback callback
		 */
		setCallback(callback: Reader.Callback): void;
		
		/**
		 * Returns current charset of being read data.
		 * @returns charset
		 */
		getCharset(): string | null;
		 
		/**
		 * Resets current charset, must be reloaded.
		 * See {@link https://wikipedia.org/wiki/Character_encoding|character encoding} for more details.
		 */
		setCharset(): void;
		 
		/**
		 * Sets charset for new connections.
		 * If charset is [[null]], system encoding will be used.
		 * @param character encoding
		 * See {@link https://wikipedia.org/wiki/Character_encoding|character encoding} for more details.
		 */
		setCharset(charset: string | null): void;
		 
		/**
		 * Returns stream reader, or [[null]] if create failed.
		 * @returns java stream reader
		 */
		getStreamReader(): Object | null;
		
		/**
		 * Returns [[true]] if read process is running.
		 * @returns in process
		 */
		inProcess(): boolean;
		
		/**
		 * Returns currently read data as an array.
		 * Returns [[null]] if read process hasn't been started.
		 * @returns readed array
		 */
		getCurrentlyReaded(): Object | null;
		
		/**
		 * Returns number of readed lines.
		 * Returns [[-1]] if there is no connection.
		 * @returns readed lines count
		 */
		getReadedCount(): number;
		
		/**
		 * Returns readed result, or [[null]] if none.
		 * @returns result
		 */
		getResult(): string | null;
		
		/**
		 * Reading process, isn't recommended run on main thread.
		 * Wait until work is ended, and method will be return result.
		 * @throws error will occur if there's no connection
		 * @returns read lines
		 */
		read(): string;
	}
	
	/**
	 * Used to manage readers.
	 */
	namespace Reader {
		
		/**
		 * It's fed to callback installation.
		 */
		interface Callback extends Callback {
			
			/**
			 * Called when data encoding has being changed.
			 */
			onCharsetChanged(reader: Network.Reader, charset: string | null): void;
			
			/**
			 * Called before starting reading process.
			 */
			onPrepare(reader: Network.Reader): void;
			
			/**
			 * Called when a line is read from a stream.
			 * Result in this case is currently read result.
			 */
			onReadLine(reader: Network.Reader, result: Array, line: string): void;
			
			/**
			 * Called when a read is complete.
			 */
			onComplete(reader: Network.Reader): void;
		}
	}
	
	/**
	 * Use to record stream to output.
	 * Must be overwritten with any prototype.
	 * See [[getOutputStream()]] method for details.
	 */
	abstract class Writer extends Network {
		
		/**
		 * Loads a data stream.
		 * Must be overwritten with any prototype.
		 * See [[getOutputStream()]] method for details.
		 */
		constructor();
		
		/**
		 * Loads a data stream into specified stream.
		 * Must be overwritten with any prototype.
		 * See [[getOutputStream()]] method for details.
		 * @param address address
		 */
		constructor(address: string);
		
		/**
		 * Event receiver, use to track actions.
		 * @param callback callback
		 */
		setCallback(callback: Writer.Callback): void;
		
		/**
		 * Returns buffer size for reading data.
		 * Returns [[-1]] if default value setted.
		 * @returns buffer size
		 */
		getBufferSize(): number;
		
		/**
		 * Resets buffer size to system size.
		 */
		setBufferSize(): void;
		
		/**
		 * Sets read buffer size.
		 * @param size buffer size
		 */
		setBufferSize(size: number | null): void;
		
		/**
		 * Returns length of readed data 
		 * Returns [[-1]] if there is no connection.
		 * @returns readed data length
		 */
		getReadedCount(): number;
		
		/**
		 * Returns a stream reader, can be overwritten in prototypes.
		 * @returns java input stream
		 */
		getStreamReader(): Object | null;
		
		/**
		 * Returns output stream, must be overwritten by any prototype.
		 * @throws error if not overwritten by prototype
		 */
		abstract getOutputStream(): Object;
		
		/**
		 * Returns [[true]] if download process is running.
		 * @returns in process
		 */
		inProcess(): boolean;
		
		/**
		 * Loads a file into given output data stream.
		 * @throws error will occur if there's no connection
		 * @throws error if output stream is invalid
		 */
		download(): void;
	}
	
	/**
	 * Used to control writers.
	 */
	namespace Writer {
		
		/**
		 * It's fed to callback installation.
		 */
		interface Callback extends Callback {
			
			/**
			 * Called before write process starts.
			 */
			onPrepare(writer: Network.Writer, length: number): void;
			
			/**
			 * Called during process execution, use to update data.
			 * Don't overload this method, otherwise it may lead an error.
			 */
			onProgress(writer: Network.Writer, progress: number, length: number): void;
			
			/**
			 * Called when writing process has completed.
			 */
			onComplete(writer: Network.Writer, length: number): void;
		}
	}
	
	/**
	 * Use to download stream into file.
	 */
	class Downloader extends Writer {
		
		/**
		 * Loads a configured stream to file.
		 * For example:
		 * 
		 * ```ts
		 * let writer = new Network.Downloader();
		 * writer.setAddress("https://google.com");
		 * writer.setPath("/sdcard/google.html");
		 * writer.download();
		 * ```
		 */
		constructor();
		
		/**
		 * Loads a stream to specified file.
		 * For example:
		 * 
		 * ```ts
		 * let writer = new Network.Downloader("https://google.com");
		 * writer.setPath("/sdcard/google.html");
		 * writer.download();
		 * ```
		 * 
		 * @param address address
		 */
		constructor(address: string);
		
		/**
		 * Loads a stream to file.
		 * For example:
		 * 
		 * ```ts
		 * let writer = new Network.Downloader("https://google.com", "/sdcard/google.html");
		 * writer.download();
		 * ```
		 * 
		 * @param address address
		 * @param path file path
		 */
		constructor(address: string, path: string);
		
		/**
		 * Event receiver, use to track actions.
		 * @param callback callback
		 */
		setCallback(callback: Downloader.Callback): void;
		
		/**
		 * Returns currently specified file.
		 * @returns java file
		 */
		getFile() : Object | null;
		
		/**
		 * Flushes current file.
		 */
		setFile(): void;
		
		/**
		 * Sets java file to stream.
		 * @param file java file
		 */
		setFile(file: Object | null): void;
		
		/**
		 * Returns currently file path.
		 * Returns [[null]] if file isn't specified.
		 * @returns specified path
		 */
		getPath(): string | null;
		
		/**
		 * Sets path to file, replaces current file.
		 * @param path file path
		 */
		setPath(path: string): void;
		
		/**
		 * Returns output stream from file.
		 * If file isn't specified, will return [[null]].
		 * @returns output stream
		 */
		getOutputStream(): Object | null;
	}
	
	/**
	 * Used to control writers.
	 */
	namespace Downloader {
		
		/**
		 * It's fed to callback installation.
		 */
		interface Callback extends Writer.Callback {
			
			/**
			 * Called when a file has changed.
			 */
			onFileChanged(downloader: Network.Downloader, file: Object | null): void;
		}
	}
	
	/**
	 * A quick way to create thread.
	 * @param action action to handle
	 */
	function handle(action: Function): void;
	
	/**
	 * Callback for throws tracking.
	 */
	interface HandleCallback extends Callback {
		
		/**
		 * Called if an error occurs during process.
		 * Unexpected disconnection is a common mistake.
		 */
		onFail(connect?: any): void;
		
		/**
		 * Called if user hasn't internet connection.
		 */
		isNotConnected(): void;
	}
	
	/**
	 * A quick way to create thread, errors are handled.
	 * @param action action to handle
	 * @param callback fail callback
	 */
	function handle(action: Function, callback: HandleCallback | Function): void;
	
	/**
	 * A quick way to create thread, errors are handled.
	 * @param action action to handle
	 * @param callback fail callback
	 * @param connect will be passed into callback
	 */
	function handle(action: Function, callback: HandleCallback | Function, connect: any): void;
	
	/**
	 * A quick way to length content from connection.
	 * @param address url address
	 * @param callback action or callback
	 * @returns has process started
	 */
	function lengthUrl(address: string, callback: HandleCallback | Function): boolean;
	
	/**
	 * A quick way to read data from connection.
	 * @param address url address
	 * @param callback action or callback
	 * @returns has process started
	 */
	function readUrl(address: string, callback: HandleCallback | Function): boolean;
	
	/**
	 * A quick way to download file from connection.
	 * @param address url address
	 * @param path file path
	 * @returns has process started
	 */
	function downloadUrl(address: string, path: string): boolean;
	
	/**
	 * A quick way to download file from connection.
	 * @param address url address
	 * @param path file path
	 * @param callback action or callback
	 * @returns has process started
	 */
	function downloadUrl(address: string, path: string, callback: HandleCallback | Function): boolean;
}
