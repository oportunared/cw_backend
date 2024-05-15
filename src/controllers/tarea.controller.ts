import e, * as express from "express";
import IController from "../interface/controller.interface";
import TareaService from "../repositorys/tarea.service";
import log from "../common/logger";
import { request } from "http";
import authMiddleware from "../middleware/auth.middleware";

class TareaController implements IController {
  public path = "/tarea";
  public router = express.Router();
  public tareaService: TareaService;

  constructor() {
    this.initialzeRoutes();
    this.tareaService = new TareaService();
  }

  public initialzeRoutes() {
    this.router.post(`${this.path}/create_tarea`, this.create_tarea);
    this.router.post(`${this.path}/get_tareas`, this.get_tareas);
    this.router.get(`${this.path}/get_tarea/:id`, this.get_tarea);
    this.router.put(`${this.path}/actualizar_tarea`, this.actualizar_tarea);
    this.router.delete(`${this.path}/delete_tarea`, this.delete_tarea);
    this.router.post(`${this.path}/tarea_registro`, this.tarea_registro);
    this.router.post(`${this.path}/set_registro`, this.set_registro);
    this.router.post(`${this.path}/tareas_admin`, this.tareasAdmin);
  }

  ////////////////////////////////////////////////////////////////////////////////
  create_tarea = async (
    request: express.Request,
    response: express.Response
  ) => {
    const data = request.body;
    try {
      if (!data) {
        return response
          .status(400)
          .json({ message: "Faltan datos para crear tarea" });
      }

      const existingTarea = await this.tareaService.getTareaByTitle(data.title);

      if (existingTarea) {
        return response
          .status(400)
          .json({ message: "Ya existe una tarea con el mismo título" });
      }

      const tarea = await this.tareaService.createTarea(
        data.id_grupo,
        data.title,
        data.body,
        data.start,
        data.tarea_estado_id,
        data.lat,
        data.lng,
        data.vendedor,
        data.cliente,
        data.archivo
      );

      return response.json({ message: "Tarea creada con éxito", tarea });
    } catch (error) {
      response.status(500).json({ error: "Error al crear la tarea" });
      log.error(error);
    }
  };

  ///////////////////////////////////////////////////////////////////////////////
  get_tareas = async (request: express.Request, response: express.Response) => {
    const cliente = request.body.cliente;

    try {
      if (!cliente) {
        return response.status(400).json({ message: "Falta cliente" });
      }

      const tareas = await this.tareaService.getTareasByCliente(cliente);

      return response.status(200).json(tareas);
    } catch (error) {
      response.status(500).json({ message: "Error al consultar tareas" });
      log.error(error);
    }
  };

  get_tarea = async (request: express.Request, response: express.Response) => {
    const id = request.params.id;
    try {
      if (!id) {
        return response.status(400).json({ message: "Falta parametro id" });
      }

      const tarea = await this.tareaService.getTareaById(id);
      if (!tarea) {
        return response
          .status(404)
          .json({ message: "No existe tarea con ese id" });
      }
      return response.status(200).json(tarea);
    } catch (error) {
      response.status(500).json({ message: "Error al consultar tarea" });
    }
  };

  ////////////////////////////////////////////////////////////////////////////////
  actualizar_tarea = async (
    request: express.Request,
    response: express.Response
  ) => {
    const data = request.body;
    try {
      if (!data) {
        return response
          .status(400)
          .json({ message: "Faltan datos para actualizar la tarea" });
      }

      const tareaActualizada = await this.tareaService.updateTareaById(
        data.id,
        data.title,
        data.body,
        data.tarea_estado_id,
        data.archivo
      );

      return response
        .status(200)
        .json({ message: "Se actulizo la tarea con exito", tareaActualizada });
    } catch (error) {
      response.status(500).json({ message: "Error al actualizar tarea" });
      log.error(error);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////
  delete_tarea = async (
    request: express.Request,
    response: express.Response
  ) => {
    const data = request.body;

    try {
      if (!data.id) {
        return response.status(400).json({
          message: "Falta o id incorrecto",
        });
      }
      const tareaBorrada = await this.tareaService.deleteTareaById(data.id);

      return response.sendStatus(204);
    } catch (error) {
      response.status(500).json({ message: "Error al borrar tarea" });
      log.error(error);
    }
  };

  tarea_registro = async (
    request: express.Request,
    response: express.Response
  ) => {
    const idTarea = request.body.id;
    try {
      if (!idTarea) {
        return response.json("Falta parametro id");
      }

      const registros = await this.tareaService.getRegistros(idTarea);
      if (!registros) {
        return response.status(404).json({ message: "ID de tarea incorrecto" });
      }
      return response.status(200).json(registros);
    } catch (error) {
      response.status(500).json(error);
    }
  };

  set_registro = async (
    request: express.Request,
    response: express.Response
  ) => {
    const data = request.body;
    //console.log(data);

    try {
      if (!data) {
        return response
          .status(400)
          .json({ message: "Faltan datos para registro de tarea" });
      }
      let result = await this.tareaService.setRegistro(
        data.cliente,
        data.vendedor,
        data.id,
        data.lat,
        data.lng,
        data.start,
        data.tarea_estado_id,
        data.tipo
      );
      if (!result) {
        return response.status(500).send("No se pudo crear registro");
      }
      return response.status(201).json(result);
    } catch (error) {
      console.log(error);
      response.status(500).send(error);
    }
  };

  tareasAdmin = async (
    request: express.Request,
    response: express.Response
  ) => {
    try {
      const { idgrupo } = request.body;

      if (!idgrupo) {
        return response
          .status(400)
          .json({ message: "Falta identificador de grupo" });
      }

      const tareas = await this.tareaService.getTareasAdmin(idgrupo);

      return response.status(200).json(tareas);
    } catch (error) {
      response.status(500).json({ message: "Error al consultar tareas" });
      log.error(error);
    }
  };
}

export default TareaController;
