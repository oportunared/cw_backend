import e, * as express from "express";
import UserDTO from "../models/dto/user.dto";
import UserService from "../repositorys/user.service";
import IController from "../interface/controller.interface";
import validationMiddleware from "../middleware/validation.middleware";
import log from "../common/logger";
import { isDate24HoursOrOlder, omit } from "../common/helper";
import dayjs from "dayjs";
import UserAlreadyExistException from "../exception/userAlreadyExist.exception";
import ModifyUserDTO, { AllowedActions } from "../models/dto/modifyUser.dto";
import UserNotFoundException from "../exception/notFound.exception";
import ActivationPendingException from "../exception/activationPending.exception";
import AccountAlreadyActiveException from "../exception/accountAlreadyActive.exception";
import RequestExpiredException from "../exception/requestExpired.exception";
import InvalidResetRequestException from "../exception/invalidResetRequest.exception";
import InvalidActivationRequestException from "../exception/invalidActivationRequest.exception";
import HttpException from "../exception/http.exception";
import InvalidModificationException from "../exception/invalidModification.exception";
import authMiddleware from "../middleware/auth.middleware";
import fs from "fs";
import EmpresaService from "../repositorys/empresa.service";

const BASE_URL_TIENDA = "https://oportuna.red/Wms_Oportuna/tienda/";
const BASE_URL_TIENDA_SERVER = "/var/www/html/Wms_Oportuna/tienda/";
const BASE_URL_RED = "https://oportuna.red/Wms_Oportuna/red/";
const BASE_URL_RED_SERVER = "/var/www/html/Wms_Oportuna/red/";
const BASE_URL = "https://oportuna.red/";

class EmpresaController implements IController {
  public path = "/get_empresa";
  public router = express.Router();
  public empresaService: EmpresaService;

  constructor() {
    this.initialzeRoutes();
    this.empresaService = new EmpresaService();
  }

  public initialzeRoutes() {
    this.router.post(`${this.path}`, this.get_empresa);
  }

  get_empresa = async (
    request: express.Request,
    response: express.Response
  ) => {
    const idEmpresa = request.body.id_empresa;
    //console.log(request.body);

    try {
      if (!idEmpresa) {
        return response.status(400).json({
          message:
            "Falta el parámetro id_empresa o ingresaste un parametro incorrecto",
        });
      }

      const empresa = await this.empresaService.findById(idEmpresa);

      if (!empresa) {
        return response.status(404).json({ message: "Empresa no encontrada" });
      }

      if (empresa.tienda_principal !== null && empresa.tienda_principal > 0) {
        const data = await this.empresaService.findTiendaPrincipal(idEmpresa);

        if (!data) {
          return response.status(404).json({
            message: "No se encontro tienda principal",
          });
        }
        const datosTienda_principal = await this.empresaService.findDataTienda(
          data.tienda_principal
        );

        if (!datosTienda_principal) {
          return response
            .status(404)
            .send("No hay ningun dato de tienda principal");
        }

        const dataEmpresa: any = {
          id_tienda: datosTienda_principal?.id_clientes,
          id_empresa: datosTienda_principal?.id_empresa,
          nombreweb: datosTienda_principal?.nombreweb,
          email: datosTienda_principal?.email,
          telefono: datosTienda_principal?.telefono,
          telefono2: datosTienda_principal?.telefono2,
          direccion: datosTienda_principal?.direccion,
          lat: datosTienda_principal?.lat,
          lng: datosTienda_principal?.lng,
          estado: datosTienda_principal?.estado,
          tipo: datosTienda_principal?.tipo,
          url_code: datosTienda_principal?.url_code,
          categoria: datosTienda_principal?.categoria,
          dominio: datosTienda_principal?.dominio,
          facebook: datosTienda_principal?.facebook,
          twitter: datosTienda_principal?.twitter,
          linkedin: datosTienda_principal?.linkedin,
          instagram: datosTienda_principal?.instagram,
          youtube: datosTienda_principal?.youtube,
          whatsapp: datosTienda_principal?.whatsapp,
          whatsapp_text: datosTienda_principal?.whatsapp_text,
          horario: datosTienda_principal?.horario,
          horario_esp: datosTienda_principal?.horario_esp,
          color_tema: datosTienda_principal?.color_tema,
          color_menu: datosTienda_principal?.color_menu,
          color_boton_primary: datosTienda_principal?.color_boton_primary,
          favicon: datosTienda_principal?.favicon,
          id_tipopage: datosTienda_principal?.id_tipopage,
        };

        if (datosTienda_principal?.pais) {
          dataEmpresa["pais"] = await this.empresaService.findPais(
            datosTienda_principal.pais
          );
        }

        if (datosTienda_principal?.departamento) {
          dataEmpresa["departamento"] =
            await this.empresaService.findDepartamento(
              datosTienda_principal.departamento
            );
        }

        if (datosTienda_principal?.ciudad) {
          dataEmpresa["municipio"] = await this.empresaService.findCiudad(
            datosTienda_principal.ciudad
          );
        }

        const pimage1 = `${BASE_URL_TIENDA_SERVER}uploads/admin/logo${datosTienda_principal?.id_clientes}.png`;

        if (fs.existsSync(pimage1)) {
          dataEmpresa[
            "logo"
          ] = `${BASE_URL_TIENDA}uploads/admin/logo${datosTienda_principal?.id_clientes}.png`;
        } else {
          const grupo_config = await this.empresaService.findGrupoTienda(
            datosTienda_principal.id_empresa
          );

          if (grupo_config) {
            dataEmpresa[
              "logo"
            ] = `${BASE_URL_TIENDA}assets/grupos/${datosTienda_principal?.id_empresa}/${grupo_config.img}`;
          } else {
            dataEmpresa["logo"] = false;
          }
        }

        const manifest_relative = `${BASE_URL_RED}uploads/dependencias/${datosTienda_principal?.id_clientes}/manifest/`;
        const manifest_path = `${BASE_URL_RED_SERVER}uploads/dependencias/${datosTienda_principal?.id_clientes}/manifest/`;

        if (fs.existsSync(manifest_path)) {
          dataEmpresa["favicon_image"] =
            datosTienda_principal?.favicon !== "default"
              ? `${manifest_relative}icon32/${datosTienda_principal?.favicon}`
              : `${BASE_URL_RED}assets/templates/template_2/images/icons/favicon.ico`;
        } else {
          dataEmpresa[
            "favicon_image"
          ] = `${BASE_URL_RED}assets/templates/template_2/images/icons/favicon.ico`;
        }

        response.status(200).json(dataEmpresa);
      } else {
        response.status(200).json(empresa);
      }
    } catch (error) {
      console.error(error);
      response.status(500).json({ message: "Error en el servidor" });
    }
  };
}
export default EmpresaController;
