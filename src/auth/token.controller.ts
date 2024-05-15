import * as express from "express";
import LoginDTO from "../models/dto/login.dto";
import InvalidCredentialsException from "../exception/invalidCredentials.exception";
import IController from "../interface/controller.interface";
import validationMiddleware from "../middleware/validation.middleware";
import UserService from "../repositorys/user.service";
import bcrypt from "bcrypt";
import { arm_members } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import ITokenHolder from "../interface/tokenData.interface";
import IDataStoredInToken from "../interface/dataStoredInToken.interface";
import config from "config";
import { get_client_ip } from "../common/helper";
import nodemailer from "nodemailer";
import AuthService from "../repositorys/auth.service";
import crypto from "crypto";
import authMiddleware from "../middleware/auth.middleware";
import { ifError } from "assert";

class TokenController implements IController {
  public path = "/tokens";
  public router = express.Router();
  public userService: UserService;
  public authService: AuthService;

  constructor() {
    this.initialzeRoutes();
    this.userService = new UserService();
    this.authService = new AuthService();
  }

  private initialzeRoutes() {
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginDTO),
      this.loginUser
    );
    this.router.post(`${this.path}/logout`, this.logoutUser);
    this.router.post(`${this.path}/register`, this.registerUser);
    this.router.get(`${this.path}/verify`, this.verify);
  }

  sha1 = (password) => {
    const passBytes = Buffer.from(password, "utf8");

    const hash = crypto.createHash("sha1").update(passBytes).digest("hex");

    return hash;
  };

  loginUser = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const loginData: LoginDTO = request.body;
    const user = await this.userService.findByEmail(loginData.email);
    const user2 = await this.userService.findByEmailWms(loginData.email);
    //console.log(user)
    //console.log(user2)

    if (user || user2) {
      const passBytes = Buffer.from(loginData.password, "utf8"); // data being hashed
      const digest = crypto.createHash("sha1").update(passBytes).digest("hex");
      const passSh = crypto
        .createHash("sha1")
        .update(digest, "utf8")
        .digest("hex");

      //console.log(passSh);
      //console.log(user.Password);

      /* const isPasswordMatching = await bcrypt.compare(
        loginData.password,
        user.Password
      );  */
      //console.log(isPasswordMatching);
      if (passSh === user?.Password ) {
        user.Password = "";
        const tokenData = this.createToken(user);
        response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
        response.status(200).json({ user, tokenData });
      } else {
        next(new InvalidCredentialsException());
      }

      if (passSh === user2?.Password ) {
        user2.Password = "";
        const tokenData = this.createToken(user2);
        response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
        response.status(200).json({ user2, tokenData });
      } else {
        next(new InvalidCredentialsException());
      }
    } else {
      next(new InvalidCredentialsException());
    }
  };

  logoutUser = (request: express.Request, response: express.Response) => {
    response.setHeader("Set-Cookie", ["Authorization=;Max-age:0;"]);
    response.sendStatus(200);
  };

  registerUser = async (
    request: express.Request,
    response: express.Response
  ) => {
    const { email, codigomsgmovil, fullnames, phone, tienda } = request.body;
    let maxId = 0;

    try {
      const idMax = await this.userService.findMaxId(email);
      if (idMax) {
        maxId = idMax ? idMax.id : 0;
        
      } else {
        return response.status(404).json({ message: "User not found" });
      }

      const codigo = await this.userService.findUserCode(maxId);
      const codigoVerificacion = codigo ? codigo.codigo : "";

      if (maxId > 0) {
        if (
          maxId > 0 &&
          codigomsgmovil != "" &&
          codigoVerificacion === codigomsgmovil
        ) {
          let myIp = await get_client_ip(request);
          if (!myIp) {
            myIp = "0000.0000.0000";
          }

          function ucwords(str) {
            return str.replace(/\b\w/g, (char) => char.toUpperCase());
          }

          function uriDecode(encodedString) {
            return decodeURIComponent(encodedString.replace(/\+/g, " "));
          }
          const status = await this.authService.getEmailData("smtpstatus");
          const mail = await this.authService.getEmailData("smtpmail");
          const password = await this.authService.getEmailData("smtppassword");
          const port = await this.authService.getEmailData("smtpport");
          const user = await this.authService.getEmailData("smtpuser");
          const host = await this.authService.getEmailData("smtphost");
          const limit = await this.authService.getEmailData("maillimit");

          const smtpSettings = {
            smtpstatus: status ? status.ContentValue : "",
            smtpmail: mail ? mail.ContentValue : "",
            smtppassword: password ? password.ContentValue : "",
            smtpport: port ? port.ContentValue : "",
            smtpuser: user ? user.ContentValue : "",
            smtphost: host ? host.ContentValue : "",
            maillimit: limit ? limit.ContentValue : "",
          };

          let code = `CO${
            Math.floor(Math.random() * (99999 - 11111 + 1)) + 11111
          }`;
          const verifiedCode = await this.authService.validCode(code);
          while (verifiedCode?.Code == code) {
            code = `CO${
              Math.floor(Math.random() * (99999 - 11111 + 1)) + 11111
            }`;
          }

          const userData = {
            Code: code,
            Email: email,
            Fullnames: fullnames,
            UserName: email,
            MemberStatus: "Active",
            SubscriptionsStatus: "Active",
            Password: this.sha1(codigomsgmovil),
            Phone: phone,
            Ip: myIp,
            //PackageId: 0,
            tienda: tienda,
          };

          const savedUser = await this.userService.createUser(userData);
          if (!savedUser) {
            response.status(400).json("Error al crear usuario");
          }

        const tokenData = this.createToken(savedUser);
        response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
        response.status(200).json({ savedUser: savedUser.Email
        , tokenData });



          // email template and site settings
          const respuesta = await this.authService.getEmailTemplate("register");

          if (respuesta) {
            let emailContent = uriDecode(respuesta.EmailContent);

            //emailContent = emailContent.replace('[LOGO]', `<a href=""><img src="${siteLogo?.ContentValue}" style="width: 250px;"></a>`);
            emailContent = emailContent.replace("[FIRSTNAME]",ucwords(fullnames));
            emailContent = emailContent.replace("[USERNAME]", email);
            emailContent = emailContent.replace("[PASSWORD]",codigoVerificacion);

            // Create a transporter using the default SMTP transport
            const transporter = nodemailer.createTransport({
              host: smtpSettings.smtphost,
              port: smtpSettings.smtpport,
              secure: true, // true for 465, false for other ports
              auth: {
                user: smtpSettings.smtpuser,
                pass: smtpSettings.smtppassword,
              },
            });

            // Email message
            const mailOptions = {
              from: smtpSettings.smtpmail,
              to: email,
              subject: `${respuesta.EmailSubject} ${codigoVerificacion}`,
              html: `
                <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                  <title>Código de Registro</title>
                  <style type="text/css">
                    body {
                      font-family: Arial, Verdana, Helvetica, sans-serif;
                      font-size: 16px;
                    }
                  </style>
                </head>
                <body>
                  ${emailContent}
                </body>
                </html>
              `,
            };

            // Send email
            transporter.sendMail(mailOptions, async (error, info) => {
              if (error) {
                console.error("Error sending email:", error);
                response.json({ resp: "noenvio" });
              } else {
                console.log("success mail")
                /* response.json({
                  resp: "success",
                  email,
                  time: 0,
                }); */
              }
            });
          } else {
            console.error("Error: email template error");
            response.json({ resp: "noenvio" });
          }
        }
      }
    } catch (error) {
      response.status(500).json(error);
    }
  };

  private createToken = (user/* : arm_members */ ): ITokenHolder => {
    const expiresIn = 60 * 60; // 1 hour
    const secret = config.get("jwtSecret") as string;
    const dataInToken: IDataStoredInToken = {
      id: user.MemberId,
      email: user.Email,
    };
    return {
      expiresIn: expiresIn,
      token: jwt.sign(dataInToken, secret!, { expiresIn }),
    };
  };

  private createCookie = (tokenData: ITokenHolder) => {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  };

  verify = async (request: express.Request, response: express.Response) => {
    const { Authorization } = request.cookies;
    const secret = config.get("jwtSecret") as string;
    try {
      if (!Authorization)
        return response.status(401).json({ message: "Unauthorized" });
      const decoded = jwt.verify(Authorization, secret, async (err, user) => {
        if (err) return response.status(401).json({ message: "Unauthorized" });

        const userFound = await this.userService.findByEmail(user.email);

        if (!userFound)
          return response.status(401).json({ message: "Unauthorized" });

        return response.json(userFound);
      });
    } catch (error) {
      console.log(error);
    }
  };
}
export default TokenController;
