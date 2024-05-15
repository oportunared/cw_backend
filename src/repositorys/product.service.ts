import {PrismaClient, arm_product} from '@prisma/client';
import bcrypt from 'bcrypt';
import UserDTO from '../models/dto/user.dto';
import {makeid} from '../common/helper';
import log from '../common/logger';

class ProductService {

    static prisma = new PrismaClient();


    findAll = async (idgrupo_: number) => {
        return await ProductService.prisma.arm_product.findMany({
            where:{
                idgrupo:idgrupo_
            }
        });
    }

    findByID = async (productId: number) => {
        return await ProductService.prisma.arm_product.findUnique({
            where: {
                ProductId: productId,
            }
        });
    }

    findByProductName = async (name: string) => {
        log.info("Fetching by name from product service");
        const user = await ProductService.prisma.arm_product.findMany({
            where: {
                ProductName: name,
            },
        });
        log.info("found user in service");
        return user;
    }

  


}

export default ProductService;