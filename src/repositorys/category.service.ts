import { PrismaClient } from "@prisma/client";

class CategoryService {
  static prisma = new PrismaClient();

  findCategorys = async (idgrupo) => {
    return await CategoryService.prisma.wms_arm_category.findMany({
      where: {
        // Status: true,
        idgrupo: idgrupo | 0,
        //iddependencia: 0,
      },
    });
  };
}

export default CategoryService;
