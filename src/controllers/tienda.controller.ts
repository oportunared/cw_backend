import e, * as express from "express";
import IController from "../interface/controller.interface";
import log from "../common/logger";
import TiendaService from "../repositorys/tienda.service";

const BASE_URL_TIENDA = "https://oportuna.red/wms/tienda/";
const BASE_URL_TIENDA_SERVER = "/var/www/html/Wms_Oportuna/tienda/";
const BASE_URL_RED = "https://oportuna.red/Wms_Oportuna/red/";
const BASE_URL_RED_SERVER = "/var/www/html/Wms_Oportuna/red/";
const BASE_URL = "https://oportuna.red/wms/";

class TiendaController implements IController {
  public path = "/api";
  public router = express.Router();
  public tiendaService: TiendaService;

  constructor() {
    this.initRoutes();
    this.tiendaService = new TiendaService();
  }

  public initRoutes() {
    this.router.get(`${this.path}/get_tienda`, this.get_tienda);
  }

  get_tienda = async (
    request: express.Request,
    response: express.Response
  ): Promise<any> => {
    const memberId = request.query.memberId as string;
    //console.log(memberId);

    try {
      if (!memberId) {
        return response
          .status(400)
          .send({ message: "No se proporciono el id del miembro" });
      }

      const tienda = await this.tiendaService.findByID(parseInt(memberId));
      const respuesta = {
        tienda,
        urlTienda: `${BASE_URL}red/${tienda?.url_code}`,
        urlAdmin: `${BASE_URL_TIENDA}admin`,
        categorias: await this.tiendaService.findCategoriasTienda(
          tienda?.estado
        ),
      };
      response.json(respuesta);
    } catch (error) {
      console.log("Error al obtener la tienda", error);
      log.error("Error al obtener la tienda", error);
    }
  };

  crea_tienda = async (
    request: express.Request,
    response: express.Response
  ) => {
    const {
      nombreWeb,
      email,
      telefono,
      telefono2,
      direccion,
      lat,
      lng,
      pais,
      departamento,
      ciudad,
      idEmpresa,
      fecha,
      Categoria,
      memberIdApp,
    } = request.body;

    const tabla = nombreWeb.replace(/[^A-Za-z0-9]/g, "").toLowerCase();

    try {
      const jsonResponse = {
        success: "Tienda creada correctamente!",
        id_cliente: "your_id",
        url_cliente: "your_url",
      };
      response.json(jsonResponse);
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: "Internal Server Error" });
    }
  };
}

export default TiendaController;
