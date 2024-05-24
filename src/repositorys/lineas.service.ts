import { PrismaClient } from "@prisma/client";

class LinesService {
  static prisma = new PrismaClient();

  getLines = async () => {
    return await LinesService.prisma.lineas.findMany({
    });
  };
}

export default LinesService;
