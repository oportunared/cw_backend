import e, * as express from "express";
import IController from "../interface/controller.interface";
import fs from "fs";
import EmpresaService from "../repositorys/empresa.service";
import CategoryService from "../repositorys/category.service";
import LinesService from "../repositorys/lineas.service";

const BASE_URL_TIENDA = "https://oportuna.red/Wms_Oportuna/tienda/";
const BASE_URL_TIENDA_SERVER = "/var/www/html/Wms_Oportuna/tienda/";

class LineasController implements IController {
  public path = "/lines";
  public router = express.Router();
  public linesService: LinesService;

  constructor() {
    this.initialzeRoutes();
    this.linesService = new LinesService();
  }

  public initialzeRoutes() {
    this.router.get(
      `${this.path}/getLines`,
      this.getLines
    );
  }

  getLines = async (
    req: express.Request,
    res: express.Response
  ) => {
   return res.status(200).send( await this.linesService.getLines()) 

   
  };
}

export default LineasController;
