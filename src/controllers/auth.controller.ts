import e, * as express from "express";
import log from "../common/logger";
import IController from "../interface/controller.interface";
import AuthService from "../repositorys/auth.service";
import authMiddleware from "../middleware/auth.middleware";
import CheckUserDTO from "../models/dto/checkUser.dto";
import validationMiddleware from "../middleware/validation.middleware";
import UserService from "../repositorys/user.service";
import { request } from "http";
import nodemailer from "nodemailer";

class AuthController implements IController {
  public path = "/auth";
  public router = express.Router();
  public authService: AuthService;
  public userService: UserService;

  constructor() {
    this.initialzeRoutes();
    this.authService = new AuthService();
    this.userService = new UserService();
  }

  public initialzeRoutes() {
    this.router.post(
      `${this.path}/checkuser_email`,
      validationMiddleware(CheckUserDTO),
      this.checkuser_email
    );
    this.router.post(`${this.path}/enviarCodigoEmail`, this.enviarCodigoEmail);
  }

  checkuser_email = async (
    request: express.Request,
    response: express.Response
  ) => {
    const userData: CheckUserDTO = request.body;
    try {
      const existingUser = await this.authService.findByEmail(userData.email);

      if (existingUser) {
        if (existingUser.Email === userData.email) {
          return response.json({ resp: "Existe Email" });
        } else if (existingUser.Phone === userData.phone) {
          response.json({ resp: "Existe Movil" });
        }
      } else {
        response.json({ resp: "Continuar con el registro" });
      }
    } catch (error) {
      return response.status(500).json(error);
    }
  };

  enviarCodigoEmail = async (request: express.Request, response: express.Response) => {
    try {
        const codigoVerificacion = (Math.floor(Math.random() * (99999 - 11111 + 1)) + 11111).toString();
        const {email, phone, fullnames} = request.body
        
    
        function ucwords(str) {
          return str.replace(/\b\w/g, (char) => char.toUpperCase());
        }

        function uriDecode(encodedString) {
          return decodeURIComponent(encodedString.replace(/\+/g, ' '));
        }
        const status = await this.authService.getEmailData("smtpstatus")
        const mail = await this.authService.getEmailData("smtpmail")
        const password = await this.authService.getEmailData("smtppassword")
        const port = await this.authService.getEmailData("smtpport")
        const user = await this.authService.getEmailData("smtpuser")
        const host = await this.authService.getEmailData("smtphost")
        const limit = await this.authService.getEmailData("maillimit")
        
    
        const smtpSettings = {
          smtpstatus: status?.ContentValue ,
          smtpmail: mail?.ContentValue,
          smtppassword: password?.ContentValue,
          smtpport: port?.ContentValue,
          smtpuser: user?.ContentValue,
          smtphost: host?.ContentValue,
          maillimit: limit?.ContentValue,
        };
      
    
        // email template and site settings
        const respuesta = await this.authService.getEmailTemplate('codigo');
        //const siteLogo = await this.authService.getLogo()
    
        if (respuesta) {
          let emailContent = uriDecode(respuesta.EmailContent);
    
          //emailContent = emailContent.replace('[LOGO]', `<a href=""><img src="${siteLogo?.ContentValue}" style="width: 250px;"></a>`);
          emailContent = emailContent.replace('[FIRSTNAME]', ucwords(fullnames));
          emailContent = emailContent.replace('[USERNAME]', email);
          emailContent = emailContent.replace('[PASSWORD]', `${codigoVerificacion}`);
    
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
              // Email sent successfully, you can save the verification code in your database here
              const user = await this.authService.saveVerificationCode(email, phone, codigoVerificacion)
              response.json({
                resp: "success",
                email,
                time: 0,
              });
            }
          });
        } else {
          console.error("Error: email template error");
          response.json({ resp: "noenvio" });
        } 
    } catch (error) {
      console.error("Error:", error);
      response.json({ resp: "noenvio" });
    }
  };
}

export default AuthController;
