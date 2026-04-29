import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

type RequiredEnv = {
  supabaseUrl: string;
  serviceRoleKey: string;
};

function readLocalEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    return new Map<string, string>();
  }

  const values = new Map<string, string>();
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, '');
    values.set(key, value);
  }

  return values;
}

function getRequiredEnv(): RequiredEnv {
  const fileEnv = readLocalEnvFile();
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? fileEnv.get('NEXT_PUBLIC_SUPABASE_URL') ?? '';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? fileEnv.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para limpiar datos de prueba.');
  }

  return { supabaseUrl, serviceRoleKey };
}

function getAdminClient() {
  const { supabaseUrl, serviceRoleKey } = getRequiredEnv();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getStoragePath(publicUrl: string) {
  const url = new URL(publicUrl);
  const marker = '/pet-photos/';
  const markerIndex = url.pathname.indexOf(marker);

  if (markerIndex === -1) {
    return null;
  }

  return url.pathname.slice(markerIndex + marker.length);
}

export async function cleanupFeedbackByTitle(title: string) {
  const supabase = getAdminClient();
  const { data: rows, error: selectError } = await supabase
    .from('feedback')
    .select('id,image_url')
    .eq('title', title);

  if (selectError) {
    throw selectError;
  }

  if (!rows || rows.length === 0) {
    return;
  }

  const storagePaths = rows
    .map((row) => row.image_url)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map(getStoragePath)
    .filter((value): value is string => Boolean(value));

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('pet-photos').remove(storagePaths);
    if (storageError) {
      throw storageError;
    }
  }

  const ids = rows.map((row) => row.id);
  const { error: deleteError } = await supabase.from('feedback').delete().in('id', ids);

  if (deleteError) {
    throw deleteError;
  }
}
