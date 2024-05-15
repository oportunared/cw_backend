import e, * as express from "express";
import IController from "../interface/controller.interface";
import log from "../common/logger";
import OrdersService from "../repositorys/orders.service";

class OrdersController implements IController {
  public path = "/api";
  public router = express.Router();
  public ordersService : OrdersService;

  constructor(){
    this.initializeRoutes()
    this.ordersService = new OrdersService();
  }

  public initializeRoutes(){
    this.router.get(this.path + '/order', this.findOrder)
  }
  findOrder = async (req: express.Request, res: express.Response): Promise<any> =>{
    const id = req.query.id as string;
    console.log(id)

    const respuesta = await this.ordersService.findById(id)
    if (!respuesta) {
      return res.status(404).send({ message: 'Orden no encontrada' });
    }
    res.status(200).json(respuesta)
  }
}
 export default OrdersController;