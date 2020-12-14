import { S3 } from 'aws-sdk'

interface Configuration {
  name: string
  region: string
  key: string
  secret: string
}

interface DistToS3 {
  instance: S3
  config: (conf: Configuration) => void
  upload: (folder: string, options?: { basePath: string }) => Promise<Array<undefined>>
}

const s3: DistToS3

export default s3
