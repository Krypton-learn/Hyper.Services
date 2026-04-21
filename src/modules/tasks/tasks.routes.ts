import { Hono } from 'hono';
import { createTaskController, getTasksController, updateTaskController, removeTaskController } from './tasks.controllers';

const tasksRoutes = new Hono();

tasksRoutes.post('/create-task', createTaskController);
tasksRoutes.post('/get-tasks', getTasksController);
tasksRoutes.put('/update-task/:id', updateTaskController);
tasksRoutes.delete('/remove-task/:id', removeTaskController);

export default tasksRoutes;