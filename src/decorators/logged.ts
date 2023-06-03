import { Logger } from "../components/logger.js";

export function logged(label: string, session: string) {
    return function<T extends { new(...args: any[]): {} }>(constructor: T) {

        const new_class = class extends constructor {
            readonly logger: Logger = new Logger(label, session);
        }

        return new_class
    }
}
  