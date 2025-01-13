const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Add this temporary debug log
console.log('AWS Config:', {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID?.slice(0, 5) + '...',
});

const uploadToS3 = async (file) => {
    const isVideo = file.mimetype.startsWith('video/');
    const key = `${isVideo ? 'analysis-videos' : 'analysis-images'}/${Date.now()}-${file.originalname}`;
    const params = {
        Bucket: 'end-nov-webapp-clann',
        Key: key,
        Body: file.buffer,
        ContentType: isVideo ? 'video/mp4' : file.mimetype,
        ContentEncoding: 'base64'
    };

    try {
        const command = new PutObjectCommand(params);
        const result = await s3Client.send(command);
        const fileUrl = `https://end-nov-webapp-clann.s3.amazonaws.com/${key}`;
        console.log('S3 upload result:', result);
        return fileUrl;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw error;
    }
};

module.exports = { uploadToS3 }; 