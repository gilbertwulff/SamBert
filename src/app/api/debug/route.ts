import { NextResponse } from 'next/server';

export async function GET() {
  const hasPostgresUrl = !!process.env.POSTGRES_URL;
  const postgresUrlLength = process.env.POSTGRES_URL?.length || 0;
  
  return NextResponse.json({
    hasPostgresUrl,
    postgresUrlLength,
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('POSTGRES'))
  });
}
