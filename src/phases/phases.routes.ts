import { Hono } from 'hono'
import {
  createPhaseController,
  getAllPhasesController,
  getPhaseByIdController,
  deletePhaseController,
  updatePhaseController,
} from './phases.controllers'

export const phaseRoutes = new Hono()

phaseRoutes.post('/create', createPhaseController)
phaseRoutes.get('/get/all', getAllPhasesController)
phaseRoutes.get('/get/:id', getPhaseByIdController)
phaseRoutes.delete('/delete/:id', deletePhaseController)
phaseRoutes.patch('/edit/:id', updatePhaseController)