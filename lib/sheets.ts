import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

export const SHEET_HEADERS = [
  'fullName',
  'email',
  'department',
  'location',
  'accomodation',
  'twitter',
  'discord',
  'linkedin',
  'github',
  'resumeFileName',
  'resumeBase64',
  'interests',
  'otherInterest',
  'developmentSections',
  'familiarity',
  'excites',
  'whyJoin',
  'proud',
  'timeCommit',
] as const;

function createSheetsClient(auth: OAuth2Client) {
  return google.sheets({ version: 'v4', auth });
}

function getRequiredSpreadsheetId(spreadsheetId: string) {
  if (!spreadsheetId) {
    throw new Error('GOOGLE_SHEET_ID is not configured');
  }

  return spreadsheetId;
}

export async function getPrimarySheetTitle(auth: OAuth2Client, spreadsheetId: string) {
  const client = createSheetsClient(auth);
  const response = await client.spreadsheets.get({
    spreadsheetId: getRequiredSpreadsheetId(spreadsheetId),
    fields: 'sheets(properties(title,index))',
  });

  const sheetTitle = response.data.sheets?.[0]?.properties?.title;

  if (!sheetTitle) {
    throw new Error('Unable to find a worksheet in the configured Google Sheet');
  }

  return { client, sheetTitle };
}

export async function ensureSheetHeaders(auth: OAuth2Client, spreadsheetId: string, sheetTitle: string, headers: readonly string[]) {
  const client = createSheetsClient(auth);
  const response = await client.spreadsheets.values.get({
    spreadsheetId: getRequiredSpreadsheetId(spreadsheetId),
    range: `${sheetTitle}!1:1`,
  });

  const firstRow = response.data.values?.[0] || [];
  const currentHeaders = firstRow.map((value) => String(value));
  const expectedHeaders = [...headers];

  if (currentHeaders.length === 0 || currentHeaders.join('||') !== expectedHeaders.join('||')) {
    await client.spreadsheets.values.update({
      spreadsheetId: getRequiredSpreadsheetId(spreadsheetId),
      range: `${sheetTitle}!1:1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[...headers]],
      },
    });
  }
}

export async function appendSubmissionRow(params: {
  auth: OAuth2Client;
  spreadsheetId: string;
  sheetTitle: string;
  headers: readonly string[];
  row: Record<string, string>;
}) {
  const client = createSheetsClient(params.auth);
  const values = params.headers.map((header) => params.row[header] || '');

  const response = await client.spreadsheets.values.append({
    spreadsheetId: getRequiredSpreadsheetId(params.spreadsheetId),
    range: `${params.sheetTitle}!A:Z`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [values],
    },
  });

  return response.data;
}
