import { Hono } from 'hono';
import { createMilestoneController, getMilestonesController, updateMilestoneController, removeMilestoneController } from './milestones.controllers';

const milestonesRoutes = new Hono();

milestonesRoutes.post('/create-milestone', createMilestoneController);
milestonesRoutes.post('/milestones', getMilestonesController);
milestonesRoutes.put('/edit-milestone/:id', updateMilestoneController);
milestonesRoutes.delete('/remove-milestone/:id', removeMilestoneController);

export default milestonesRoutes;
