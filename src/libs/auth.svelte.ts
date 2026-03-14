/// <reference types="vite/client" />

declare global {
	interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		google?: any;
	}
}

class AuthState {
	accessToken = $state<string | null>(null);
	user = $state<{ name: string; picture: string } | null>(null);
	isInitialized = $state<boolean>(false);
	tokenExpiry = $state<number | null>(null);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private tokenClient: any = null;

	init() {
		if (typeof window === 'undefined' || this.isInitialized) return;

		// We check for window.google due to async loading of GIS script
		if (window.google) {
			this.setupClient();
		} else {
			// Wait for script to load
			const interval = setInterval(() => {
				if (window.google) {
					clearInterval(interval);
					this.setupClient();
				}
			}, 100);
		}

		// Restore from localStorage
		const savedToken = localStorage.getItem('google_access_token');
		const savedExpiry = localStorage.getItem('google_token_expiry');
		
		if (savedToken && savedExpiry) {
			this.accessToken = savedToken;
			this.tokenExpiry = parseInt(savedExpiry);
			
			// If token is expired or about to expire (within 5 mins), refresh it
			if (Date.now() > this.tokenExpiry - 300000) {
				console.log('Token expired or near expiry, refreshing...');
				// We can't call silentRefresh directly yet because setupClient might not have finished
				// but setupClient is called synchronously above if window.google is ready.
				// If not, it will be handled in setupClient when it finishes.
				if (this.isInitialized) {
					this.silentRefresh();
				}
			} else {
				this.fetchUserInfo();
			}
		}
	}

	private setupClient() {
		this.tokenClient = window.google.accounts.oauth2.initTokenClient({
			client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
			scope:
				'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			callback: (response: any) => {
				if (response.error !== undefined) {
					console.error('Google Auth Error:', response);
					return;
				}
				this.accessToken = response.access_token;
				if (this.accessToken) {
					const expiry = Date.now() + response.expires_in * 1000;
					this.tokenExpiry = expiry;
					localStorage.setItem('google_access_token', this.accessToken);
					localStorage.setItem('google_token_expiry', expiry.toString());
					this.fetchUserInfo();
				}
			}
		});
		this.isInitialized = true;
		
		// If we had a token but it's expired, refresh now that client is ready
		if (this.accessToken && this.tokenExpiry && Date.now() > this.tokenExpiry - 300000) {
			this.silentRefresh();
		}
	}

	silentRefresh() {
		if (this.tokenClient) {
			console.log('Initiating silent refresh...');
			this.tokenClient.requestAccessToken({ prompt: 'none' });
		}
	}

	async fetchUserInfo(retry = true) {
		if (!this.accessToken) return;
		try {
			const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
				headers: {
					Authorization: `Bearer ${this.accessToken}`
				}
			});
			if (!res.ok) {
				// Token might be expired
				if (res.status === 401 && retry) {
					console.log('User info 401, attempting silent refresh...');
					this.silentRefresh();
					// The callback will call fetchUserInfo again upon success
					return;
				}
				throw new Error('Failed to fetch user info');
			}
			this.user = await res.json();
		} catch (error) {
			console.error('Error fetching user info:', error);
		}
	}

	login() {
		if (this.tokenClient) {
			this.tokenClient.requestAccessToken();
		} else {
			console.error('Google Token Client not initialized');
		}
	}

	logout() {
		if (this.accessToken && window.google) {
			window.google.accounts.oauth2.revoke(this.accessToken, () => {
				// revoked
			});
		}
		this.accessToken = null;
		this.user = null;
		this.tokenExpiry = null;
		localStorage.removeItem('google_access_token');
		localStorage.removeItem('google_token_expiry');
	}

	get isAuthenticated() {
		return !!this.accessToken;
	}
}

export const auth = new AuthState();
