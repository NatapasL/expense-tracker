import { auth } from '@/libs/auth.svelte';

export async function fetchSpreadsheetData(spreadsheetId: string) {
	const res = await fetch(
		`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=Expenses!A1:Z1000&ranges=Categories!A1:Z100`,
		{
			headers: { Authorization: `Bearer ${auth.accessToken}` }
		}
	);
	if (!res.ok) throw new Error('Failed to fetch spreadsheet data');
	const data = await res.json();
	return {
		expenses: data.valueRanges[0].values || [],
		categories: data.valueRanges[1].values || []
	};
}

export async function updateSheetRange(spreadsheetId: string, range: string, values: string[][]) {
	const res = await fetch(
		`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${auth.accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ values })
		}
	);
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to update sheet: ${err}`);
	}
}

export async function batchUpdateSheet(
	spreadsheetId: string,
	data: { range: string; values: string[][] }[]
) {
	const res = await fetch(
		`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${auth.accessToken}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				valueInputOption: 'USER_ENTERED',
				data
			})
		}
	);
	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to batch update sheet: ${err}`);
	}
}

export async function searchDrive(filename: string): Promise<{ files?: { id: string }[] }> {
	const q = encodeURIComponent(
		`name='${filename}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
	);
	const res = await fetch(
		`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
		{
			headers: {
				Authorization: `Bearer ${auth.accessToken}`
			}
		}
	);

	if (!res.ok) {
		throw new Error('Failed to search Drive');
	}

	return await res.json();
}

export async function createSpreadsheet(filename: string): Promise<string | null> {
	if (!auth.accessToken) return null;
	const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${auth.accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			properties: {
				title: filename
			},
			sheets: [{ properties: { title: 'Expenses' } }, { properties: { title: 'Categories' } }]
		})
	});

	if (!res.ok) throw new Error('Failed to create spreadsheet');

	const data = await res.json();
	return data.spreadsheetId;
}
