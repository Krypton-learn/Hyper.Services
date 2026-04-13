import { Hono } from 'hono'
import {
  createTaskController,
  getAllTaskController,
  getTaskByIdController,
  deleteTaskController,
  editTaskController,
  completeTaskController,
  addTeamMembersController,
  joinTeamController,
  rejectTeamController,
} from './tasks.controllers';

export const taskRoutes = new Hono()

taskRoutes.post('/create', createTaskController)
taskRoutes.get('/get/all', getAllTaskController)
taskRoutes.get('/get/:id', getTaskByIdController)
taskRoutes.delete('/delete/:id', deleteTaskController)
taskRoutes.patch('/edit/:id', editTaskController)
taskRoutes.patch('/complete/:id', completeTaskController)
taskRoutes.patch('/add-team-members/:id', addTeamMembersController)
taskRoutes.patch('/join-team/:id', joinTeamController)
taskRoutes.patch('/reject-team/:id', rejectTeamController)
