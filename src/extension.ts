'use strict';

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let terminalStack: vscode.Terminal[] = [];

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
