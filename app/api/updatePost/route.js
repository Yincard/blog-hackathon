import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function PUT(request) {
    try {
        const { id } = request.url.split('/').pop();
        const { likes } = await request.json();

        await prisma.post.update({
            where: { id: id },
            data: { likes: likes },
        });

        return NextResponse.json({ message: 'Likes updated successfully' });
    } catch (error) {
        console.error('Error updating likes:', error);
        return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
    }
}
