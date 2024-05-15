import {PrismaClient} from '@prisma/client';
import log from '../common/logger';


class ProductosTiendaService {

    static prisma = new PrismaClient();

    
    findAll = async (idempresa):Promise<any> => {
        return await ProductosTiendaService.prisma.wms_arm_product.findMany({
            where:{
                id_empresa: idempresa,
                isDelete: "cero"
            },
            orderBy: {
                ProductId: "desc"
            }/* ,
            include: {
                arm_category: true
            } */
        }); 
    }

    findProduct = async (idEmpresa, idProducto):Promise<any> => {
        return await ProductosTiendaService.prisma.wms_arm_product.findFirst({
            where :{
                id_empresa: idEmpresa,
                ProductId: idProducto
            },
            include: {
                arm_category: {
                    select: {
                        Category: true,
                    }
                }
            },
            orderBy: {
                ProductId: "desc"
            }
        })
    }

    findDescription = async (idProducto):Promise<any> => {
        return await ProductosTiendaService.prisma.wms_arm_product_desc.findFirst({
            where: 	{ProductId: idProducto},
            select: {Description: true} 
        })
    }

    findQuestions = async (idProducto):Promise<any> => {
        return ProductosTiendaService.prisma.wms_arm_question_product.findMany({
            where: {
                productId: idProducto
              }
        })
    }

    findBannerImage = async (idProducto):Promise<any> => {
        return ProductosTiendaService.prisma.wms_arm_bannerimage.findFirst({
            where: {
                ProductId: idProducto,
                status: 1,
            }
        })
    }



}

export default ProductosTiendaService