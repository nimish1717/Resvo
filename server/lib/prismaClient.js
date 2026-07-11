
// Single shared Prisma Client instance.
// Every controller should import { prisma } from here — never create
// a new PrismaClient() anywhere else in the project.

const { PrismaClient } = require('@prisma/client')

// In development, nodemon restarts the whole process on every file save.
// Without this guard, each restart would create a brand new connection
// pool against Postgres, and old ones can pile up until you hit
// Postgres's max connection limit. Stashing the client on `global`
// means restarts reuse the same instance instead of creating a new one.
//
// In production this block is skipped entirely — the process starts
// once and stays running, so there's nothing to reuse across restarts.

let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prismaInstance) {
        global.prismaInstance = new PrismaClient();
    }
    prisma = global.prismaInstance;
}

module.exports = prisma;
