"use server";

require("dotenv").config();

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const maxFileSize = 1048576 * 10;

export const getSignedURL = async (
    realFileName: string,
    fileType: string,
    fileSize: number,
    checksum: string,
  ) => {
  
    const allowedFileTypes = ["text/csv"];
  
    if (!allowedFileTypes.includes(fileType)) {
      return { failure: "File type not allowed" };
    }
  
    if (fileSize > maxFileSize) {
      return { failure: "File size too large" };
    }
  
    // const fileName = generateFileName();

    console.log({ realFileName });
  
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: realFileName,
      ContentType: fileType,
      ContentLength: fileSize,
      ChecksumSHA256: checksum,
    });

    console.log({ S3Client,putObjectCommand });
  
    const url = await getSignedUrl(
      s3Client,
      putObjectCommand,
      { expiresIn: 60 } // 60 seconds
    );

    return { success: { url} };
  };