# Dist to s3

## Why

This is a simplified s3 client for uploading static assets, such as html, css, images, font file onto AWS s3 bucket. It's pretty easy to write the same script rely on the standard docs of AWS, but it's necessary for you to consider following items:
1. How to list all files in the folder(usually 'dist' or 'build') using nodejs? 
2. How to decide the mime types of each file?
3. What value is reasonable for header 'Cache Control'?
4. How to make it work behind a proxy in your local network(Usually in office )?

I spent several hours to package all above into this package and expose some of custom configurations out. e.g.


s3
```javascript
s3.config({
  proxy: 'http://proxy.com:8080',
  name: bucketName,
  region: bucketRegion,
  key: accessKeyId,
  secret: accessSecret
})
```

upload options:
```javascript
s3
  .upload(path.join(__dirname, 'dist'), {basePath: path.join(__dirname, 'dist')})
  .catch(err => {
    console.error(err)
  })
```
basePath is the relative path to the file while caculating the s3 key of the file.
e.g.
when: file: ./dist/stylesheets/app.css, basePath: ./dist
Then the key of the file ([What](#)) will be /stylesheets/app.js. By default the basePath is same with the folder(the first argument of the upload function).

## Get started

```
npm install dist-to-s3
yarn add dist-to-s3
```

Make it as a task of gulp.

gulpfile.js
```javascript
require('dotenv').config()

const path = require('path')
const s3 = require('dist-to-s3')

if (!(process.env.S3_BUCKET_NAME && process.env.S3_BUCKET_REGION && process.env.AWS_ACCESS_KEY && process.env.AWS_ACCESS_SECRET)) {
  console.error('Please make sure env variables [S3_BUCKET_NAME, S3_BUCKET_REGION, AWS_ACCESS_KEY, AWS_ACCESS_SECRET] are provided correctly and then try again')
  process.exit(1)
}

const bucketName = process.env.S3_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const accessSecret = process.env.AWS_ACCESS_SECRET;

s3.config({
  proxy: 'http://proxy.com:8080',
  name: bucketName,
  region: bucketRegion,
  key: accessKeyId,
  secret: accessSecret
})

function deploy() {
  return s3
  .upload(path.join(__dirname, 'dist'))
  .catch(err => {
    console.error(err)
  })
}

exports.deploy = deploy
```

## What is key of file
Let's make it clear with such a sample.
1. The url you visited s3 files is https://myhost.com
2. The file(app.css) you upload to s3 with key(/stylesheets/app.css)

Then you are able to visit app.css with opening url https://myhost.com/stylesheets/app.css in browser.

## LICENSE
MIT

