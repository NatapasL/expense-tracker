import { auth } from './auth.svelte';
import { db, type Expense, type Category } from './dexie';
import type { Table, InsertType } from 'dexie';

const SYNC_FILE_NAME = 'expense_tracker';


export async function syncToGoogleSheets(forcePull = false) {
	if (!auth.accessToken) throw new Error('Not authenticated');

	let spreadsheetId = await findSpreadsheetId();
	if (!spreadsheetId) {
		spreadsheetId = await createSpreadsheet();
	}
	if (!spreadsheetId) throw new Error('Could not get or create spreadsheet ID');

	// 1. Pull current state from Sheets
	const sheetData = await fetchSpreadsheetData(spreadsheetId);

	// 2. Sync Categories
	await syncEntityGroup<Category>(
		'categories',
		db.categories,
		sheetData.categories,
		['ID', 'Name', 'Color', 'Icon', 'Synced', 'Deleted', 'UpdatedAt'],
		(c: Category) => [c.id, c.name, c.color, c.icon, '1', (c.deleted ?? 0).toString(), (c.updatedAt ?? Date.now()).toString()],
		(row: string[]) => ({
			id: row[0],
			name: row[1],
			color: row[2],
			icon: row[3],
			synced: 1,
			deleted: parseInt(row[5] || '0'),
			updatedAt: parseInt(row[6] || '0')
		}),
		spreadsheetId,
		'Categories',
		forcePull
	);

	// 3. Sync Expenses
	await syncEntityGroup<Expense>(
		'expenses',
		db.expenses,
		sheetData.expenses,
		['ID', 'Amount', 'Category', 'Date', 'Description', 'Synced', 'Deleted', 'UpdatedAt'],
		(e: Expense) => [
			e.id,
			e.amount.toString(),
			e.category,
			e.date,
			e.description,
			'1',
			(e.deleted ?? 0).toString(),
			(e.updatedAt ?? Date.now()).toString()
		],
		(row: string[]) => ({
			id: row[0],
			amount: parseFloat(row[1] || '0'),
			category: row[2],
			date: row[3],
			description: row[4],
			synced: 1,
			deleted: parseInt(row[6] || '0'),
			updatedAt: parseInt(row[7] || '0')
		}),
		spreadsheetId,
		'Expenses',
		forcePull
	);
}

async function syncEntityGroup<T extends { id: string; synced: number; updatedAt: number; deleted: number }>(
	tableName: string,
	table: Table<T, string, InsertType<T, 'id'>>,
	sheetRows: string[][],
	headers: string[],
	toRow: (item: T) => string[],
	fromRow: (row: string[]) => T,
	spreadsheetId: string,
	rangeName: string,
	forcePull: boolean
) {
	let currentSheetRows = [...sheetRows];
	if (currentSheetRows.length === 0) {
		// New sheet, initialize with headers
		await updateSheetRange(spreadsheetId, `${rangeName}!A1`, [headers]);
		currentSheetRows = [headers];
	}

	const localItems = await table.toArray();
	const remoteItemsMap = new Map<string, { item: T; rowIndex: number }>();

	// Process sheet data (skip header at index 0)
	for (let i = 1; i < currentSheetRows.length; i++) {
		const item = fromRow(currentSheetRows[i]);
		remoteItemsMap.set(item.id, { item, rowIndex: i });
	}

	const toUpdateLocally: T[] = [];
	const toUpdateRemotely: { item: T; rowIndex?: number }[] = [];

	// Compare Local to Remote
	for (const local of localItems) {
		const remoteEntry = remoteItemsMap.get(local.id);
		if (!remoteEntry) {
			// Not on remote, push it (will append)
			toUpdateRemotely.push({ item: local });
		} else {
			const remote = remoteEntry.item;
			if (local.synced === 0 || local.updatedAt > remote.updatedAt) {
				// Local is newer or unsynced, push it (will update specific row)
				toUpdateRemotely.push({ item: local, rowIndex: remoteEntry.rowIndex });
			} else if (remote.updatedAt > local.updatedAt || forcePull) {
				// Remote is newer, pull it
				toUpdateLocally.push(remote);
			}
		}
	}

	// Identify Remote items not in Local
	for (const remoteEntry of remoteItemsMap.values()) {
		if (!localItems.find((l) => l.id === remoteEntry.item.id)) {
			toUpdateLocally.push(remoteEntry.item);
		}
	}

	// 1. Update Local DB
	if (toUpdateLocally.length > 0) {
		await table.bulkPut(toUpdateLocally);
	}

	// 2. Prepare Updates for Remote
	if (toUpdateRemotely.length > 0) {
		const updateRequests: { range: string; values: string[][] }[] = [];
		const toAppend: T[] = [];

		for (const update of toUpdateRemotely) {
			if (update.rowIndex !== undefined) {
				// Update existing row (1-indexed for Sheets range but usually easier to address as A{i+1})
				// sheetRows[0] is index 0. sheetRows[update.rowIndex] is index update.rowIndex.
				// Rows in A1 notation are 1-indexed. So rowIndex 0 is row 1.
				updateRequests.push({
					range: `${rangeName}!A${update.rowIndex + 1}`,
					values: [toRow(update.item)]
				});
			} else {
				toAppend.push(update.item);
			}
		}

		if (updateRequests.length > 0) {
			await batchUpdateSheet(spreadsheetId, updateRequests);
		}

		if (toAppend.length > 0) {
			// Append new rows at the end
			const nextRow = currentSheetRows.length + 1;
			await updateSheetRange(
				spreadsheetId,
				`${rangeName}!A${nextRow}`,
				toAppend.map((item) => toRow(item))
			);
		}
	}

	// Mark as synced locally
	if (localItems.some((l) => l.synced === 0)) {
		await table
			.where('synced')
			.equals(0)
			.modify((item: T) => {
				item.synced = 1;
			});
	}
}

async function fetchSpreadsheetData(spreadsheetId: string) {
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

async function updateSheetRange(spreadsheetId: string, range: string, values: string[][]) {
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

async function batchUpdateSheet(spreadsheetId: string, data: { range: string; values: string[][] }[]) {
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

async function findSpreadsheetId(): Promise<string | null> {
	if (!auth.accessToken) return null;
	const q = encodeURIComponent(
		`name='${SYNC_FILE_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
	);
	const res = await fetch(
		`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`,
		{
			headers: {
				Authorization: `Bearer ${auth.accessToken}`
			}
		}
	);

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
			sheets: [{ properties: { title: 'Expenses' } }, { properties: { title: 'Categories' } }]
		})
	});

	if (!res.ok) throw new Error('Failed to create spreadsheet');

	const data = await res.json();
	return data.spreadsheetId;
}
