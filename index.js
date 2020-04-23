const AWS = require('aws-sdk');
const S3 = new AWS.S3()

const sharp = require('sharp');

exports.handler = async(event) => {

    try {
        //Get input file bucket name and key name
        const bucketName = event.Records[0].s3.bucket.name
        const key = event.Records[0].s3.object.key

        //Get input image buffer from S3
        const fileBuffer = await getFile(bucketName, key)
        
        //Get Thumbnail buffer from original image buffer
        const thumbnail= await getThumbnailImage(fileBuffer.Body)

        //Push thumbnail image to S3
        const pushThumb = await pushThumbnailToS3(thumbnail, bucketName, key)


        const response = {
            statusCode: 200,
            body: JSON.stringify('Thumbnail Uploaded To S3'),
        };
        return response;
    }
    catch (e) {
        console.log(e)
        return
    }
};

async function getFile(bucketName, key) {
    const objectParam = {
        Bucket: bucketName,
        Key: key
    }
    try {
        const fileData = await S3.getObject(objectParam).promise();
        return fileData
    }
    catch (e) {
        throw new Error(e)
    }
}

function getThumbnailImage(fileBuffer) {
    return sharp(fileBuffer)
    .rotate()
    .resize(200)
    .toBuffer()
}
async function pushThumbnailToS3(thumbnail, bucketName, key) {

    const objectParam = {
        Bucket: `${bucketName}-output`,
        Key: key,
        Body: thumbnail
    }
    try {
        const fileData = await S3.putObject(objectParam).promise();
        return fileData
    }
    catch (e) {
        throw new Error(e)
    }
}
