import { PrismaClient } from "@prisma/client";
import log from "../common/logger";

class ValoracionService {
  static prisma = new PrismaClient();

  findById = async (id: string): Promise<any> => {
    return await ValoracionService.prisma.cc_valoraciones_conductor.findMany({
      where: {
        id_conductor: id,
      },
    });
  };

  insertarValoracion = async (
    orderId: number,
    id_conductor: string,
    mecanica?: string,
    cumplimiento_cargue?: string,
    cumplimiento_descargue?: string,
    amabilidad?: string,
    pagos_oportuno?: string
  ): Promise<any> => {
    try {
      const valoracion =
        await ValoracionService.prisma.cc_valoraciones_conductor.create({
          data: {
            OrderId: orderId,
            id_conductor: id_conductor,
            mecanica: mecanica,
            cumplimiento_cargue: cumplimiento_cargue,
            cumplimiento_descargue: cumplimiento_descargue,
            amabilidad: amabilidad,
            pagos_oportuno: pagos_oportuno,
          },
        });
      return valoracion;
    } catch (error) {
      log.error(`Error en ValoracionService.insertarValoracion - ${error}`);
    }
  };
}

export default ValoracionService;
