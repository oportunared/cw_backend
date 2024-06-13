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
    insurance: number,

  ): Promise<any> => {
console.log('va a lanzar prisma')
    return await ServicesService.prisma.arm_order_service.create({
      data: {
        groupId: groupId,
        memberId: memberId,
        paymentMethod: PaymentMethod,
        totalValue: totalValue,
        takerId: takerId,
        insurance: insurance,
        state: 'Disponible',

      },
    });
  };


  createGroupService = async (
    clauseList : string,
    groupId : number,
    PaymentMethodList: string,
    insurance: number,
    name: string,
    category: string,
    quickDesp: string,
    fatDesp: string
  ): Promise<any> => {
console.log('va a lanzar prisma')
    return await ServicesService.prisma.arm_order_group.create({
      data: {
        groupId: groupId as number,
        paymentMethodList: PaymentMethodList,
        insurance: insurance,
        clauseList: clauseList,
        name: name,
        category: category,
        quickDesp: quickDesp,
        fatDesp: fatDesp,
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
        state: data.state ?? current?.state,
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
