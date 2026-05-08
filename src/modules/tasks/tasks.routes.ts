import { Hono } from 'hono'
import { createTasksController, getTasksController, getTaskController, updateTaskController, deleteTaskController, completeTaskController } from './tasks.controllers'

const tasks = new Hono()

tasks.post('/create-task', createTasksController)
tasks.get('/get-tasks', getTasksController)
tasks.get('/get-task/:id', getTaskController)
tasks.put('/update-task/:id', updateTaskController)
tasks.patch('/complete/:id', completeTaskController)
tasks.delete('/delete-task/:id', deleteTaskController)

export default tasks
