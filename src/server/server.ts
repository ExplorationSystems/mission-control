import { ServerConnection } from "./server-connection";
import { ApplicationDependencies, createContainer } from "src/container";
import { ServerApplication } from "./server-application";
import { asClass, AwilixContainer } from "awilix";
import { ModuleDependencies } from "src/module-loader";

export type ServerApplicationDependencies = {} & ApplicationDependencies;
export type ServerModuleDependencies = ModuleDependencies &
    ServerApplicationDependencies;

const container = createContainer();
// Bind environemnt specific injections
(container as AwilixContainer<ServerApplicationDependencies>).register({
    application: asClass(ServerApplication).singleton(),
    connection: asClass(ServerConnection).singleton(),
});

// start the application
const application = container.resolve('application');
application.init(container);

