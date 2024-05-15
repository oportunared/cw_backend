import {Request} from 'express';
import UserDTO from '../models/dto/user.dto';

interface RequestWithUser extends Request {
    user: UserDTO;
}

export default RequestWithUser;