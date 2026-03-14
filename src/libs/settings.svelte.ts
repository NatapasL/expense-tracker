class GlobalSettings {
	#selectedDate = $state<Date>(new Date());
	#groupedBy = $state<'date' | 'category'>('date');

	constructor() {
		if (typeof window !== 'undefined') {
			const savedDate = sessionStorage.getItem('selected_month');
			if (savedDate) {
				const date = new Date(savedDate);
				if (!isNaN(date.getTime())) {
					this.#selectedDate = date;
				}
			}

			const savedGroupedBy = sessionStorage.getItem('grouped_by');
			if (savedGroupedBy === 'date' || savedGroupedBy === 'category') {
				this.#groupedBy = savedGroupedBy;
			}
		}

		$effect.root(() => {
			$effect(() => {
				if (typeof window !== 'undefined') {
					sessionStorage.setItem('selected_month', this.#selectedDate.toISOString());
					sessionStorage.setItem('grouped_by', this.#groupedBy);
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

	get groupedBy() {
		return this.#groupedBy;
	}

	set groupedBy(value: 'date' | 'category') {
		this.#groupedBy = value;
	}
}


export const settings = new GlobalSettings();
