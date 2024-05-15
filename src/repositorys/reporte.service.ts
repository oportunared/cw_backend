import { PrismaClient, registro } from "@prisma/client";
import UserDTO from "../models/dto/user.dto";
import { makeid } from "../common/helper";
import log from "../common/logger";

class ReporteService {
  static prisma = new PrismaClient();

  findAll = async (user): Promise<any> => {
    return await ReporteService.prisma.registro.findMany({
      where: {
        vendedor: user,
      },
    });
  };
}

export default ReporteService;
