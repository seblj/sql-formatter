export enum NewlineMode {
	always = 'always',
	never = 'never',
	lineWidth = 'lineWidth',
	itemCount = 'itemCount',
	hybrid = 'hybrid',
}
export interface NewlineOptions {
	mode: NewlineMode | keyof typeof NewlineMode;
	itemCount?: number;
}

export enum AliasMode {
	always = 'always',
	never = 'never',
	select = 'select',
}
