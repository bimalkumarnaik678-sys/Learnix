import { createServer } from 'http';
import app from './app.js';
import { PORT } from './config/env.js';

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`learnAI backend listening on http://localhost:${PORT}`);
});