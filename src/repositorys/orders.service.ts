import { PrismaClient } from "@prisma/client";
import log from "../common/logger";

class OrdersService {

    static prisma = new PrismaClient();

    findById = async(id:string):Promise<any> => {
        log.info("fetching orders by id")
        return await OrdersService.prisma.cc_arm_order.findMany({
                where: { 
                    Email: id
                }
            })
    }
}

export default OrdersService;