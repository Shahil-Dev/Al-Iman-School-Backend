"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
let server;
async function main() {
    try {
        server = app_1.default.listen(PORT, () => {
            console.log(`🚀 School ERP Server is running on port ${PORT}`);
        });
    }
    catch (err) {
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
    }
    else {
        process.exit(1);
    }
});
process.on('uncaughtException', () => {
    console.log('😈 UncaughtException detected, shutting down server...');
    process.exit(1);
});
