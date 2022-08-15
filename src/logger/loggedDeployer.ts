import { Logger } from "tslog";

export abstract class LoggedDeployer {
  protected readonly _logger: Logger;

  protected constructor() {
    this._logger = new Logger({
      minLevel: "error",
      displayFunctionName: false,
      displayLoggerName: false,
      displayFilePath: "hidden"
    });
  }

  public enableLogs() {
    this._logger.setSettings({ minLevel: "debug" });
  }

  public disableLogs() {
    this._logger.setSettings({ minLevel: "error" });
  }
}
