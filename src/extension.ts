import { ExtensionContext, workspace } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from "vscode-languageclient/node";
import { Config } from "./config";
import path = require("path");

let client: LanguageClient | null = null;

export function activate(context: ExtensionContext) {
  const config = new Config(
    workspace.getConfiguration("diagnostic-languageserver")
  );
  console.log(config);

  const serverModule = context.asAbsolutePath(path.join("out", "server.js"));

  const traceArgs =
    config.traceServer === "verbose" ? ["--log-level", "4"] : [];
  const debugArgs = config.enableDebugging ? ["--nolazy", "--debug=6009"] : [];
  const args = [...traceArgs, ...debugArgs];

  const serverOptions: ServerOptions = {
    run: {
      module: serverModule,
      transport: TransportKind.ipc,
      args
    },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      args
    }
  };

  const documentSelector = Object.keys({
    ...config.lintFiletypes,
    ...config.formatFiletypes
  });
  const clientOptions: LanguageClientOptions = {
    documentSelector,

    initializationOptions: {
      linters: config.linters,
      filetypes: config.lintFiletypes,
      formatters: config.formatters,
      formatFiletypes: config.formatFiletypes
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "diagnostic-languageserver",
    "Diagnostic Language Server",
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate() {
  client?.stop();
  client = null;
}
