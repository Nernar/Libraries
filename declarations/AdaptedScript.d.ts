declare const Packages: any;
declare const MCSystem: typeof LowLevelUtils;

declare function log(text: string): void;
declare function print(text: string): void;
declare function getClass(obj: any): any;

declare class JavaImporter {
	constructor(...args: any);
	importClass(clazz: any): void;
	importPackage(pkg: any): void;
	[key: string]: any;
}

declare namespace Entity {
	function setImmobile(entityUid: number, mobile: boolean): void;
	function setRotation(entityUid: number, yaw: number, pitch: number): void;
}


declare namespace android {
	export namespace app {
		export interface Activity {
			runOnUiThread(run: () => void): void;
		}
		export namespace AlertDialog {
			export interface Builder {
				setPositiveButton(param0: number, param1: (param0: android.content.DialogInterface, param1: number) => void): android.app.AlertDialog.Builder;
				setPositiveButton(param0: string, param1: (param0: android.content.DialogInterface, param1: number) => void): android.app.AlertDialog.Builder;
				setNegativeButton(param0: number, param1: (param0: android.content.DialogInterface, param1: number) => void): android.app.AlertDialog.Builder;
				setNegativeButton(param0: string, param1: (param0: android.content.DialogInterface, param1: number) => void): android.app.AlertDialog.Builder;
				setNeutralButton(param0: number, param1: (param0: android.content.DialogInterface, param1: number) => void): android.app.AlertDialog.Builder;
				setNeutralButton(param0: string, param1: (param0: android.content.DialogInterface, param1: number) => void): android.app.AlertDialog.Builder;
			}
		}
		export interface Dialog {
			setOnDismissListener(param0: (param0: android.content.DialogInterface) => void): void;
		}
	}
}

declare namespace java {
	export namespace lang {
		export function Runnable(run: () => void): Runnable;
		export function Thread(run: () => void): Thread;
	}
}

declare namespace org {
	export const mozilla: any;
}
