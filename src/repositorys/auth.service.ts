import { PrismaClient } from "@prisma/client";
import log from "../common/logger";
import bcrypt from "bcrypt";

class AuthService {
  static prisma = new PrismaClient();

  findByEmail = async (email: string) => {
    return await AuthService.prisma.wms_arm_members.findFirst({
      where: {
        Email: email,
      },
    });
  };

  getEmailData = async (keyValue: string): Promise<any> => {
    return await AuthService.prisma.wms_arm_setting.findFirst({
      where: { 
        KeyValue: keyValue,
        Page: 'smtpsetting',
      },
      select: {
        ContentValue: true
      }
    })

  }

  getEmailTemplate = async (page: string) => {
    return await AuthService.prisma.wms_arm_emailtemplate.findFirst({
      where: {
        Page: page
      }
    })
  }

  getLogo = async () => {
    return await AuthService.prisma.wms_arm_setting.findFirst({
      where: {
        KeyValue: 'sitelogo',
        Page: 'sitesetting'
      },
      select: {
        ContentValue: true
      }
    })
  }

  saveVerificationCode = async (email, phone, codigoVerificacion) => {
    const fechaActual = new Date().toISOString();
    return await AuthService.prisma.arm_codeverificacionmail.create({
      data: {
        email: email,
        movil: phone,
        codigo: codigoVerificacion,
        fecha: fechaActual
      }
    })
  }

  validCode = async (code: string) => {
    return await AuthService.prisma.wms_arm_members.findFirst({
      where: {
        Code: code
      }
    })
  }
}

export default AuthService;
