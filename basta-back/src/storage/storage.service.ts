import { Injectable } from '@nestjs/common';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client } from './r2.client';
import { randomUUID } from 'crypto';
import 'multer';

@Injectable()
export class StorageService {
  async upload(file: Express.Multer.File, folder: string): Promise<string> {
    const client = getR2Client();
    const extension = file.originalname.split('.').pop();
    const key = `${folder}/${randomUUID()}.${extension}`;

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }

  async delete(url: string): Promise<void> {
    if (!url) return;
    const key = url.replace(`${process.env.R2_PUBLIC_URL}/`, '');
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      }),
    );
  }
}
