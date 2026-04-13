import { Hono } from 'hono'
import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
} from './employees.controllers'

export const employeeRoutes = new Hono()

employeeRoutes.post('/create', createEmployeeController)
employeeRoutes.get('/get/all', getAllEmployeesController)
employeeRoutes.get('/get/:id', getEmployeeByIdController)
employeeRoutes.patch('/edit/:id', updateEmployeeController)
employeeRoutes.delete('/delete/:id', deleteEmployeeController)
