import e, * as express from "express";
import IController from "../interface/controller.interface";
import log from "../common/logger";
import ValoracionService from "../repositorys/valoracion.service";
import IValoracionConductor from "../interface/validacion.interface"

class ValoracionController implements IController {
  public path = "/api";
  public router = express.Router();
  public valoracionService: ValoracionService;

  constructor() {
    this.initRoutes();
    this.valoracionService = new ValoracionService();
  }

  public initRoutes() {
    this.router.post(`${this.path}/valoracion`, this.insertValoracion);
    this.router.get(`${this.path}/valoracion`, this.getValoracion);
  }

  insertValoracion = async (
    request: express.Request,
    response: express.Response
  ) => {
    const data = request.body;
    try {
        if (!data) {
          return response
            .status(400)
            .json({ mensaje: "No se enviaron datos correctos" });
        }
        const valoracionInserted = await this.valoracionService.insertarValoracion(
          parseInt(data.orderId),
          data.id_conductor,
          data.mecanica,
          data.cumplimiento_cargue,
          data.cumplimiento_descargue,
          data.amabilidad,
          data.pagos_oportuno
        );
        if (!valoracionInserted) {
          return response.status(500).json({
            success: false,
            mensaje: "Error al insertar la valoración",
            });
            } else {
              log.info("Se ha creado una nueva valoración para conductor");
              return response.status(201).json({
                success: true,
                mensaje: "La valoración fue creada con éxito"})
            }
    } catch (error) {
      log.error("Error en el controlador de la ruta /valoracion", error);
    }
  };


  getValoracion = async (request: express.Request, response: express.Response): Promise<any> => {
    const id_conductor = request.query.id_conductor as string
    const respuesta: IValoracionConductor[] = await this.valoracionService.findById(id_conductor);

    try {
      if (!respuesta) {
        return response.status(404).json({
          ok: false,
          msg: `El usuario no tiene valoraciones`
        });
      }

      function calcularPromedio(valoraciones: IValoracionConductor[]): Record<string, number>{
        const promedio: Record<string, number>= {
          mecanica: 0,
          cumplimiento_cargue: 0,
          cumplimiento_descargue: 0,
          amabilidad: 0,
          pagos_oportuno: 0,
        };

        const totalRegistros = valoraciones.length;
        

        if (totalRegistros === 0) {
          return promedio; // Retorna 0 para cada campo si no hay registros
        }

        // Suma los valores de cada campo
        valoraciones.forEach((valoracion) => {
          promedio.mecanica += parseFloat(valoracion.mecanica || '0');
          promedio.cumplimiento_cargue += parseFloat(valoracion.cumplimiento_cargue || '0');
          promedio.cumplimiento_descargue += parseFloat(valoracion.cumplimiento_descargue || '0');
          promedio.amabilidad += parseFloat(valoracion.amabilidad || '0');
          promedio.pagos_oportuno += parseFloat(valoracion.pagos_oportuno || '0' );
        });

        // Calcula el promedio dividiendo por el número de registros
        promedio.mecanica /= totalRegistros;
        promedio.cumplimiento_cargue /= totalRegistros;
        promedio.cumplimiento_descargue /= totalRegistros;
        promedio.amabilidad /= totalRegistros;
        promedio.pagos_oportuno /= totalRegistros;

        return promedio;
      }

      const promedioValoraciones = calcularPromedio(respuesta);
      return response.status(200).json({
        success: true,
        data: promedioValoraciones,
        });
      
    } catch (error) {
      log.error('Error al obtener las valoraciones', error);
      return response.status(500).json({
        message: 'Ocurrió un error al obtener las valoraciones'});
      
    }
  }

}

export default ValoracionController