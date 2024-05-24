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
    this.router.get(`${this.path}/getLines`,this.getLines);
    this.router.post(`${this.path}/createServiceClausules`,this.createServiceClausules);
    this.router.post(`${this.path}/getServiceClausules`,this.getClausulesByServiceId);
    this.router.post(`${this.path}/updateClausule`,this.updateClausule);



  }

  getLines = async (
    req: express.Request,
    res: express.Response
  ) => {
   return res.status(200).send( await this.linesService.getLines()) 
  };

  createServiceClausules = async (
    req: express.Request,
    res: express.Response
  ) => {
    try {
      console.log(req.body)
      const data = req.body;
    const serviceId = data.serviceId;
    const clausules : any[] = data.clausules;
    console.log(serviceId)
    console.log(clausules)

    clausules.forEach(async (element)  => {
      await this.linesService.createServiceclausules(serviceId, element)
    }) 
     return res.status(200).send( {"success": true, "message": "Clausulas creadas con exito"}) 
    } catch (error) {
      return res.status(500).send( {"success": false, "message": "Error al conectar con base de datos"}) 

    }
  };
  getClausulesByServiceId = async (
    req: express.Request,
    res: express.Response
  ) => {
   return res.status(200).send( await this.linesService.getClausulesByServiceId(req.body.serviceId)) 
  };


  updateClausule = async (
    request: express.Request,
    response: express.Response
  ) => {
    const data = request.body;
    console.log('data es');
    console.log(data);
    try {
      if (!data) {
        return response
          .status(400)
          .json({ message: "Faltan datos para actualizar la clausula" });
      }

      const service = await this.linesService.updateClausule(data.id);
      console.log('Sale de actualizado de clausula');

      return response.json({ message: "Clausula actualizada con éxito", service });
    } catch (error) {
      return response.status(500).json({ error: "Error al actualizar la clausula" });
    }
  };

}

export default LineasController;
