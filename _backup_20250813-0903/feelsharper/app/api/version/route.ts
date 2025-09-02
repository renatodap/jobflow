import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const version = {
    name: 'Feel Sharper',
    version: '1.0.0',
    build: process.env.VERCEL_GIT_COMMIT_SHA || '6b710a2',
    buildDate: process.env.VERCEL_BUILD_TIME || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    branch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    commit: {
      sha: process.env.VERCEL_GIT_COMMIT_SHA || '6b710a2',
      message: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'Manual build',
      author: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || 'System',
    },
    runtime: {
      node: process.version,
      nextjs: '15.4.5',
    },
  };

  return NextResponse.json(version, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    },
  });
}