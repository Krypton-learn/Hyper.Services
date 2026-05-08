import { createB2Client, uploadToB2 } from '@/lib/b2'
import { createStoreCRUD, createOrganizationStoreCRUD } from './stores.crud'

export const uploadStoreService = async (
  db: any,
  env: Record<string, string>,
  userId: string,
  file: File,
  fileName: string
): Promise<{ id: string; b2_key: string; link: string }> => {
  const fileSize = file.size
  if (fileSize > 10 * 1024 * 1024) throw new Error('File size exceeds 10MB limit')

  const fileNameLower = fileName.toLowerCase()
  if (!fileNameLower.endsWith('.pdf')) throw new Error('Only PDF files are allowed')

  const b2Key = `pdfs/${userId}/${crypto.randomUUID()}.pdf`

  let aws: any; let bucket: string; let endpoint: string
  try {
    const b2 = createB2Client(env)
    aws = b2.aws; bucket = b2.bucket; endpoint = b2.endpoint
  } catch { throw new Error('B2 configuration missing') }

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  await uploadToB2(aws, bucket, endpoint, b2Key, bytes, 'application/pdf')

  const link = `${endpoint}/${bucket}/${b2Key}`
  const entry = await createStoreCRUD(db, userId, b2Key, fileName, fileSize, link)
  return { id: entry.id, b2_key: entry.b2_key, link: entry.link }
}

export const uploadOrganizationStoreService = async (
  db: any,
  env: Record<string, string>,
  userId: string,
  file: File,
  fileName: string,
  organizationId?: string
): Promise<{ id: string; b2_key: string; link: string }> => {
  const fileSize = file.size
  if (fileSize > 10 * 1024 * 1024) throw new Error('File size exceeds 10MB limit')

  const fileNameLower = fileName.toLowerCase()
  if (!fileNameLower.endsWith('.pdf')) throw new Error('Only PDF files are allowed')

  const b2Key = `org_pdfs/${userId}/${crypto.randomUUID()}.pdf`

  let aws: any; let bucket: string; let endpoint: string
  try {
    const b2 = createB2Client(env)
    aws = b2.aws; bucket = b2.bucket; endpoint = b2.endpoint
  } catch { throw new Error('B2 configuration missing') }

  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  await uploadToB2(aws, bucket, endpoint, b2Key, bytes, 'application/pdf')

  const link = `${endpoint}/${bucket}/${b2Key}`
  const entry = await createOrganizationStoreCRUD(db, userId, b2Key, fileName, fileSize, link, organizationId)
  return { id: entry.id, b2_key: entry.b2_key, link: entry.link }
}
