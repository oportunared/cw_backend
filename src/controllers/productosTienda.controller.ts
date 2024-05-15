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
import ProductosTiendaService from "../repositorys/productosTienda.service";
import EmpresaService from "../repositorys/empresa.service";

const BASE_URL_TIENDA = "https://oportunaecommerce.s3.amazonaws.com/tiendas";
const BASE_URL_TIENDA_SERVER = "/var/www/html/Wms_Oportuna/tienda/";

class ProductosTiendaController implements IController {
  public path = "/productosTienda";
  public router = express.Router();
  public productosTiendaService: ProductosTiendaService;
  public empresaService: EmpresaService;

  constructor() {
    this.initialzeRoutes();
    this.productosTiendaService = new ProductosTiendaService();
    this.empresaService = new EmpresaService();
  }

  public initialzeRoutes() {
    this.router.post(
      `${this.path}/get_productos_tiendas`,
      this.get_productos_tiendas
    );
    this.router.post(
      `${this.path}/get_producto_tienda`,
      this.get_producto_tienda
    );
  }

  get_productos_tiendas = async (
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

      if (!empresa) {
        return res.status(404).json({ message: "Empresa no encontrada" });
      }

      if (empresa.tienda_principal !== null && empresa.tienda_principal > 0) {
        const productos = await this.productosTiendaService.findAll(idEmpresa);

        if (productos.length > 0) {
          const productosTransformados = productos.map((producto) => ({
            ...producto,
            isDelete: 0,
            imagenthumb: `${BASE_URL_TIENDA}/${producto.idgrupo}/productos/${producto.ProductId}/thumb/${producto.Image}`,
            imagelarge: `${BASE_URL_TIENDA}/${producto.idgrupo}/productos/${producto.ProductId}/${producto.Image}`,
          }));
          res.json({
            productos: productosTransformados,
            base_url: `${BASE_URL_TIENDA}/uploads/admin/product`,
          });
        } else {
          res.json({
            error: "No hay productos disponibles",
            productos: false,
          });
        }
      } else {
        res.json({
          error: "No se encontro tienda principal",
          productos: false,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error en el servidor" });
    }
  };

  get_producto_tienda = async (req: express.Request, res: express.Response) => {
    const id_empresa = req.body.id_empresa;
    const id_producto = req.body.id_producto;

    try {
      if (!id_empresa && !id_producto) {
        return res
          .status(400)
          .json({ error: "id_empresa o id_producto incorrectos o faltantes" });
      }

      const empresa = await this.empresaService.findById(id_empresa);

      if (!empresa) {
        return res.status(404).json({ error: "Empresa no encontrada" });
      }

      if (
        empresa.tienda_principal !== null &&
        empresa.tienda_principal > 0 &&
        id_producto > 0
      ) {
        const row = await this.productosTiendaService.findProduct(
          id_empresa,
          id_producto
        );

        if (!row) {
          return res.json({ error: "No se encontró el producto" });
        }

        const processedProduct: any = {
          ProductId: row.ProductId,
          CatId: row.CatId,
          ProductType: row.ProductType,
          CatName: row.arm_category.Category,
          ProductName: row.ProductName,
          Description: row.Description,
          Quantity: row.Quantity,
          DisplyShop: row.DisplyShop,
          Attributes: row.Attributes,
          isDelete: row.isDelete,
          idgrupo: row.idgrupo,
          id_empresa: row.id_empresa,
          PriceDiscount: row.PriceDiscount,
          File: row.File,
          /* ? `${BASE_URL_TIENDA}uploads/admin/product/${row.idgrupo}/${row.File}`
            : undefined */ price: row.Price,
          /* parseFloat(row.Price.toString()) > 0
              ? parseInt(row.Price.toString().replace(/[\.,]/g, ""), 10)
              : 0 */ Product_desc_larga:
            await this.productosTiendaService.findDescription(id_producto),
        };

        processedProduct["TotalPrice"] =
          row.PriceDiscount != null &&
          parseFloat(row.PriceDiscount.toString()) > 0
            ? row.PriceDiscount.toString().includes(",")
              ? processedProduct.price -
                processedProduct.price *
                  (parseFloat(row.PriceDiscount.toString().replace(",", ".")) /
                    100)
              : processedProduct.price -
                parseFloat(row.PriceDiscount.toString().replace(/[\.,]/g, ""))
            : undefined;

        const questions = await this.productosTiendaService.findQuestions(
          row.ProductId
        );

        if (questions) {
          processedProduct["questions"] = questions;
        }

        const banner = await this.productosTiendaService.findBannerImage(
          row.ProductId
        );
        if (banner) {
          processedProduct.banner = banner;
        }

        /*  const productImageArray = row.Image ? row.Image.split(",") : [];
        productImageArray.forEach((image, index) => {
          const pimage1 = `${BASE_URL_TIENDA_SERVER}uploads/admin/product/${row.idgrupo}/thumb/${image}`;
          const imagenthumb = fs.existsSync(pimage1)
            ? `${BASE_URL_TIENDA}uploads/admin/product/${row.idgrupo}/thumb/${image}`
            : `${BASE_URL_TIENDA}uploads/noimage.png`;
          const imagenlarge = fs.existsSync(pimage1)
            ? `${BASE_URL_TIENDA}uploads/admin/product/${row.idgrupo}/${image}`
            : `${BASE_URL_TIENDA}uploads/noimage.png`; 

          processedProduct[`imagenthumb${index}`] = imagenthumb;
          processedProduct[`imagenlarge${index}`] = imagenlarge;
          
        });
          */

        processedProduct[
          `imagenthumb`
        ] = `${BASE_URL_TIENDA}/${row.idgrupo}/productos/${row.ProductId}/thumb/${row.Image}`;
        processedProduct[
          `imagenlarge`
        ] = `${BASE_URL_TIENDA}/${row.idgrupo}/productos/${row.ProductId}/${row.Image}`;

        const response = {
          product: processedProduct /* ,
          base_url_raiz: BASE_URL_TIENDA, */,
        };

        return res.json(response);
      } else {
        return res.json({ error: "No posee un marketplace" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Error en el servidor" });
    }
  };
}

export default ProductosTiendaController;
