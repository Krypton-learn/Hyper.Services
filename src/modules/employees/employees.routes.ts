import { Hono } from 'hono';
import { getEmployeesController, getEmployeeController, updateEmployeeController, removeEmployeeController } from './employees.controllers';

const employeesRoutes = new Hono();

employeesRoutes.get('/get-employees/:orgId', getEmployeesController);
employeesRoutes.get('/get-employee/:id', getEmployeeController);
employeesRoutes.put('/edit-employee/:orgId/:id', updateEmployeeController);
employeesRoutes.delete('/remove-employee/:orgId/:id', removeEmployeeController);

export default employeesRoutes;