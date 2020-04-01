
const Promise = require('bluebird')
const path = require('path')
const AWS = require('aws-sdk')
const mime = require('mime-types')
const proxy = require('proxy-agent')
const fs = Promise.promisifyAll(require('fs'))

let s3

function config(options) {

  if (s3) return
  
  if (options.proxy) {
    AWS.config.update({
      httpOptions: { agent: proxy(options.proxy) }
    })
  }

  AWS.config.update({
    region: options.region,
    accessKeyId: options.key,
    secretAccessKey: options.secret
  })

  s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: options.name }
  })
}

function listFiles(directory) {
  if (fs.statSync(directory).isDirectory()) {
    return fs
      .readdirSync(directory)
      .map(function appendDirectory(file) {
        return path.join(directory, file)
      })
      .map(function resolveFolder(file) {
        if (fs.statSync(file).isDirectory()) {
          return listFiles(file)
        }
        return file
      })
      .reduce(function reducer(accumulator, current) {
        let result = accumulator.slice(0)
        if (typeof current === 'string') {
          result.push(current)
        }
        if (current instanceof Array) {
          result = accumulator.concat(current)
        }
        return result
      }, [])
  }
  return [directory]
}

function upload(file) {
  let filename = path.basename(file.path)
  let content = fs.readFileSync(file.path)
  let contentType = mime.lookup(filename)
  // fix: replace path separator of win os as unix style '/'
  let key = (file.key || file.path).replace(/\\/g, '/')

  if (contentType) {
    let params = {
      Body: content,
      Key: key,
      ContentType: contentType,
      CacheControl: contentType === 'text/html' ? 'no-cache' : "max-age=31536000"
    };

    return new Promise(function(resolve, reject){
      s3.putObject(params, (err, data) => {
        if (err) {
          console.error(`Upload file ${filename} to s3 at ${key} failed!`)
          console.error(err, err.stack); // an error occurred
          reject(err)
        } else {
          console.log(`Upload file ${filename} to s3 at ${key} successfully!`)
          console.log(data); // successful response
          resolve()
        }
      })
    })

  } else {
    return Promise.reject(`${filename} is not an valid resouce file`)
  }
}

function uploadFolder(folder, options) {
  const files = listFiles(folder)
  return Promise.all(files.map(file => 
    upload({
      path: file,
      key: path.relative(options ? options.basePath : folder, file)
    })
  ))
}

module.exports = {
  instance: s3,
  config: config,
  upload: uploadFolder
}