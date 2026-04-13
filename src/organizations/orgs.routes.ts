import { Hono } from 'hono'
import {
  createOrgController,
  getAllOrgController,
  getOrgByIdController,
  deleteOrgController,
  editOrgController,
} from './orgs.controllers'

export const orgRoutes = new Hono()

orgRoutes.post('/create', createOrgController)
orgRoutes.get('/get/all', getAllOrgController)
orgRoutes.get('/get/:id', getOrgByIdController)
orgRoutes.delete('/delete/:id', deleteOrgController)
orgRoutes.patch('/edit/:id', editOrgController)