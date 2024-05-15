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
import ProductService from '../repositorys/product.service';

class ProductController implements IController {

    public path = "/products";
    public router = express.Router();
    public productService: ProductService;

    constructor(){
        this.initialzeRoutes();
        this.productService = new ProductService();
    }

    public initialzeRoutes(){
        this.router.get(`${this.path}/:id([0-9]+)`, [authMiddleware()], this.getProductByID);
        this.router.get(`${this.path}`, [], this.getAllProducts);

    }

    getAllProducts = async (request: express.Request, response: express.Response) => {
        const existingUser = await this.productService.findAll(parseInt("70"));
        response.send(existingUser);
    }

    createProduct = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
       /* const user: UserDTO = request.body;
        log.debug(`Creating a new user with email ${user.email}`);
        const existingUser = await this.userService.findByEmail(user.email);
        if(existingUser && existingUser.id !== undefined){
            log.error("User already exists")
            next(new UserAlreadyExistException());
        } else {
            user.dob = dayjs(user.dob).toDate();
            // save in the db
            //const createdUser = await this.userService.createUser(user);
            //response.send(omit(createdUser, 'password'));
            response.send();
        }*/
    }


    getProductByID = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
        var id = request.params.id;
        log.info(`Fetching details for product id ${id}`);
        try {
            const currentP = await this.productService.findByID(parseInt(id));            
            if(currentP?.ProductId !== undefined){
                response.send(omit(currentP, 'AutoShip'));
            } else {
                next(new UserNotFoundException(id)) 
            }
        } catch(e){
            next(new UserNotFoundException(id))
        }
    }

    


}

export default ProductController;