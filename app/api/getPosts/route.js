// /app/api/posts/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch posts from the database in random order
        const posts = await prisma.$queryRaw`SELECT * FROM Post ORDER BY RAND()`;

        // Return posts as JSON
        return NextResponse.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        // Return error response
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    } finally {
        // Ensure Prisma Client is properly disconnected
        await prisma.$disconnect();
    }
}
