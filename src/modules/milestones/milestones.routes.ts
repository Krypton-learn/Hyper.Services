import { Hono } from 'hono';
import { createMilestoneController, getOrgMilestonesController, updateMilestoneController, removeMilestoneController } from './milestones.controllers';

const milestonesRoutes = new Hono();

milestonesRoutes.post('/create-milestone', createMilestoneController);
milestonesRoutes.post('/get-milestones', getOrgMilestonesController);
milestonesRoutes.put('/edit-milestone/:id', updateMilestoneController);
milestonesRoutes.delete('/remove-milestone/:id', removeMilestoneController);

export default milestonesRoutes;