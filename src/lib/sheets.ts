import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const sharedSpreadsheetsCache = new Set<string>();
const expiredOAuthTokensCache = new Set<string>();
const verifiedSheetTabsCache = new Set<string>();

let cachedSysCreds: { client_email: string; private_key: string } | null | undefined = undefined;
let cachedSysSheetsClient: ReturnType<typeof google.sheets> | null = null;

export function getSystemServiceAccountCreds(): { client_email: string; private_key: string } | null {
  if (cachedSysCreds !== undefined) {
    return cachedSysCreds;
  }

  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '';

  if (!raw) {
    const candidates = [
      path.resolve(process.cwd(), '../okul-risk-haritasi-etablo-firebase-adminsdk-fbsvc-9b3804341a.json'),
      path.resolve(
        process.cwd(),
        '../../Okul Risk Haritası Okul E Tablosunda/okul-risk-haritasi-etablo-firebase-adminsdk-fbsvc-9b3804341a.json'
      ),
    ];
    for (const localPath of candidates) {
      try {
        if (fs.existsSync(/*turbopackIgnore: true*/ localPath)) {
          raw = fs.readFileSync(/*turbopackIgnore: true*/ localPath, 'utf8');
          break;
        }
      } catch {}
    }
  }

  if (!raw) {
    cachedSysCreds = null;
    return null;
  }

  try {
    const trimmed = raw.trim().replace(/^['"]|['"]$/g, '');
    const parsed = JSON.parse(trimmed);
    if (parsed && parsed.client_email && parsed.private_key) {
      cachedSysCreds = {
        client_email: parsed.client_email,
        private_key: String(parsed.private_key).replace(/\\n/g, '\n'),
      };
      return cachedSysCreds;
    }
  } catch (e) {
    console.warn('GOOGLE_SERVICE_ACCOUNT_KEY JSON parse hatası:', e);
  }

  cachedSysCreds = null;
  return null;
}

function getSystemSheetsClient(): ReturnType<typeof google.sheets> | null {
  if (cachedSysSheetsClient) return cachedSysSheetsClient;
  const sysCreds = getSystemServiceAccountCreds();
  if (!sysCreds) return null;

  const auth = new google.auth.JWT({
    email: sysCreds.client_email,
    key: sysCreds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  cachedSysSheetsClient = google.sheets({ version: 'v4', auth });
  return cachedSysSheetsClient;
}

export async function ensureServiceAccountShared(
  oauthAccessToken: string,
  spreadsheetId: string
): Promise<boolean> {
  if (!oauthAccessToken || !spreadsheetId) return false;
  if (sharedSpreadsheetsCache.has(spreadsheetId)) return true;

  const sysCreds = getSystemServiceAccountCreds();
  if (!sysCreds?.client_email) return false;

  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: oauthAccessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    await drive.permissions.create({
      fileId: spreadsheetId,
      sendNotificationEmail: false,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: sysCreds.client_email,
      },
    });
    if (sharedSpreadsheetsCache.size > 2000) sharedSpreadsheetsCache.clear();
    sharedSpreadsheetsCache.add(spreadsheetId);
    return true;
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();
    if (msg.includes('already') || msg.includes('duplicate')) {
      sharedSpreadsheetsCache.add(spreadsheetId);
      return true;
    }
    return false;
  }
}

export function getSheetsClient(accessToken: string | object) {
  if (typeof accessToken === 'object' || (typeof accessToken === 'string' && accessToken.includes('"private_key"'))) {
    const creds = typeof accessToken === 'string' ? JSON.parse(accessToken) : accessToken;
    const auth = new google.auth.JWT({
      email: (creds as any).client_email,
      key: String((creds as any).private_key).replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken as string });
  return google.sheets({ version: 'v4', auth: oauth2Client });
}

function isTransientQuotaOrNetworkError(err: any): boolean {
  const code = Number(err?.code || err?.status || err?.response?.status || 0);
  const msg = String(err?.message || '').toLowerCase();
  return (
    code === 429 ||
    code === 500 ||
    code === 502 ||
    code === 503 ||
    code === 504 ||
    msg.includes('quota') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout')
  );
}

function isPermissionDeniedError(err: any): boolean {
  const code = Number(err?.code || err?.status || err?.response?.status || 0);
  const msg = String(err?.message || '').toLowerCase();
  return (
    code === 403 ||
    code === 404 ||
    msg.includes('caller does not have permission') ||
    msg.includes('insufficient permissions') ||
    msg.includes('not found')
  );
}

async function runWithQuotaRetry<T>(operation: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await operation();
    } catch (err: any) {
      if (attempt < maxRetries && isTransientQuotaOrNetworkError(err)) {
        attempt++;
        const delayMs = attempt * 1500 + Math.floor(Math.random() * 500);
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      throw err;
    }
  }
}

async function withSheetsFallback<T>(
  accessToken: string | object,
  spreadsheetId: string,
  fn: (sheets: ReturnType<typeof getSheetsClient>) => Promise<T>
): Promise<T> {
  const sysClient = getSystemSheetsClient();
  const hasUserOAuthToken =
    typeof accessToken === 'string' &&
    Boolean(accessToken) &&
    !accessToken.includes('"private_key"') &&
    !expiredOAuthTokensCache.has(accessToken);

  const isCustomServiceAccount =
    accessToken &&
    (typeof accessToken === 'object' || (typeof accessToken === 'string' && accessToken.includes('"private_key"')));

  if (isCustomServiceAccount) {
    const customClient = getSheetsClient(accessToken);
    return await runWithQuotaRetry(() => fn(customClient));
  }

  if (sysClient) {
    try {
      const result = await runWithQuotaRetry(() => fn(sysClient));
      sharedSpreadsheetsCache.add(spreadsheetId);
      return result;
    } catch (sysErr: any) {
      if (hasUserOAuthToken && isPermissionDeniedError(sysErr)) {
        await ensureServiceAccountShared(accessToken as string, spreadsheetId).catch(() => {});
        try {
          const userClient = getSheetsClient(accessToken);
          return await runWithQuotaRetry(() => fn(userClient));
        } catch (userErr: any) {
          const uMsg = String(userErr?.message || '').toLowerCase();
          if (uMsg.includes('invalid credentials') || uMsg.includes('unauthenticated') || userErr?.code === 401) {
            expiredOAuthTokensCache.add(accessToken as string);
          }
          throw sysErr;
        }
      }
      throw sysErr;
    }
  }

  const primaryClient = getSheetsClient(accessToken);
  return await runWithQuotaRetry(() => fn(primaryClient));
}

export async function ensureSheetExists(
  accessToken: string | object,
  spreadsheetId: string,
  sheetTitle: string,
  headers?: string[]
) {
  const cacheKey = `${spreadsheetId}:${sheetTitle}`;
  if (verifiedSheetTabsCache.has(cacheKey)) return;

  await withSheetsFallback(accessToken, spreadsheetId, async (sheets) => {
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });
    const sheetExists = metadata.data.sheets?.some((s) => s.properties?.title === sheetTitle);

    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetTitle } } }],
        },
      });
    }
  });

  if (headers && headers.length > 0) {
    const firstRow = await readFromSheet(accessToken, spreadsheetId, `${sheetTitle}!A1:AZ1`).catch(() => []);
    if (!firstRow || firstRow.length === 0 || firstRow[0]?.[0] !== headers[0] || firstRow[0]?.length < headers.length) {
      await writeSheetRange(accessToken, spreadsheetId, `${sheetTitle}!A1`, [headers]);
    }
  }

  if (verifiedSheetTabsCache.size > 5000) verifiedSheetTabsCache.clear();
  verifiedSheetTabsCache.add(cacheKey);
}

export async function readFromSheet(
  accessToken: string | object,
  spreadsheetId: string,
  range: string
) {
  return await withSheetsFallback(accessToken, spreadsheetId, async (sheets) => {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    return response.data.values || [];
  });
}

export async function appendToSheet(
  accessToken: string | object,
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  return await withSheetsFallback(accessToken, spreadsheetId, async (sheets) => {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return response.data;
  });
}

export async function writeSheetRange(
  accessToken: string | object,
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  return await withSheetsFallback(accessToken, spreadsheetId, async (sheets) => {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return response.data;
  });
}

export async function updateSheetRange(
  accessToken: string | object,
  spreadsheetId: string,
  range: string,
  values: any[][]
) {
  return await withSheetsFallback(accessToken, spreadsheetId, async (sheets) => {
    await sheets.spreadsheets.values.clear({ spreadsheetId, range });
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    });
    return response.data;
  });
}
