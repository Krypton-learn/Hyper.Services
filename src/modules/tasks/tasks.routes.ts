import { Hono } from 'hono';
import { createTaskController, getTasksController, updateTaskController, removeTaskController } from './tasks.controllers';

const tasksRoutes = new Hono();

tasksRoutes.post('/create-task/:token', createTaskController);
tasksRoutes.get('/get-all/:token', getTasksController);
tasksRoutes.put('/update-task/:token/:id', updateTaskController);
tasksRoutes.delete('/remove-task/:token/:id', removeTaskController);

export default tasksRoutes;