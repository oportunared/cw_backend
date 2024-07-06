import e, * as express from "express";
import IController from "../interface/controller.interface";
import fs from "fs";
import EmpresaService from "../repositorys/empresa.service";
import CategoryService from "../repositorys/category.service";
import WalletService from "../repositorys/wallet.service";

const BASE_URL_TIENDA = "https://oportuna.red/Wms_Oportuna/tienda/";
const BASE_URL_TIENDA_SERVER = "/var/www/html/Wms_Oportuna/tienda/";

class WalletController implements IController {
  public path = "/wallet";
  public router = express.Router();
  public walletService: WalletService;

  constructor() {
    this.initialzeRoutes();
    this.walletService = new WalletService();
  }

  public initialzeRoutes() {
    this.router.post(`${this.path}/recharge`,this.recharge);
  }


  recharge = async (
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
      const user = data.user;
      const amount: number = data.amount;
      const admin = data.admin;
      const res = await this.walletService.rechargeWallet(user, admin, amount);
      console.log('Sale de actualizar los saldos');

      return response.json(res);
    } catch (error) {
      return response.status(500).json({ error: "Error al actualizar la clausula" });
    }
  };

}

export default WalletController;
