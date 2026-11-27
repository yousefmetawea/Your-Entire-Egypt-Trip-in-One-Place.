import { handlePlan } from '../../ai-api/plan.js';
import { defaultDeps } from '../../ai-api/deps.js';

export default {
  fetch(request: Request): Promise<Response> {
    return handlePlan(request, defaultDeps());
  },
};
