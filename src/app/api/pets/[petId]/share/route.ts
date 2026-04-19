import { NextRequest, NextResponse } from 'next/server';
import { createPetShareLink } from '@/lib/server/petShare';
import { getAuthenticatedUserFromToken } from '@/lib/server/supabaseAdmin';

function getTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  return authorization.slice('Bearer '.length);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ petId: string }> }
) {
  try {
    const token = getTokenFromRequest(request);
    const user = await getAuthenticatedUserFromToken(token);
    const { petId } = await context.params;

    const { token: shareToken, expiresAt } = await createPetShareLink(user.id, petId);
    const shareUrl = `${request.nextUrl.origin}/share/${shareToken}`;

    return NextResponse.json({ shareUrl, expiresAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
