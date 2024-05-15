import e, * as express from 'express';
import UserDTO from '../models/dto/user.dto';
import UserService from '../repositorys/user.service';
import IController from '../interface/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';

import log from '../common/logger';
import {isDate24HoursOrOlder, omit} from '../common/helper';
import dayjs from 'dayjs';
import UserAlreadyExistException from '../exception/userAlreadyExist.exception';
import ModifyUserDTO, { AllowedActions } from '../models/dto/modifyUser.dto';
import UserNotFoundException from '../exception/notFound.exception';
import ActivationPendingException from '../exception/activationPending.exception';
import AccountAlreadyActiveException from '../exception/accountAlreadyActive.exception';
import RequestExpiredException from '../exception/requestExpired.exception';
import InvalidResetRequestException from '../exception/invalidResetRequest.exception';
import InvalidActivationRequestException from '../exception/invalidActivationRequest.exception';
import HttpException from '../exception/http.exception';
import InvalidModificationException from '../exception/invalidModification.exception';
import authMiddleware from '../middleware/auth.middleware';
import { unlink } from 'fs';
import ReporteService from '../repositorys/reporte.service';

class ReporteController implements IController {

    public path = "/getReportes";
    public router = express.Router();
    public reporteService: ReporteService

    constructor(){
        this.initializeRoutes();
        this.reporteService = new ReporteService();
    }
    
    public initializeRoutes(){
        this.router.post(`${this.path}`, this.getReportes)
    }
    
    getReportes = async (request: express.Request, response: express.Response) => {
      const user = request.body.email
        
        try {
            const allReportes = await this.reporteService.findAll(user)

        
            if (!allReportes) {
              return response
                .status(400)
                .json({ error: "No se encontraron registros" });
            }
        
            const formattedReportes = allReportes.map((row) => ({
              cliente: row.cliente,
              funcionario: row.vendedor,
              identificadorTipo: row.observa,
              lat: row.lat,
              lng: row.lng,
              fecha: row.fecha,
              tipo: row.tipo,
              idUnico: row.unique_id
            }));
        
            
        
            response.status(200).json(formattedReportes);
          } catch (error) {
            console.error(error);
            return response.status(500).json({ error: "Error en el servidor" });
          }
        };
    }

export default ReporteController