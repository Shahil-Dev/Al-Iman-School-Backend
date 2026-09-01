import { Server } from 'http';
import app from './app';

const PORT = process.env.PORT || 5000;
let server: Server;

async function main() {
  try {
    server = app.listen(PORT, () => {
      console.log(`🚀 School ERP Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

main();

// Process crash Handlers
process.on('unhandledRejection', (error) => {
  console.log('😈 UnhandledRejection detected, shutting down server...', error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', () => {
  console.log('😈 UncaughtException detected, shutting down server...');
  process.exit(1);
});