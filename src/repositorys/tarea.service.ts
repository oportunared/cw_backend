import { PrismaClient } from "@prisma/client";
import { date, object } from "joi";

class TareaService {
  static prisma = new PrismaClient();

  createTarea = async (
    idgrupo,
    title,
    body,
    start,
    tarea_estado_id,
    lat?,
    lng?,
    vendedor?,
    cliente?,
    archivo?
  ): Promise<any> => {
    const fechaActual = new Date().toISOString();

    return await TareaService.prisma.eventos.create({
      data: {
        id_grupo: parseInt(idgrupo),
        title: title,
        body: body,
        start: start,
        tarea_estado_id: parseInt(tarea_estado_id),
        lat: lat? lat.toString(): null,
        lng: lng? lng.toString(): null,
        vendedor: vendedor,
        cliente: cliente,
        notas: "Cuerpo del evento",
        url: "https://ejemplo.com",
        end: fechaActual,
        archivo: archivo,
      },
    });
  };

  getTareaByTitle = async (title: string):Promise<any> => {
    return await TareaService.prisma.eventos.findFirst({
      where: {
        title: title,
      },
    });
  };

  getTareasByCliente = async (cliente: string):Promise<any> => {
    return await TareaService.prisma.eventos.findMany({
      where: {
        cliente: cliente,
      },
      include: {
        tarea_estado: true,
      },
    });
  };
  getTareaById = async (id):Promise<any> => {
    return await TareaService.prisma.eventos.findFirst({
      where: {
        id: parseInt(id),
      },
    });
  };

  updateTareaById = async (id, title?, body?, tarea_estado_id?, archivo?):Promise<any> => {
    return await TareaService.prisma.eventos.update({
      where: { id: parseInt(id) },
      data: {
        title: title,
        body: body,
        tarea_estado_id: parseInt(tarea_estado_id),
        archivo: archivo,
      },
    });
  };

  deleteTareaById = async (id):Promise<any> => {
    return await TareaService.prisma.eventos.delete({
      where: {
        id: parseInt(id),
      },
    });
  };

  getRegistros = async (id):Promise<any> => {
    return await TareaService.prisma.registro.findMany({
      where: {
        otrocampo: id.toString()
      },
    });
  };

  setRegistro = async (
    cliente,
    vendedor,
    id,
    lat,
    lng,
    fecha,
    tarea_estado_id,
    tipo?
  ):Promise<any> => {
    return await TareaService.prisma.registro.create({
      data: {
        cliente: cliente,
        vendedor: vendedor,
        otrocampo: id.toString(),
        lat: lat.toString(),
        lng: lng.toString(),
        fecha: fecha,
        observa: tarea_estado_id.toString(),
        tiempo: "0",
        tipo: tipo,
      },
    });
  };

  getTareasAdmin = async (idgrupo: string): Promise<any> => {
    return await TareaService.prisma.eventos.findMany({
      where:{
        id_grupo: parseInt(idgrupo),
      }, 
      include: {
        tarea_estado: true,
      },
      orderBy:{
        id: "desc"
      }
    })
  }
}


export default TareaService;
