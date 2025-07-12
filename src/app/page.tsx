
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from 'react';

// This is a temporary redirect component.
// The main page is now at /dashboard, but we'll keep this
// to redirect any users who land on the root URL.
export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  // Render a loading state or nothing while redirecting
  return null; 
}
