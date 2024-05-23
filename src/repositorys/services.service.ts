import { PrismaClient } from "@prisma/client";
import { date, object } from "joi";

class ServicesService {
  static prisma = new PrismaClient();

  createService = async (
    memberId : number,
    groupId : number,
    PaymentMethod: number,
    totalValue: number,
    takerId: number,
    insurance: number
  ): Promise<any> => {
console.log('va a lanzar prisma')
    return await ServicesService.prisma.arm_order_service.create({
      data: {
        groupId: groupId,
        memberId: memberId,
        PaymentMethod: PaymentMethod,
        totalValue: totalValue,
        takerId: takerId,
        insurance: insurance,
        phase: 0
      },
    });
  };


  createGroupService = async (
    clauseList : string,
    groupId : number,
    PaymentMethodList: string,
    insurance: number
  ): Promise<any> => {
console.log('va a lanzar prisma')
    return await ServicesService.prisma.arm_order_group.create({
      data: {
        groupId: groupId as number,
        PaymentMethodList: PaymentMethodList,
        insurance: insurance,
        clauseList: clauseList
      },
    });
  };



  getServicesByGroup = async (groupId: number):Promise<any> => {
    return await ServicesService.prisma.arm_order_service.findMany({
      where: {
        groupId: groupId,
      },
    });
  };

  getGroupService = async (groupId: number):Promise<any> => {
    return await ServicesService.prisma.arm_order_group.findFirst({
      where: {
        groupId: groupId,
      },
    });
  };

  getServiceById = async (id):Promise<any> => {
    return await ServicesService.prisma.arm_order_service.findFirst({
      where: {
        OrderId: parseInt(id),
      },
    });
  };

  updateServiceById = async (data: any):Promise<any> => {
    const current = await ServicesService.prisma.arm_order_service.findFirst({
      where: {
        OrderId: data.orderId
      }
    })
    return await ServicesService.prisma.arm_order_service.update({
      where: { OrderId: parseInt(data.orderId) },
      data: {
        phase: data.phase ?? current?.phase,
        takerId: data.takerId ?? current?.takerId,
      },
    });
  };

  deleteServiceById = async (OrderId):Promise<any> => {
    return await ServicesService.prisma.arm_order_service.delete({
      where: {
        OrderId: parseInt(OrderId),
      },
    });
  };

}


export default ServicesService;
