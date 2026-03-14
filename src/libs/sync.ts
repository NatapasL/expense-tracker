import { auth } from './auth.svelte';
import { db } from './dexie';

const SYNC_FILE_NAME = 'MoneyTracker_Sync';

export async function checkAndRunDailySync() {
	if (!auth.isAuthenticated) return;

	const lastSync = localStorage.getItem('last_sync_date');
	const today = new Date().toISOString().split('T')[0];

	if (lastSync !== today) {
		console.log('Running daily sync...');
		try {
			await syncToGoogleSheets();
			localStorage.setItem('last_sync_date', today);
			console.log('Daily sync completed efficiently.');
		} catch (error) {
			console.error('Failed to sync to Google Sheets:', error);
		}
	} else {
        console.log('Daily sync already completed today.');
    }
}

async function syncToGoogleSheets() {
	if (!auth.accessToken) throw new Error('Not authenticated');

	// 1. Find the spreadsheet
	let spreadsheetId = await findSpreadsheetId();

	// 2. Create if not found
	if (!spreadsheetId) {
		spreadsheetId = await createSpreadsheet();
	}

	if (!spreadsheetId) throw new Error('Could not get or create spreadsheet ID');

	// 3. Get all data from Dexie
	const items = await db.items.toArray();
	const categories = await db.categories.toArray();

	// Prepare values format
	const itemValues = [
		['ID', 'Amount', 'Category', 'Date', 'Description'], // Header
		...items.map((i) => [i.id, i.amount.toString(), i.category, i.date, i.description])
	];

	const categoryValues = [
		['ID', 'Name', 'Color', 'Icon'], // Header
		...categories.map((c) => [c.id, c.name, c.color, c.icon])
	];

	// 4. Clear existing data
	await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${auth.accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			ranges: ['Items', 'Categories']
		})
	});

	// 5. Update data
	const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${auth.accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			valueInputOption: 'USER_ENTERED',
			data: [
				{
					range: 'Items!A1',
					values: itemValues
				},
				{
					range: 'Categories!A1',
					values: categoryValues
				}
			]
		})
	});

	if (!res.ok) {
        const errorText = await res.text();
		throw new Error(`Failed to update sheet: ${errorText}`);
	}
}

async function findSpreadsheetId(): Promise<string | null> {
    if (!auth.accessToken) return null;
	const q = encodeURIComponent(`name='${SYNC_FILE_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
	const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
		headers: {
			Authorization: `Bearer ${auth.accessToken}`
		}
	});

	if (!res.ok) throw new Error('Failed to search Drive');

	const data = await res.json();
	if (data.files && data.files.length > 0) {
		return data.files[0].id;
	}
	return null;
}

async function createSpreadsheet(): Promise<string | null> {
    if (!auth.accessToken) return null;
	const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${auth.accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			properties: {
				title: SYNC_FILE_NAME
			},
			sheets: [
				{ properties: { title: 'Items' } },
				{ properties: { title: 'Categories' } }
			]
		})
	});

	if (!res.ok) throw new Error('Failed to create spreadsheet');

	const data = await res.json();
	return data.spreadsheetId;
}
