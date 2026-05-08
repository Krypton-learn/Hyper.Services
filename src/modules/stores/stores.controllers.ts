import { Context } from 'hono'
import { uploadStoreService, uploadOrganizationStoreService } from './stores.services'
import { getStoresCRUD, deleteStoreCRUD, getStoreByIdCRUD, getOrganizationStoresCRUD, getOrganizationStoreByIdCRUD, deleteOrganizationStoreCRUD } from './stores.crud'
import { verifyAuth } from '@/lib/auth'
import { getFileFromB2, deleteFileFromB2 } from '@/lib/b2'
import { uploadStoreSchema } from '@packages/schemas/stores.schemas'

const getRoutingInfo = (c: Context) => {
  const accountType = (c.get('accountType') as string) || 'Personal'
  const isOrgUser = accountType === 'Organization'
  return { accountType, isOrgUser }
}

export const uploadStoreController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  const contentType = c.req.header('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return c.json({ errors: { general: ['Content-Type must be multipart/form-data'] } }, 400)
  }

  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File | null
    const fileName = formData.get('fileName') as string | null
    const organizationId = formData.get('organizationId') as string | undefined

    const parsed = uploadStoreSchema.safeParse({
      fileName,
      organizationId: organizationId || undefined,
    })
    if (!parsed.success) {
      return c.json({ message: 'Validation failed', errors: parsed.error.flatten().fieldErrors }, 400)
    }

    if (!file || !(file instanceof File)) {
      return c.json({ errors: { file: ['File is required'] } }, 400)
    }

    let result
    if (isOrgUser) {
      result = await uploadOrganizationStoreService(
        c.env.DB as any,
        c.env as any,
        userId,
        file,
        parsed.data.fileName,
        parsed.data.organizationId
      )
    } else {
      result = await uploadStoreService(
        c.env.DB as any,
        c.env as any,
        userId,
        file,
        parsed.data.fileName
      )
    }
    return c.json(result, 201)
  } catch (error: any) {
    const message = error.message || 'Upload failed'
    if (message.includes('10MB') || message.includes('PDF')) {
      return c.json({ errors: { general: [message] } }, 400)
    }
    if (message.includes('B2') || message.includes('upload')) {
      return c.json({ errors: { general: [message] } }, 503)
    }
    return c.json({ errors: { general: [message] } }, 500)
  }
}

export const getStoresController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)

  let result
  if (isOrgUser) {
    result = await getOrganizationStoresCRUD(c.env.DB)
  } else {
    result = await getStoresCRUD(c.env.DB, userId)
  }
  return c.json({ results: result.results, success: true })
}

export const deleteStoreController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)
  const id = c.req.param('id')

  let store
  if (isOrgUser) {
    store = await getOrganizationStoreByIdCRUD(c.env.DB, id)
    if (!store.results || store.results.length === 0) {
      return c.json({ errors: { id: ['File not found'] } }, 404)
    }

    const { b2_key } = store.results[0]

    try {
      await deleteFileFromB2(c.env as any, b2_key)
    } catch (error) {
      console.error('Failed to delete from B2:', error)
    }

    await deleteOrganizationStoreCRUD(c.env.DB, id)
  } else {
    store = await getStoreByIdCRUD(c.env.DB, id, userId)
    if (!store.results || store.results.length === 0) {
      return c.json({ errors: { id: ['File not found'] } }, 404)
    }

    const { b2_key } = store.results[0]

    try {
      await deleteFileFromB2(c.env as any, b2_key)
    } catch (error) {
      console.error('Failed to delete from B2:', error)
    }

    await deleteStoreCRUD(c.env.DB, id, userId)
  }
  return c.json({ message: 'Store deleted successfully' })
}

export const downloadStoreController = async (c: Context) => {
  const payload = await verifyAuth(c)
  if (!payload) {
    return c.json({ errors: { general: ['Authorization header required'] } }, 401)
  }

  const userId = c.get('userId') as string
  const { isOrgUser } = getRoutingInfo(c)
  const id = c.req.param('id')

  let store
  if (isOrgUser) {
    store = await getOrganizationStoreByIdCRUD(c.env.DB, id)
  } else {
    store = await getStoreByIdCRUD(c.env.DB, id, userId)
  }

  if (!store || !store.results || store.results.length === 0) {
    return c.json({ errors: { id: ['File not found'] } }, 404)
  }

  try {
    const { b2_key, file_name } = store.results[0]
    const fileData = await getFileFromB2(c.env as any, b2_key)

    return c.body(fileData, 200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${file_name}"`,
    })
  } catch (error: any) {
    return c.json({ errors: { general: ['Failed to download file'] } }, 500)
  }
}
