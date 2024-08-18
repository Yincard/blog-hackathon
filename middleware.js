// middleware.js
import { NextResponse } from 'next/server';
import { verifyAuthToken } from './firebase';

export async function middleware(req) {
  const url = new URL(req.url);
  const token = req.cookies.get('token');

  const protectedRoutes = ['./app/blogify/home'];

  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    if (!token || !(await verifyAuthToken(token))) {
      return NextResponse.redirect(new URL('./app/auth/Login', req.url));
    }
  }

  return NextResponse.next();
}
