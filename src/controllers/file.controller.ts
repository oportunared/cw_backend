import e, * as express from "express";
import fileUpload from "express-fileupload";
import log from "../common/logger";
import IController from "../interface/controller.interface";
import {
  uploadFile,
  getFiles,
  getFile,
  downloadFile,
  getFileUrl,
  deleteFile,
} from "../config/s3credentials";

class FileController implements IController {
  public path = "/file";
  public router = express.Router();

  constructor() {
    this.initializeRoutes();
  }

  public initializeRoutes() {
    this.router.post(`${this.path}/upload`, this.uploadFile);
    this.router.post(`${this.path}/files`, this.files);
    this.router.post(`${this.path}/downloadFile`, this.getFile);
    this.router.delete(`${this.path}/deleteFile`, this.deleteFile);
    //this.router.get(`${this.path}/downloadFile/:filename`, this.downloadFile);
  }

  uploadFile = async (request, response) => {
    console.log(request.files.file);
    const file = request.files.file;
    const memberID = request.body.memberID;
    const taskID = request.body.taskID;
    const registroID = request.body.registroID;

    const result = await uploadFile(memberID, taskID, registroID, file);
    response.json(result);
  };

  files = async (request: express.Request, response: express.Response) => {
    const memberID = request.body.memberID;
    const taskID = request.body.taskID;
    const registroID = request.body.registroID;

    const result = await getFiles(memberID, taskID, registroID);
    /* const files = result.Contents?.map((file) => ({
        id: file.Key,
        name: file.Key,
        isDir: false,
      })); */

    response.json(result.Contents);
  };

  getFile = async (request: express.Request, response: express.Response) => {
    const data = request.body;
    const result = await getFileUrl(
      data.memberID,
      data.taskID,
      data.registroID,
      data.filename
    );
    response.json({
      url: result,
    });
  };

  deleteFile = async (request: express.Request, response: express.Response) => {
    const memberID = request.query?.memberID as string;
    const taskID = request.query?.taskID as string;
    const registroID = request.query?.registroID as string;
    const filename = request.query?.filename as string;
  
    if (!memberID || !taskID || !registroID || !filename) {
      return response.status(400).json({ error: 'Bad Request - Missing parameters' });
    }
  
    try {
      const result = await deleteFile(memberID, taskID, registroID, filename);
      console.log(result);
      response.json(result);
    } catch (error) {
      console.error('Error deleting file:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  };

  /*   downloadFile = async (
    request: express.Request,
    response: express.Response
  ) => {
    await downloadFile(request.params.filename);
    response.json({ message: "archivo descargado" });
  };*/
}

export default FileController;
