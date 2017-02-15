'use strict';

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as child_process from 'child_process'; 

export function activate(context: vscode.ExtensionContext) {
	// to store all terminals
	let terminalStack: vscode.Terminal[] = []; 

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

				new Promise((resolve, reject) => {
					child_process.exec(`mkdir -p ${ruffPath}`, function(error,stdout,stderr){
						if (error) {
							reject(error);
						} else {
							resolve(stdout.trim());
						}
					});
				}).then(value => {
					return new Promise((resolve, reject) => {
						child_process.exec(`cd ${ruffPath} && rap init -y`, function(error,stdout,stderr){
							if (error) {
								reject(error);
							} else {
								resolve(stdout.trim());
							}
						});
					});
				}).then(value => {
					let uri = vscode.Uri.parse(ruffPath);
					let fileName = `${ruffPath}/src/index.js`;

					vscode.commands.executeCommand('vscode.openFolder', uri).then(function (result) {
						vscode.window.showInformationMessage('Init Complete!');
					}).then(function () {
						return vscode.workspace.openTextDocument(`${ruffPath}/src/index.js`);
					}).then(doc => {
						console.log(doc);
					});

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


