import Dexie, { type EntityTable } from 'dexie';

export interface Category {
	id: string; // unique identifier
	name: string;
	color: string; // hex or theme color
	icon: string; // emoji icon
	synced: number; // 0 for no, 1 for yes
	deleted: number; // 0 for no, 1 for yes
	updatedAt: number; // timestamp
}

export interface Expense {
	id: string; // unique identifier
	amount: number;
	category: string; // reference to Category.id
	date: string; // ISO string
	description: string;
	synced: number; // 0 for no, 1 for yes
	deleted: number; // 0 for no, 1 for yes
	updatedAt: number; // timestamp
}

const db = new Dexie('MoneyTrackerDB') as Dexie & {
	categories: EntityTable<Category, 'id'>;
	expenses: EntityTable<Expense, 'id'>;
};

// Schema declaration
db.version(4).stores({
	categories: 'id, name, synced, deleted, updatedAt',
	expenses: 'id, category, amount, date, synced, deleted, updatedAt'
});

const defaultCategories: (Omit<Category, 'synced' | 'deleted' | 'updatedAt'> &
	Partial<Category>)[] = [
	{ id: 'cat-food', name: 'Food', color: '#5865F2', icon: '🍔' },
	{ id: 'cat-transport', name: 'Transportation', color: '#57F287', icon: '🚗' },
	{ id: 'cat-edu', name: 'Education', color: '#FEE75C', icon: '📚' },
	{ id: 'cat-health', name: 'Health', color: '#EB459E', icon: '⚕️' },
	{ id: 'cat-home', name: 'Home / Utilities', color: '#ED4245', icon: '🏠' },
	{ id: 'cat-family', name: 'Family', color: '#9B59B6', icon: '👨‍👩‍👧‍👦' },
	{ id: 'cat-work', name: 'Work', color: '#3498DB', icon: '💼' },
	{ id: 'cat-misc', name: 'Miscellaneous', color: '#95A5A6', icon: '📦' },
	{ id: 'cat-game', name: 'Game', color: '#E67E22', icon: '🎮' },
	{ id: 'cat-toy', name: 'Toy', color: '#1ABC9C', icon: '🧸' },
	{ id: 'cat-entertainment', name: 'Entertainment', color: '#E74C3C', icon: '🎬' }
];

// Seed logic
db.on('populate', async () => {
	const categoriesToSeed = defaultCategories.map((c) => ({
		...c,
		synced: 0,
		deleted: 0,
		updatedAt: 1
	})) as Category[];

	await db.categories.bulkAdd(categoriesToSeed);
});

export { db };
