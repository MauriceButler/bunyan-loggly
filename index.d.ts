import * as logger from 'bunyan';

export = BunyanLoggly;

interface BunyanLoggly extends logger.WriteFn {}
declare class BunyanLoggly {
    constructor(
        options: BunyanLoggly.IOptions,
        bufferLength?: number,
        bufferTimeout?: number,
        logglyCallback?: Function,
    );
}

declare namespace BunyanLoggly {
    interface IOptions {
        token: string;
        subdomain: string;
        tags?: string[];
        json?: boolean;
        isBulk?: boolean;
        host?: string;
        auth?: {
            username: string;
            password: string;
        };
    }
}
