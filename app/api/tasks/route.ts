import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limiter';
import { invalidateTaskCount } from '@/lib/summary-cache';
import type { Task } from '@/lib/types';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project_id');
  const limit = Number(searchParams.get('limit') ?? '20');
  const offset = Number(searchParams.get('offset') ?? '0');

  const where = projectId ? 'WHERE project_id = ?' : '';
  const params = projectId ? [Number(projectId), limit, offset] : [limit, offset];

  const tasks = db
    .prepare(`SELECT * FROM Task ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .all(...params) as Task[];

  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  const user = getCurrentUser();
  const allowed = await checkRateLimit(`create-task:${user.id}`);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title || !body.project_id) {
    return NextResponse.json({ error: 'project_id and title are required.' }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO Task
         (project_id, owner_id, title, description, due_date, completed, feedback, created_at)
       VALUES (?, ?, ?, ?, ?, 0, NULL, ?)`,
    )
    .run(
      body.project_id,
      user.id,
      title,
      typeof body.description === 'string' ? body.description : '',
      body.due_date ?? null,
      new Date().toISOString(),
    );

  invalidateTaskCount(Number(body.project_id));

  const task = db.prepare('SELECT * FROM Task WHERE id = ?').get(result.lastInsertRowid) as Task;
  return NextResponse.json({ task }, { status: 201 });
}
