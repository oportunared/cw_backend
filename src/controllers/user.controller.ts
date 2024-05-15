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

class UserController implements IController {

    public path = "/users";
    public router = express.Router();
    public userService: UserService;

    constructor(){
        this.initialzeRoutes();
        this.userService = new UserService();
    }

    public initialzeRoutes(){
        this.router.get(`${this.path}/:id([0-9]+)`, [authMiddleware()], this.getUserByID);
        //this.router.patch(`${this.path}/:id([0-9]+)`, [authMiddleware(), validationMiddleware(ModifyUserDTO)], this.modifyUserByID )
        this.router.post(`${this.path}/getByEmail`, [authMiddleware()],  this.getUserByEmail);
    }

    getUserByEmail = async (request: express.Request, response: express.Response) => {
        var email = request.params.email;
        return await this.userService.findByEmail(email);
    }

    getUserByID = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        var id = request.params.id;
        log.info(`Fetching details for user id ${id}`);
        try {
            const currentUser = await this.userService.findByID(parseInt(id));            
            if(currentUser?.MemberId !== undefined){
                response.send(omit(currentUser, 'password'));
            } else {
                next(new UserNotFoundException(id)) 
            }
        } catch(e){
            next(new UserNotFoundException(id))
        }
    }


}

export default UserController;