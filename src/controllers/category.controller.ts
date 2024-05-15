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
import CategoryService from "../repositorys/category.service";

const BASE_URL_TIENDA = "https://oportuna.red/Wms_Oportuna/tienda/";
const BASE_URL_TIENDA_SERVER = "/var/www/html/Wms_Oportuna/tienda/";

class CategoryController implements IController {
  public path = "/category";
  public router = express.Router();
  public empresaService: EmpresaService;
  public categoryService: CategoryService;

  constructor() {
    this.initialzeRoutes();
    this.categoryService = new CategoryService();
    this.empresaService = new EmpresaService();
  }

  public initialzeRoutes() {
    this.router.post(
      `${this.path}/get_categorias_tiendas`,
      this.get_categorias_tiendas
    );
  }

  get_categorias_tiendas = async (
    req: express.Request,
    res: express.Response
  ) => {
    const idEmpresa = req.body.id_empresa;
    //console.log(req.body);

    try {
      if (!idEmpresa) {
        return res.status(400).json({
          message:
            "Falta el parámetro id_empresa o ingresaste un parametro incorrecto",
        });
      }

      const empresa = await this.empresaService.findById(idEmpresa);
      //console.log(empresa);

      if (!empresa) {
        return res.status(404).json({ message: "Empresa no encontrada" });
      }

      if (empresa.tienda_principal !== null && empresa.tienda_principal > 0) {
        const categories = await this.categoryService.findCategorys(idEmpresa);

        if (categories) {
          const processedCategories = categories.map((row) => {
            const pimage1 = `${BASE_URL_TIENDA_SERVER}uploads/admin/product/category${row.Image}`;
            const image = fs.existsSync(pimage1)
              ? `${BASE_URL_TIENDA}uploads/admin/product/category/${row.Image}`
              : `${BASE_URL_TIENDA}uploads/noimage.png`;

            const isDeleteValue = row.isDelete === "cero" ? 0 : 0;

            return {
              CategoryId: row.CategoryId,
              Category: row.Category,
              Image: image,
              Description: row.Description,
              ParentId: row.ParentId,
              SortOrder: row.SortOrder,
              Status: row.Status,
              isDelete: isDeleteValue,
              id_empresa: row.idgrupo,
              id_tienda: row.iddependencia,
            };
          });
          return res.json({ categorys: processedCategories });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Tienda no asignada a la empresa" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };
}

export default CategoryController;
