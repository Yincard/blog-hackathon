// Blogify/home/page.js
'use client';

import { useAuth } from '../../context/AuthContext';
import Home from './home';

export default function BlogifyHomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <Home />;
}