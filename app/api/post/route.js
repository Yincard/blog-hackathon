import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
    try {
        const { username, imageUrl, content, likes, category, userId, profilePic} = await request.json();
        
        const post = await prisma.post.create({
            data: {
                username,
                imageUrl,
                content,
                likes,
                category,
                userId,
                profilePic
            },
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}