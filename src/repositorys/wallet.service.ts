import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import UserDTO from "../models/dto/user.dto";
import { makeid } from "../common/helper";
import log from "../common/logger";
import { number } from "joi";
import UserController from "../controllers/user.controller";
import UserService from "./user.service";
import EmpresaService from "./empresa.service";

class WalletService {
  static prisma = new PrismaClient();

  rechargeWallet = async (user: string, admin: string, amount: number) => {
  try {
    var userService: UserService = new UserService();
    var getUserData: any | undefined = await userService.findByEmail(user);
    if (getUserData=== null || getUserData === undefined) {
      return { success: false, msj: 'No se ha encontrado el usuario en la bd'  + user + ')'}
     }
    console.log('User a recargar es')
    console.log(getUserData)
    var userId: number = getUserData!.MemberId;
    var userPoints: number = getUserData!.Points;
    var newUserPoints =  userPoints + amount;


      var getWorkerData: any | undefined = await userService.findByEmail(admin);
      if (getWorkerData=== null || getWorkerData === undefined) {
        return { success: false, msj: 'No se ha encontrado el administrador en la bd (' + admin + ')'}
       }
      console.log('User que recargar es')
    console.log(getWorkerData)
      var workerGroupId: number = getWorkerData!.idgrupo;
       
  
      var getAdmindata: any = await userService.findAdminGroup(workerGroupId);
      if (getAdmindata=== null || getAdmindata === undefined) {
        return { success: false, msj: 'No se ha encontrado una wallet master para el grupo ' + workerGroupId}
       }
      console.log('wallet master es')
    console.log(getUserData)
      var adminId: number = getAdmindata.MemberId;
      var adminPoints: number = getAdmindata!.acumulado_saldo - amount;
      

         await WalletService.prisma.$transaction([
          WalletService.prisma.arm_members.update({
              where: {
                MemberId: userId,
              },
            data: {
                Points: newUserPoints
            }
            }),
            WalletService.prisma.arm_members.update({
              where: {
                MemberId: adminId,
              },
            data: {
              acumulado_saldo: adminPoints
            }
            }),
           
      ]);
      return { success: true, msj: 'Recarga realizada con exito', newUserPoints: newUserPoints, newGroupPoints: 0}
    
      
  } catch (e) {
    return {success: false, msj: 'No se ha podido realizar la recarga'}
  }
  };

}

export default WalletService;
