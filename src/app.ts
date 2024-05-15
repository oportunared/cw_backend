import express from "express";
import log from "./common/logger";

import cookieParser from "cookie-parser";
import "reflect-metadata";

import errorMiddleware from "./middleware/error.middleware";
import IController from "./interface/controller.interface";

import swaggerUI from "swagger-ui-express";
import * as swaggerDocument from "../swagger.json";
import cors from "cors";
import fileUpload from "express-fileupload";

class App {
  public app: express.Application;
  public port: number;
  public host: string;

  constructor(controllers: Array<IController>, host: string, port: number) {
    this.app = express();
    this.port = port;
    this.host = host;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(
      cors({
        origin: [
          "http://marketplace-reactjs.s3-website-us-east-1.amazonaws.com",
          "http://reactjs-despliegue.s3-website-us-east-1.amazonaws.com",
          "http://localhost:3000",
          "http://127.0.0.1:5173",
          "http://localhost:5173",
          "https://citica.net",
          "https://citica.net/coopielectricos/",
          "*",
        ],
        credentials: true,
      })
    );
    this.app.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "./tmp",
      })
    );
    this.app.use(express.static("src/files"));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeControllers(controllers: Array<IController>) {
    controllers.forEach((controller) => {
      if (controller.router) {
        this.app.use("/", controller.router);
      }
    });
  }

  private initializeSwagger() {
    this.app.use(
      "/api-docs",
      swaggerUI.serve,
      swaggerUI.setup(swaggerDocument)
    );
  }

  public listen() {
    this.app.listen(this.port, this.host, () => {
      log.info(`Server listening at http://${this.host}:${this.port}`);
    });
  }
}

export default App;
