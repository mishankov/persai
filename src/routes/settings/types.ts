export interface Provider {
	id: string;
	name: string;
	baseUrl: string;
	apiKey: string;
	models?: Model[];
}

export interface Model {
	id: string;
	name?: string;
}
