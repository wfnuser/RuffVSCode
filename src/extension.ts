'use strict';

import * as vscode from 'vscode';
import * as path from 'path';


export function activate(context: vscode.ExtensionContext) {
	let terminalStack: vscode.Terminal[] = [];
	let config = vscode.workspace.getConfiguration('ruff');
	let that = this;
	this.settings = {
      rootDirectory: config.get('rootDirectory'),
	  defaultProjectName: config.get('defaultProjectName')
    };

	context.subscriptions.push(vscode.commands.registerCommand('ruff.rapInit', () => {

		let projectPath = vscode.workspace.rootPath || path.dirname(vscode.window.activeTextEditor.document.fileName) || that.settings.rootDirectory;
		let question = `What's the path of the project?`;

		vscode.window.showInputBox({
			prompt: question,
			value: projectPath
		}).then(selectedFilePath => {

			if (selectedFilePath === null || typeof selectedFilePath === 'undefined') {
				return;
			}
			
			if (selectedFilePath) {
				terminalStack.push(vscode.window.createTerminal(`Ext Terminal #${terminalStack.length + 1}`));
				let question = `What's the name of the project?`;
				let thePath = selectedFilePath; 
				vscode.window.showInputBox({
					prompt: question,
					value: that.settings.defaultProjectName
				}).then(projectName => {
					getLatestTerminal().show();
					getLatestTerminal().sendText(`mkdir ${thePath}`, true);
					getLatestTerminal().sendText(`cd ${thePath}`, true);
					getLatestTerminal().sendText(`rap init`, true);
					getLatestTerminal().sendText(`${projectName}`, true);
					getLatestTerminal().sendText(``, true);
					getLatestTerminal().sendText(``, true);
					getLatestTerminal().sendText(``, true);
					getLatestTerminal().sendText(``, true);
					getLatestTerminal().sendText(``, true);
					getLatestTerminal().sendText(``, true);
					console.log(thePath+'/'+projectName);
					let uri = vscode.Uri.parse(thePath+'/'+projectName);
					let success = vscode.commands.executeCommand('vscode.openFolder', uri);
				})	
			}

		});

	}));

	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createTerminal', () => {
		terminalStack.push(vscode.window.createTerminal(`Ext Terminal #${terminalStack.length + 1}`));
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.hide', () => {
		if (terminalStack.length === 0) {
			vscode.window.showErrorMessage('No active terminals');
		}
		getLatestTerminal().hide();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.show', () => {
		if (terminalStack.length === 0) {
			vscode.window.showErrorMessage('No active terminals');
		}
		getLatestTerminal().show();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.showPreserveFocus', () => {
		if (terminalStack.length === 0) {
			vscode.window.showErrorMessage('No active terminals');
		}
		getLatestTerminal().show(true);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.sendText', () => {
		if (terminalStack.length === 0) {
			vscode.window.showErrorMessage('No active terminals');
		}
		getLatestTerminal().sendText("echo 'Hello world!'");
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.sendTextNoNewLine', () => {
		if (terminalStack.length === 0) {
			vscode.window.showErrorMessage('No active terminals');
		}
		getLatestTerminal().sendText("echo 'Hello world!'", false);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.dispose', () => {
		if (terminalStack.length === 0) {
			vscode.window.showErrorMessage('No active terminals');
		}
		getLatestTerminal().dispose();
		terminalStack.pop();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createAndSend', () => {
		let folderPath = vscode.workspace.rootPath;

		terminalStack.push((<any>vscode.window).createTerminal(`Ext Terminal #${terminalStack.length + 1}`));
		getLatestTerminal().sendText("echo 'Sent text immediately after creating'");
		getLatestTerminal().show();
		console.log(vscode.workspace.rootPath);
	}));

	// Below coming Ruff APIs
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.rapDeploy', () => {
		let folderPath = vscode.workspace.rootPath;

		terminalStack.push((<any>vscode.window).createTerminal(`Ext Terminal #${terminalStack.length + 1}`));
		getLatestTerminal().sendText("rap deploy -s 192.168.31.199");
		console.log(vscode.workspace.rootPath);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.rapLog', () => {
		let folderPath = vscode.workspace.rootPath;

		terminalStack.push((<any>vscode.window).createTerminal(`Ext Terminal #${terminalStack.length + 1}`));
		getLatestTerminal().sendText("rap log 192.168.31.199");
		getLatestTerminal().show();
		console.log(vscode.workspace.rootPath);
	}));

	// Below coming in version v1.6
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.createZshLoginShell', () => {
		terminalStack.push((<any>vscode.window).createTerminal(`Ext Terminal #${terminalStack.length + 1}`, '/bin/zsh', ['-l']));
	}));
	context.subscriptions.push(vscode.commands.registerCommand('terminalTest.processId', () => {
		(<any>getLatestTerminal()).processId.then((processId) => {
			console.log(`Shell process ID: ${processId}`);
		});
	}));
	if ('onDidCloseTerminal' in <any>vscode.window) {
		(<any>vscode.window).onDidCloseTerminal((terminal) => {
			console.log('Terminal closed', terminal);
		});
	}

	function getLatestTerminal() {
		return terminalStack[terminalStack.length - 1];
	}
}
