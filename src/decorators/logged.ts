import { Logger } from "../components/logger.js";
import { Logging } from "../types/log.js";

/**
 * A class decorator for a loosely coupled logger.
 * @param filename Log filename.
 * @param levels Allowed log levels.
 * @returns Decorated class.
 */
export function logger(
  filename: Logging.LogFilenameT,
  levels: Array<Logging.LogLevelE> = [
    Logging.LogLevelE.Info,
    Logging.LogLevelE.Warn,
    Logging.LogLevelE.Error,
  ]
) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    return class extends constructor {
      __log_info: Logging.LogInfoT;
      constructor(...args: any[]) {
        super(...args);
        this.__log_info = {
          descriptor: constructor.name,
          filename: filename,
          levels: levels,
        };
      }
    };
  };
}

/**
 * A method decorator which logs a set of properties after execution.
 * @param masks A list of property masks to log.
 * @param entry_message Message to show before execution.
 * @param exit_message Message to show after execution.
 * @returns A decorated method
 */
export function log(
  masks?: Array<string>,
  entry_message: string | null = null,
  exit_message: string | null = null
) {
  return function (
    target: Logging.Loggable<object>,
    property: string,
    descriptor: PropertyDescriptor
  ) {
    if (!masks) {
      masks = ["default"];
    }
    const wrapped: Function = descriptor.value;

    descriptor.value = function () {
      const logger = new Logger(
        `${
          (this as Logging.Loggable<object>).__log_info?.descriptor
        }.${property}`,
        `${(this as Logging.Loggable<object>).__log_info?.filename}`
      );

      if (entry_message) {
        logger.info(entry_message);
      }

      wrapped.apply(this, arguments);
      if (target.__loggables) {
        for (const loggable of target.__loggables) {
          for (const mask of masks!) {
            if (!loggable.mask.includes(mask)) continue;
            switch (loggable.level) {
              case Logging.LogLevelE.Critical: {
                logger.critical(
                  loggable.template
                    .replace("<name>", loggable.property)
                    .replace(
                      "<value>",
                      Object.getOwnPropertyDescriptor(this, loggable.property)
                        ?.value
                    )
                );
                break;
              }
              case Logging.LogLevelE.Error: {
                logger.error(
                  loggable.template
                    .replace("<name>", loggable.property)
                    .replace(
                      "<value>",
                      Object.getOwnPropertyDescriptor(this, loggable.property)
                        ?.value
                    )
                );
                break;
              }
              case Logging.LogLevelE.Warn: {
                logger.warn(
                  loggable.template
                    .replace("<name>", loggable.property)
                    .replace(
                      "<value>",
                      Object.getOwnPropertyDescriptor(this, loggable.property)
                        ?.value
                    )
                );
                break;
              }
              case Logging.LogLevelE.Info: {
                logger.info(
                  loggable.template
                    .replace("<name>", loggable.property)
                    .replace(
                      "<value>",
                      Object.getOwnPropertyDescriptor(this, loggable.property)
                        ?.value
                    )
                );
                break;
              }
              case Logging.LogLevelE.Debug: {
                logger.warn(
                  `${loggable.property}: ${
                    Object.getOwnPropertyDescriptor(this, loggable.property)
                      ?.value
                  }`
                );
                break;
              }
            }
          }
        }
      }

      if (exit_message) {
        logger.info(exit_message);
      }
    };
  };
}

/**
 * A property decorator to mark a property for logging.
 * @param log_level Log level at which this property is to be logged.
 * @param log_mask A list of masks to which this property belongs to.
 * @param log_template A string template for the message to format this property in. <name> and <value> are placeholders for the property name and value.
 * @returns A decorated property.
 */
export function logged(
  log_level: Logging.LogLevelE = Logging.LogLevelE.Info,
  log_mask: Array<string> = ["default"],
  log_template: Logging.LogTemplateT
) {
  return function (
    target: Logging.Loggable<object>,
    property: string | symbol
  ) {
    if (!log_template) {
      if (
        log_level === Logging.LogLevelE.Info ||
        log_level === Logging.LogLevelE.Debug
      ) {
        log_template = "<name> : <value>";
      } else {
        log_template = "<error> : <message>";
      }
    }
    const loggable: Logging.LoggableT = {
      property: property.toString(),
      level: log_level,
      template: log_template,
      mask: log_mask,
    };

    if (target.__loggables) {
      target.__loggables.push(loggable);
    } else {
      target.__loggables = [loggable];
    }
  };
}
