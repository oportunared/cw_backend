interface IValoracionConductor {
  id: number;
  OrderId: number | null;
  id_conductor: string | null;
  mecanica: string | null;
  cumplimiento_cargue: string | null;
  cumplimiento_descargue: string | null;
  amabilidad: string | null;
  pagos_oportuno: string | null;
}
export default IValoracionConductor