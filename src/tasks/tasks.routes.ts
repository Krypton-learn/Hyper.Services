import { Hono } from 'hono'
import {
  createTaskController,
  getAllTaskController,
  getTaskByIdController,
  deleteTaskController,
  editTaskController,
} from './tasks.controllers';

export const taskRoutes = new Hono()

taskRoutes.post('/create', createTaskController)
taskRoutes.get('/get/all', getAllTaskController)
taskRoutes.get('/get/:id', getTaskByIdController)
taskRoutes.delete('/delete/:id', deleteTaskController)
taskRoutes.patch('/edit/:id', editTaskController)
