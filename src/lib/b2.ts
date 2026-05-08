import { AwsClient } from 'aws4fetch'

export interface B2Config {
  keyId: string
  appKey: string
  bucket: string
  endpoint: string
}

export const createB2Client = (env: { B2_KEY_ID?: string; B2_APP_KEY?: string; B2_BUCKET?: string; B2_ENDPOINT?: string }) => {
  const config: B2Config = {
    keyId: env.B2_KEY_ID || '',
    appKey: env.B2_APP_KEY || '',
    bucket: env.B2_BUCKET || '',
    endpoint: env.B2_ENDPOINT || '',
  }

  if (!config.keyId || !config.appKey || !config.bucket || !config.endpoint) {
    throw new Error('Missing B2 configuration')
  }

  // Log raw character codes to debug encoding issues
  console.log('RAW KEY ID:', JSON.stringify(config.keyId))
  console.log('RAW APP KEY:', JSON.stringify(config.appKey))
  console.log('RAW BUCKET:', JSON.stringify(config.bucket))

  // Extract region from endpoint - e.g., "s3.us-east-005.backblazeb2.com" -> "us-east-005"
  const endpointHost = config.endpoint.replace('https://', '').replace('http://', '')
  console.log('B2 config:', { keyId: config.keyId ? 'set' : 'missing', bucket: config.bucket, endpoint: config.endpoint, endpointHost })
  
  const regionMatch = endpointHost.match(/^s3\.(.+)\.backblazeb2\.com$/)
  const region = regionMatch ? regionMatch[1] : 'us-east-005'
  console.log('B2 region:', region)

  const aws = new AwsClient({
    accessKeyId: config.keyId,
    secretAccessKey: config.appKey,
    region,
    service: 's3',
  })

  return { 
    aws, 
    bucket: config.bucket, 
    endpoint: `https://${endpointHost}` 
  }
}

export const uploadToB2 = async (
  aws: AwsClient,
  bucket: string,
  endpoint: string,
  key: string,
  body: Uint8Array,
  contentType: string
) => {
  const url = `${endpoint}/${bucket}/${key}`
  console.log('B2 upload URL:', url)
  console.log('B2 upload key:', key)
  console.log('B2 upload body size:', body.length)
  
  const response = await aws.fetch(url, {
    method: 'PUT',
    body,
    headers: {
      'Content-Type': contentType,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`B2 upload failed: ${response.status} ${errorText}`)
  }

  return response
}

export const getFileFromB2 = async (
  env: { B2_KEY_ID?: string; B2_APP_KEY?: string; B2_BUCKET?: string; B2_ENDPOINT?: string },
  key: string
): Promise<Uint8Array> => {
  const b2 = createB2Client(env)
  const url = `${b2.endpoint}/${b2.bucket}/${key}`
  
  const response = await b2.aws.fetch(url, {
    method: 'GET',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`B2 download failed: ${response.status} ${errorText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

export const deleteFileFromB2 = async (
  env: { B2_KEY_ID?: string; B2_APP_KEY?: string; B2_BUCKET?: string; B2_ENDPOINT?: string },
  key: string
) => {
  const b2 = createB2Client(env)
  const url = `${b2.endpoint}/${b2.bucket}/${key}`
  
  const response = await b2.aws.fetch(url, {
    method: 'DELETE',
  })

  if (!response.ok && response.status !== 404) {
    const errorText = await response.text()
    throw new Error(`B2 delete failed: ${response.status} ${errorText}`)
  }
}