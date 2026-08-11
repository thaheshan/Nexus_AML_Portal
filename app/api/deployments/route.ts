import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { withCache, invalidateCache } from '@/lib/cache';

const DEFAULT_DEPLOYMENTS = [
  { service: 'nexus-api',        env: 'Production',  status: 'LIVE',     version: 'v2.4.1', deployedBy: 'CI/CD Pipeline' },
  { service: 'nexus-frontend',   env: 'Production',  status: 'LIVE',     version: 'v3.1.0', deployedBy: 'CI/CD Pipeline' },
  { service: 'nexus-worker',     env: 'Staging',     status: 'BUILDING', version: 'v2.4.2', deployedBy: 'Thaheshan M.' },
  { service: 'nexus-db-migrate', env: 'Production',  status: 'FAILED',   version: 'v1.9.0', deployedBy: 'CI/CD Pipeline' },
  { service: 'nexus-cache',      env: 'Staging',     status: 'LIVE',     version: 'v1.3.0', deployedBy: 'Thaheshan M.' },
];

export async function GET(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    if (!decoded || (role !== 'DEVELOPER' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').toLowerCase();
    const env = searchParams.get('env') || 'All';

    const cacheKey = `deployments:${search}:${env}`;

    const responseData = await withCache(cacheKey, 15, async () => {
      // Auto-seed if table is empty
      try {
        const count = await (prisma as any).deployment.count();
        if (count === 0) {
          await (prisma as any).deployment.createMany({ data: DEFAULT_DEPLOYMENTS });
        }
      } catch {
        // Table not yet synced — skip
      }

      let deployments: any[] = [];
      try {
        deployments = await (prisma as any).deployment.findMany({
          orderBy: { updatedAt: 'desc' }
        });
      } catch {
        deployments = DEFAULT_DEPLOYMENTS.map((d, i) => ({ id: `dep-${i}`, ...d, createdAt: new Date().toISOString() }));
      }

      const filtered = deployments.filter(d => {
        const matchSearch = d.service.toLowerCase().includes(search);
        const matchEnv = env === 'All' || d.env === env;
        return matchSearch && matchEnv;
      });

      const liveCount     = deployments.filter(d => d.status === 'LIVE').length;
      const buildingCount = deployments.filter(d => d.status === 'BUILDING').length;
      const failedCount   = deployments.filter(d => d.status === 'FAILED').length;
      const isHealthy     = failedCount === 0;

      return {
        data: filtered,
        stats: {
          liveCount,
          buildingCount,
          failedCount,
          systemStatus: isHealthy ? 'All Systems Operational' : `${failedCount} Service Issue Detected`,
          isHealthy,
        }
      };
    });

    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Deployments GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role     = (decoded as any)?.role;
    const userName = (decoded as any)?.name || 'Developer';

    if (!decoded || (role !== 'DEVELOPER' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { service, env, version, status } = body;

    if (!service || !env || !version) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let newDeployment: any;
    try {
      newDeployment = await (prisma as any).deployment.create({
        data: { service, env, version, status: status || 'BUILDING', deployedBy: userName }
      });
    } catch {
      newDeployment = { id: `dep-${Date.now()}`, service, env, version, status: status || 'BUILDING', deployedBy: userName, createdAt: new Date().toISOString() };
    }

    await invalidateCache(['deployments:*', 'dashboard:*']);

    return NextResponse.json(newDeployment, { status: 201 });
  } catch (error) {
    console.error('Deployments POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = await verifyToken(token);
    const role = (decoded as any)?.role;
    if (!decoded || (role !== 'DEVELOPER' && role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    let updated: any;
    try {
      updated = await (prisma as any).deployment.update({ where: { id }, data: { status } });
    } catch {
      updated = { id, status };
    }

    await invalidateCache(['deployments:*', 'dashboard:*']);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Deployments PATCH Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
