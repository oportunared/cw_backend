import App from "./app";
import config from "./config/default";
import process from "process"
import v8 from "v8"

import TokenController from "./auth/token.controller";
import UserController from "./controllers/user.controller";
import HeartbeatController from "./health/heartbeat.controller";
import ProductController from "./controllers/product.controller";
import ReporteController from "./controllers/reporte.controller";
import EmpresaController from "./controllers/empresa.controller";
import ProductosTiendaController from "./controllers/productosTienda.controller";
import CategoryController from "./controllers/category.controller";
import TareaController from "./controllers/tarea.controller";
import AuthController from "./controllers/auth.controller";
import FileController from "./controllers/file.controller";
import TiendaController from "./controllers/tienda.controller";
import ValoracionController from "./controllers/valoracion.controller";
import OrdersController from "./controllers/orders.controller";
import ServicesController from "./controllers/services.controller";
import LineasController from "./controllers/lineas.controller";
import WalletController from "./controllers/wallet.controller";

const port = config.port as number;
const host = config.host as string;

const app = new App(
  [
    new HeartbeatController(),
    new UserController(),
    new ProductController(),
    new TokenController(),
    new ReporteController(),
    new EmpresaController(),
    new ProductosTiendaController(),
    new CategoryController(),
    new TareaController(),
    new AuthController(),
    new FileController(),
    new TiendaController(),
    new ValoracionController(),
    new OrdersController(),
    new ServicesController(),
   new  LineasController(),
   new WalletController()
  ],
  host,
  port
);
 //console.log(process.memoryUsage().heapTotal)
 //console.log(v8.getHeapStatistics())
app.listen();
