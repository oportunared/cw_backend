import e, * as express from "express";
import IController from "../interface/controller.interface";
import TareaService from "../repositorys/tarea.service";
import log from "../common/logger";
import { request } from "http";
import authMiddleware from "../middleware/auth.middleware";
import ServicesService from "../repositorys/services.service";

class ServicesController implements IController {
  public path = "/services";
  public router = express.Router();
  public service: ServicesService;

  constructor() {
    this.initialzeRoutes();
    this.service = new ServicesService();
  }

  public initialzeRoutes() {
    this.router.post(`${this.path}/createService`, this.createService);
    this.router.post(`${this.path}/getServices`, this.getServices);
    this.router.post(`${this.path}/createGroupService`, this.createGroupService);
    this.router.post(`${this.path}/getGroupServices`, this.getGroupService);
    this.router.post(`${this.path}/updateService`, this.updateService);



  }

  ////////////////////////////////////////////////////////////////////////////////
  createService = async (
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
          .json({ message: "Faltan datos para crear servicio" });
      }

      console.log('va a entrar a crear servicio');

      const service = await this.service.createService(
        data.memberId,
        data.groupId,
        data.PaymentMethod,
        data.totalValue,
        data.takerId,
        data.insurance,
      );
      console.log('Sale de crear servicio');

      return response.json({ message: "Servicio creado con éxito", service });
    } catch (error) {
      return response.status(500).json({ error: "Error al crear la servicio" });
      log.error(error);
    }
  };


  updateService = async (
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
          .json({ message: "Faltan datos para actualizar servicio" });
      }

      console.log('va a entrar a crear servicio');

      const service = await this.service.updateServiceById(data);
      console.log('Sale de actualizado de servicio');

      return response.json({ message: "Servicio actualizado con éxito", service });
    } catch (error) {
      return response.status(500).json({ error: "Error al actualizar la servicio" });
      log.error(error);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////
  getServices = async (request: express.Request, response: express.Response) => {

    try {
      const services = await this.service.getServicesByGroup(request.body.groupId);
      return response.status(200).json(services);
    } catch (error) {
      response.status(500).json({ message: "Error al consultar servicios" });
      log.error(error);
    }
  };



  createGroupService = async (
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
          .json({ message: "Faltan datos para crear tarea" });
      }

      console.log('va a entrar a crear servicio');

      const service = await this.service.createGroupService(
        data.clauseList,
        data.groupId,
        data.PaymentMethodList,
        data.insurance,
      );
      console.log('Sale de crear servicio');

      return response.json({ message: "Servicio de grupo creado con éxito", service });
    } catch (error) {
      console.log(error);
      return response.status(500).json({ error: "Error al crear la servicio", "message": error });

    }
  };


   ///////////////////////////////////////////////////////////////////////////////
   getGroupService = async (request: express.Request, response: express.Response) => {

    try {
      const services = await this.service.getGroupService(request.body.groupId);
      return response.status(200).json(services);
    } catch (error) {
      response.status(500).json({ message: "Error al consultar servicios" });
      log.error(error);
    }
  };


}

export default ServicesController;
