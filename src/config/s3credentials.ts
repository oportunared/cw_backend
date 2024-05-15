import { S3Client, PutObjectCommand, ListObjectsCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs"
import { Readable } from "stream";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
/* import { config } from "dotenv";
config();

const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const REGION = process.env.REGION;
const BUCKET_NAME = process.env.BUCKET_NAME; */



const client = new S3Client({
  region: REGION,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_ACCESS_KEY},
});


export async function uploadFile(memberID: string, taskID: string, registroID: string, file) {
  const stream = fs.createReadStream(file.tempFilePath)

  const storagePath = `${memberID}/${taskID}/${registroID}/${file.name}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: storagePath,
    Body: stream,
  };
  
  const command = new PutObjectCommand(uploadParams)
  return await client.send(command)
}

export async function getFiles(memberID: string, taskID: string, registroID: string) {
  try {
    const prefix = `${memberID}/${taskID}/${registroID}/`;
    const command = new ListObjectsCommand({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });
    return await client.send(command);

    // Filtrar solo los archivos que coinciden con la ruta especificada
    //const filesInPath = result.Contents?.filter(file => !file.Key?.endsWith('/'));

    //return { Contents: filesInPath };
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
}

export async function getFile(filename) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename
  });
  return await client.send(command)
}

export async function downloadFile(filename) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename
  });
  const response = await client.send(command);

  const writeStream = fs.createWriteStream(`./src/files/${filename}`);
  const readStream = response.Body as Readable

  return new Promise<void>((resolve, reject) => {
    readStream.on('data', (chunk) => {
      writeStream.write(chunk);
    });

    readStream.on('end', () => {
      writeStream.end();
      resolve();
    });

    readStream.on('error', (error) => {
      reject(error);
    });
  });
}

export async function getFileUrl(memberID: string, taskID: string, registroID: string, filename: string) {
  const path = `${memberID}/${taskID}/${registroID}/${filename}`;
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path
  });
  return await getSignedUrl(client, command, {expiresIn: 3600})
}

export async function deleteFile(memberID: string, taskID: string, registroID: string, filename: string) {
  const path = `${memberID}/${taskID}/${registroID}/${filename}`;
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: path,
  });

  return await client.send(command);
}