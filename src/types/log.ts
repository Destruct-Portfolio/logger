export type Loggable<T extends any> = T & {
  __loggables?: Array<LoggableT>;
  __log_info?: LogInfoT;
};

export type LoggableT = {
  property: string;
  level: LogLevelE;
  template: LogTemplateT;
  mask: Array<string>;
};

export enum LogLevelE {
  Debug = "DEBUG",
  Info = "INFO",
  Warn = "WARN",
  Error = "ERROR",
  Critical = "CRITICAL",
}

export type LogPlaceholdersT = "<name>" | "<value>" | "<error>" | "<message>";
export type LogTemplateT =
  `${string}${LogPlaceholdersT}${string}${LogPlaceholdersT}${string}`;

export type LogInfoT = {
  filename: LogFilenameT;
  descriptor: LogDescriptorT;
  levels: Array<LogLevelE>;
};

export type LogFilenameT = string;
export type LogDescriptorT = string;
