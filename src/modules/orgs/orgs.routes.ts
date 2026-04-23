import { Hono } from 'hono';
import { createOrgController, getUserOrgsController, getOrgController, joinOrgController, removeOrgController, updateOrgController, getOrgDashboardController } from './orgs.controllers';

const orgsRoutes = new Hono();

orgsRoutes.post('/create-org', createOrgController);
orgsRoutes.get('/get-orgs/me', getUserOrgsController);
orgsRoutes.get('/get-org/:id', getOrgController);
orgsRoutes.get('/dashboard/:orgId', getOrgDashboardController);
orgsRoutes.post('/join-org', joinOrgController);
orgsRoutes.delete('/remove-org/:id', removeOrgController);
orgsRoutes.put('/edit-org/:id', updateOrgController);

export default orgsRoutes;
