import { PrismaClient } from "@prisma/client";

class LinesService {
  static prisma = new PrismaClient();

  getLines = async () => {
    return await LinesService.prisma.lineas.findMany({
    });
  };

  createServiceclausules = async (serviceId: number, data: any) =>
 {
  return await LinesService.prisma.lineas_grupos_servicio.create({
    data: {
      descripcion: data.descripcion,
      idgrupo: data.idgrupo,
      serviceId: data.serviceId,
      encuesta: data.encuesta,
      idlinea: data.idlinea,
      cliente: data.cliente as number,
      observation: data.observation,
      nombrelinea: data.nombrelinea,
      finish: 0
    },
  });
 }

 getClausulesByServiceId = async (serviceId) => {
  return await LinesService.prisma.lineas_grupos_servicio.findMany({
    where: {
      serviceId: serviceId
    } 
  });
};

}

export default LinesService;
