import express, { Router } from "express";
import routes from "./routes/index.ts";

interface serverOptions {
    port: number;
    routes?: Router;
}

export class Server {
    private readonly port: number;
    private readonly server = express();

    constructor(options: serverOptions) {
        this.port = options.port;
        this.server.use(express.json());
        this.server.use('/api', routes);
    }

    start() {
        this.server.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`);
        });
    }
}