import Winston from "winston";

/**
 * Logging utility to use for both console and output to files.
 */
export class Logger {
  /**
   * Contains the Winston instance.
   */
  _logger: Winston.Logger | null = null;

  /**
   * A label indicative of where the log originated from.
   */
  _label: string;

  /**
   * Name of the .log file to output to.
   */
  _session: string;

  /**
   * @constructor
   */
  constructor(_label: string, _session: string = `${_label}-${Date.now()}`) {
    this._label = _label;
    this._session = _session;

    this._logger = null;
    this._actualize();
  }

  /**
   * Make sure that the logger outputs the latest set label.
   */
  private _actualize() {
    this._logger = Winston.createLogger({
      format: Winston.format.combine(
        Winston.format.label({ label: `${this._label}` }),
        Winston.format.json(),
        Winston.format.timestamp(),
        Winston.format.printf(({ level, message, label, timestamp }) => {
          return `<${new Date(
            timestamp
          ).toLocaleString()}> [${label}] ${level.toUpperCase()} : ${message}`;
        })
      ),
      transports: [
        new Winston.transports.Console({}),
        new Winston.transports.File(
          (Winston.transports.FileTransportOptions = {
            filename: `logs/${this._session}.log`,
          })
        ),
      ],
    });
  }

  /**
   * Prototype the logger.
   */
  public prototype(): Logger {
    return new Logger(this._label, this._session);
  }

  /**
   * Extends the label
   */
  public set label(_label: string) {
    this._label = `${this._label} > ${_label}`;
    this._actualize();
  }

  public get label() {
    return this._label;
  }

  public get session() {
    return this._session;
  }

  /**
   * Informative log.
   * @param message content of the log
   */
  public info(message: string) {
    this._logger!.log("info", message);
  }

  /**
   * Debugging log.
   * @param message content of the log
   */
  public debug(message: string) {
    this._logger!.log("debug", message);
  }

  /**
   * Error log.
   * @param message content of the log
   */
  public error(message: string) {
    this._logger!.log("error", message);
  }

  /**
   * Warning log.
   * @param message content of the log
   */
  public warn(message: string) {
    this._logger!.log("warn", message);
  }

  public critical(message: string) {
    this._logger!.log("critical", message);
  }
}
