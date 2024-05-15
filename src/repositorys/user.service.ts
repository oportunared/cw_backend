import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import UserDTO from "../models/dto/user.dto";
import { makeid } from "../common/helper";
import log from "../common/logger";
import { number } from "joi";

class UserService {
  static prisma = new PrismaClient();

  findByEmail = async (email: string) => {
    return await UserService.prisma.arm_members.findFirst({
      where: {
        Email: email,
      },
    });
  };

  findByEmailWms = async (email: string) => {
    return await UserService.prisma.wms_arm_members.findFirst({
      where: {
        Email: email,
      },
    });
  };

  findByID = async (id: number) => {
    log.info("Fetching by id from user service");
    const user = await UserService.prisma.arm_members.findUnique({
      where: {
        MemberId: id,
      },
    });
    log.info("found user in service");
    return user;
  };

  addPasswordResetRequest = async (code: string, passw: string) => {
    log.info("Update password ");
    const pr = await UserService.prisma.arm_members.update({
      data: {
        Password: passw,
      },
      where: {
        Code: code,
      },
    });

    return pr; 
  };

  getPasswordRequest = async (code: string) => {
    return await UserService.prisma.arm_members.findFirst({
      where: {
        Code: code,
      },
      orderBy: {
        StartDate: "desc",
      },
    });
  };

  findMaxId = async (email: string): Promise<any> => {
    try {
      return await UserService.prisma.arm_codeverificacionmail.findFirst({
        select: {
          id: true,
        },
        orderBy: {
          id: "desc",
        },
        where: {
          email: email,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  findUserCode = async (maxId): Promise<any> => {
    return await UserService.prisma.arm_codeverificacionmail.findFirst({
      where: {
        id: maxId,
      },
      select: {
        codigo: true,
      },
    });
  };

  createUser = async (data): Promise<any> => {

    const modelFields = Object.keys(UserService.prisma.wms_arm_members.fields);
    const defaultValues = {}; 
    
    for (const field of modelFields) {
    
      defaultValues[field] = data[field] || "0";
    
    }
  
    defaultValues["PackageId"] = 0
    const finalData = { ...data, ...defaultValues };

    return await UserService.prisma.wms_arm_members.create({
      data: data
    }) 
  }
}

export default UserService;
