const multer = require('multer')
const sharp = require('sharp')
const aws = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const { AWS_ID, AWS_KEY, AWS_S3_BUCKET } = require('../config/keys')

class ImageService {
  static createUploadMiddleware = () => {
    return multer({
      limits: {
        fileSize: 10000000
      },
      fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
          return cb(new Error('Please upload an image file.'))
        }

        cb(undefined, true)
      }
    })
  }

  static resize = async (buffer, width, height) => {
    const newBuffer = await sharp(buffer).resize({ width, height }).png().toBuffer()
    return newBuffer
  }

  static saveImage = async (buffer) => {
    const s3 = new aws.S3({
      credentials: new aws.Credentials({
        accessKeyId: AWS_ID,
        secretAccessKey: AWS_KEY
      })
    })

    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: uuidv4(),
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    }

    return new Promise((resolve, reject) => {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data.Location)
        }
      })
    })
  }
}

module.exports = ImageService