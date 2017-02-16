'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process'; 

function invokePromise(func, ...args) {
    return new Promise((resolve, reject) => {
        let callback = args[args.length - 1];
        args[args.length - 1] = function (...args) {
            args = [resolve, reject, ...args];
            callback.apply(undefined, args);
        };
        func.apply(undefined, args);
    });
}

export function activate(context: vscode.ExtensionContext) {
	// to store all terminals
	let terminalStack: vscode.Terminal[] = []; 

	// loading bar
	let loadingBar = new LoadingBar();

	// get ruff default settings
	let config = vscode.workspace.getConfiguration('ruff');
	let that = this;
	this.settings = {
      rootDirectory: config.get('rootDirectory'),
	  defaultProjectName: config.get('defaultProjectName')
    };

	// to store the project path as global variable
	let ruffPath = "";

	// set initialize guide question 
	let questionProjectPath = `What's the path of the project?`;
	let questionProjectName = `What's the name of the project?`;

	// initialize ruff project
	context.subscriptions.push(vscode.commands.registerCommand('ruff.rapInit', () => {

		// get default project path
		let defaultPath = vscode.workspace.rootPath;
		if (typeof vscode.window.activeTextEditor != "undefined") 
			defaultPath = defaultPath || path.dirname(vscode.window.activeTextEditor.document.fileName);
		else
			defaultPath = defaultPath || that.settings.rootDirectory;
			
		vscode.window.showInputBox({
			prompt: questionProjectPath,
			value: defaultPath
		}).then(selectedProjectPath => {
			if (selectedProjectPath === null || typeof selectedProjectPath === 'undefined') {
				return;
			}
			
			//set ruff Path
			ruffPath = selectedProjectPath; 
			
			vscode.window.showInputBox({
				prompt: questionProjectName,
				value: that.settings.defaultProjectName
			}).then(projectName => {

				if(projectName === null || typeof projectName === 'undefined') {
					return;
				}

				ruffPath = ruffPath + "/" + projectName;

				loadingBar.load();

				new Promise((resolve, reject) => {
					child_process.exec(`mkdir -p ${ruffPath}`, function(error,stdout,stderr){
						if (error) {
							reject(error);
						} else {
							resolve(stdout.trim());
						}
					});
				}).then(value => {
					return invokePromise(child_process.exec, `cd ${ruffPath} && rap init -y`, (resolve, reject, error, stdout, stderr) => {
						if (error) {
							reject(error);
						} else {
							resolve(stdout.trim());
						}
					})
				}).then(value => {
					let uri = vscode.Uri.parse(ruffPath);
					vscode.commands.executeCommand('vscode.openFolder', uri);
					loadingBar.loaded();
					// todo : can't open the particular file in this folder
					// let fileName = `${ruffPath}/src/index.js`;
					// console.log(fileName,"adfa");
					// vscode.workspace.openTextDocument(fileName).then(doc => {
					// 	console.log(doc);
					// 	if (!doc) {
					// 		return Promise.reject(new Error('Could not open file!'));
					// 	}
					// 	console.log("here");
					// 	vscode.window.showTextDocument(doc).then((editor) => {
					// 		console.log(editor);
					// 		if (!editor) {
					// 			Promise.reject(new Error('Could not show document!'));
					// 			return;
					// 		}
					// 	});
					// });
				}).catch(error => {
					loadingBar.loaded();
				});
			})

		});

	}));

	// deploy ruff project
	context.subscriptions.push(vscode.commands.registerCommand('ruff.rapDeploy', () => {
		let folderPath = vscode.workspace.rootPath;
		if (!!ruffPath) {
			child_process.exec("cd " + ruffPath + " && rap deploy -s 192.168.31.199", function(error,stdout,stderr){
				console.log("deploy success");
				vscode.window.showInformationMessage('Deploy Complete');
			});
		}
	}));

	// use terminal to show ruff log
	context.subscriptions.push(vscode.commands.registerCommand('ruff.rapLog', () => {
		terminalStack.push((<any>vscode.window).createTerminal(`Ruff Log #${terminalStack.length + 1}`));
		getLatestTerminal().sendText("rap log 192.168.31.199");
		getLatestTerminal().show();
	}));

	function getLatestTerminal() {
		return terminalStack[terminalStack.length - 1];
	}
}

class LoadingBar {
	private _statusBarItem: vscode.StatusBarItem;

	public load() {
		let showText = "loading...";
		let pos = 0;
		if (!this._statusBarItem) {
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        }
		setInterval( () => {
			this._statusBarItem.text = showText.slice(0,7+pos);
			pos = (pos + 1) % 4;
		},300);
		this._statusBarItem.show();
	}

	public loaded() {
	    if (!this._statusBarItem) {
            this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
			this._statusBarItem.text = "";
        }
		this._statusBarItem.hide();
	}


	dispose() {
        this._statusBarItem.dispose();
    }
}


