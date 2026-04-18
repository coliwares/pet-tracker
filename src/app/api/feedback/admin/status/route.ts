import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUserFromToken,
  isFeedbackAdminEmail,
} from '@/lib/server/supabaseAdmin';

function getTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  return authorization.slice('Bearer '.length);
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = await getAuthenticatedUserFromToken(token);

    return NextResponse.json({ isAdmin: isFeedbackAdminEmail(user.email) });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}
