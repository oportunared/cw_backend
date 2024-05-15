import { PrismaClient } from "@prisma/client";
import log from "../common/logger";

class TiendaService {

    static prisma = new PrismaClient();

    findByID = async (id: number) => {
        log.info("Fetching by id from tienda service");
        const user = await TiendaService.prisma.clientes_web.findFirst({
          where: {
            MemberId: id,
          },
        });
        log.info("found tienda in service");
        return user;
      };

    findCategoriasTienda = async (estado) => {
        try{
            const categorias = await TiendaService.prisma.arm_categoria_tienda.findMany({
                where:{
                    estado: estado,
                }
            })
            if(!categorias){
                throw new Error('No se encontraron categorías de tiendas');
                }
                log.info(`Se obtuvieron las categorías de la BD`);
                return categorias;
            
        }catch(error){
            log.error(`Error al buscar categorías en la BD ${error}`);
            }
    };

    crea_tienda = async () => {
      const newMember = TiendaService.prisma.clientes_web.create({
        data: {
          },
        })
    }

}
export default TiendaService;