import { handleAsk } from '../../ai-api/ask.js';
import { defaultDeps } from '../../ai-api/deps.js';

export default {
  fetch(request: Request): Promise<Response> {
    return handleAsk(request, defaultDeps());
  },
};
