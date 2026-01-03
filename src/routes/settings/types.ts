export interface Provider {
	id?: number;
	name: string;
	baseUrl: string;
	apiKey: string;
	models?: Model[];
}

export interface Model {
	id: string;
	name?: string;
	providerId?: number;
}
