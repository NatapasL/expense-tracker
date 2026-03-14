class GlobalSettings {
	#selectedDate = $state<Date>(new Date());

	constructor() {
		if (typeof window !== 'undefined') {
			const saved = sessionStorage.getItem('selected_month');
			if (saved) {
				const date = new Date(saved);
				if (!isNaN(date.getTime())) {
					this.#selectedDate = date;
				}
			}
		}

		$effect.root(() => {
			$effect(() => {
				if (typeof window !== 'undefined') {
					sessionStorage.setItem('selected_month', this.#selectedDate.toISOString());
				}
			});
		});
	}

	get selectedDate() {
		return this.#selectedDate;
	}

	set selectedDate(value: Date) {
		this.#selectedDate = value;
	}
}

export const settings = new GlobalSettings();
