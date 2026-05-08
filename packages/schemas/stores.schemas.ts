import { z } from 'zod'

export const uploadStoreSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  organizationId: z.string().optional(),
})

export type UploadStoreInput = z.infer<typeof uploadStoreSchema>
