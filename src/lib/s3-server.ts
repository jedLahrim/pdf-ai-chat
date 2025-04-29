import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";
import { Readable } from "stream";

export async function downloadFromS3(fileKey: string): Promise<string> {
    const s3 = new S3({
        region: "ap-southeast-1",
        credentials: {
            accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
        },
    });

    const params = {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: fileKey,
    };

    try {
        const { Body } = await s3.getObject(params);
        if (!(Body instanceof Readable)) {
            throw new Error("Response body is not a readable stream");
        }

        const fileName = `/tmp/elliott_${Date.now()}.pdf`;
        const fileStream = fs.createWriteStream(fileName);

        return new Promise((resolve, reject) => {
            fileStream.on("finish", () => resolve(fileName));
            fileStream.on("error", (error) => reject(error));
            Body.pipe(fileStream);
        });
    } catch (error) {
        console.error("Error downloading from S3:", error);
        throw error; // Re-throw the error for further handling
    }
}

// usage:
// downloadFromS3("uploads/1693568801787chongzhisheng_resume.pdf").then(console.log).catch(console.error);
