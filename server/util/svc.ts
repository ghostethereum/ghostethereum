export class GenericService {
    name: string;
    main?: MainService;

    constructor() {
        this.name = '';
    }

    async call(name: string, methodName: string, ...args: any[]) {
        if (this.main) {
           const service = this.main.services[name];
           // @ts-ignore
            const method = service[methodName];
            if (typeof method === 'function') {
                return method.apply(service, args);
            } else {
                return Promise.reject(new Error(`${name}.${methodName} is not a function`));
            }
        }
        return Promise.reject(new Error('Main service not found'));
    }

    async start() {

    }

    async stop() {

    }
}

export class MainService extends GenericService {
    services: {
        [name: string]: GenericService;
    };

    constructor() {
        super();
        this.services = {};
    }

    add(name: string, service: GenericService): MainService {
        service.name = name;
        this.services[name] = service;
        service.main = this;
        return this;
    }

    async start() {
        for (const name in this.services) {
            await this.services[name].start();
        }
    }
}