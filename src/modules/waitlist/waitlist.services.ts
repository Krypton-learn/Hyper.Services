import { D1Database } from '@cloudflare/workers-types'
import { createWaitlistCRUD, getAllWaitlistCRUD, waitlistEntryExistsByEmail } from './waitlist.crud'
import { AddWaitlistInput } from '@packages/schemas/waitlist.schemas'
import { WaitlistEntry } from '@packages/schemas/waitlist.responses'

export const addWaitlistService = async (
  db: D1Database,
  data: AddWaitlistInput
): Promise<WaitlistEntry> => {
  const exists = await waitlistEntryExistsByEmail(db, data.email)
  if (exists) {
    throw new Error('Email already on waitlist')
  }
  return createWaitlistCRUD(db, data)
}

export const getAllWaitlistService = async (
  db: D1Database
): Promise<WaitlistEntry[]> => {
  return getAllWaitlistCRUD(db)
}