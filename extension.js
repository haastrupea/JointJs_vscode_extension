// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "joint-js" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('joint-js.helloWorld', function () {
        vscode.window.showInformationMessage('Hello World from Joint Js vsCode!');
    });

    let previewDisposable = vscode.commands.registerCommand('joint-js.showPreview', function () {
        const panel = vscode.window.createWebviewPanel(
            'jointJsPreview',
            'JointJS Preview',
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );

        const updatePreview = (document) => {
            try {
                const json = JSON.parse(document.getText());
                panel.webview.postMessage({ type: 'update', json });
            } catch (e) {
                // ignore JSON parse errors
            }
        };

        panel.webview.html = getWebviewContent();

        const active = vscode.window.activeTextEditor?.document;
        if (active) {
            updatePreview(active);
        }

        const changeSubscription = vscode.workspace.onDidChangeTextDocument(event => {
            if (panel.visible && active && event.document === active) {
                updatePreview(event.document);
            }
        });

        panel.onDidDispose(() => {
            changeSubscription.dispose();
        });
    });

    context.subscriptions.push(disposable, previewDisposable);
}

function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>JointJS Preview</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.4.1/backbone-min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.7.2/joint.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jointjs/3.7.2/joint.min.css" />
    <style>body{padding:0;margin:0;}#paper{width:100%;height:100vh;}</style>
</head>
<body>
    <div id="paper"></div>
    <script>
        const graph = new joint.dia.Graph();
        const paper = new joint.dia.Paper({
            el: document.getElementById('paper'),
            model: graph,
            width: document.body.clientWidth,
            height: document.body.clientHeight,
            gridSize: 10
        });

        window.addEventListener('message', event => {
            const { type, json } = event.data;
            if (type === 'update' && json) {
                graph.clear();
                graph.fromJSON(json);
            }
        });

    </script>
</body>
</html>`;
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
