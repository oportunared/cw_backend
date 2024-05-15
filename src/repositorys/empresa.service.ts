import { PrismaClient } from "@prisma/client";

class EmpresaService {
  static prisma = new PrismaClient();

  findById = async (id_empresa):Promise<any> => {
    return await EmpresaService.prisma.empresa_web.findFirst({
      where: {
        id_empresa: id_empresa,
        estado: "1",
      },
    });
  }; 

  findTiendaPrincipal = async (id_empresa):Promise<any> => {
    return await EmpresaService.prisma.empresa_web.findFirst({
      where: { id_empresa: id_empresa },
      select: { tienda_principal: true },
    });
  };

  findDataTienda = async (id_clientes):Promise<any> => {
    return await EmpresaService.prisma.clientes_web.findFirst({
      where: {
        id_clientes: id_clientes,
      },
    });
  };

  findPais = async (id_pais) :Promise<any>=> {
    return await EmpresaService.prisma.wms_arm_country.findUnique({
      where: { country_id: parseInt(id_pais) },
      select: { name: true },
    });
  };

  findDepartamento = async (id_departamento):Promise<any> => {
    return await EmpresaService.prisma.wms_arm_departamentos.findUnique({
      where: { id_departamento: parseInt(id_departamento) },
      select: { departamento: true },
    });
  };

  findCiudad = async (id_ciudad):Promise<any> => {
    return await EmpresaService.prisma.wms_arm_municipios.findUnique({
      where: { id_municipio: parseInt(id_ciudad) },
      select: { municipio: true },
    });
  };

  findGrupoTienda = async (id_grupo):Promise<any> => {
    return await EmpresaService.prisma.usuarios_config.findFirst({
      where: { idgrupo: id_grupo },
    });
  };
}
export default EmpresaService;
