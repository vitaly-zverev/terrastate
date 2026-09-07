import * as vscode from "vscode";
import { graph, outputChannel, setTerraformPath } from "./terraform";
import { TerrastateProvider } from "./terrastateProvider";
import { GraphProvider } from "./graphProvider";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  if (!(await setTerraformPath())) {
    return;
  }

  const terrastateProvider = new TerrastateProvider();
  await terrastateProvider.initialize();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      "terrastate.terrastate",
      terrastateProvider
    )
  );

  const graphProvider = new GraphProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("terrastate.graph", graphProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.refresh",
      terrastateProvider.refresh.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.init",
      terrastateProvider.init.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.validate",
      terrastateProvider.validate.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.apply",
      terrastateProvider.apply.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.applyAll",
      terrastateProvider.apply.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.destroy",
      terrastateProvider.destroy.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.destroyAll",
      terrastateProvider.destroy.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.taint",
      terrastateProvider.taint.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.untaint",
      terrastateProvider.untaint.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.sync",
      terrastateProvider.sync.bind(terrastateProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("terrastate.showOutput", () => {
      outputChannel.show();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "terrastate.graph",
      async (arg?: string) => {
        if (arg === undefined) {
          arg = (await terrastateProvider.pickTopLevelModule())?.directory;
        }

        if (arg === undefined) {
          return;
        }

        const panel = vscode.window.createWebviewPanel(
          "Graph",
          "Terrastate – Graph",
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.joinPath(context.extensionUri, "media", "vendor"),
            ],
          }
        );

        panel.iconPath = vscode.Uri.joinPath(
          context.extensionUri,
          "media/terrastate.png"
        );

        const d3Uri = panel.webview.asWebviewUri(
          vscode.Uri.joinPath(context.extensionUri, "media/vendor/d3.min.js")
        );
        const hpccUri = panel.webview.asWebviewUri(
          vscode.Uri.joinPath(
            context.extensionUri,
            "media/vendor/graphviz.umd.js"
          )
        );
        const d3GraphvizUri = panel.webview.asWebviewUri(
          vscode.Uri.joinPath(
            context.extensionUri,
            "media/vendor/d3-graphviz.min.js"
          )
        );

        panel.webview.html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
        </head>
        <body>
          <div id="main"></div>
          <script src="${d3Uri}"></script>
          <script src="${hpccUri}"></script>
          <script src="${d3GraphvizUri}"></script>
          <script>
            const dot = ${JSON.stringify(await graph(arg))}
            d3.select("#main").graphviz().renderDot(dot)
          </script>
        </body>
      </html>
    `;
      }
    )
  );
}
