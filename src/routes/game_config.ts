export const attempsAllowedCount: number = 6;
export const gameDataCookieName = "sbb_game_data";
export const gameConfigCookieName = "sbb_game_config";

export class GameDifficultyConfig {
	revealFirstLetter: boolean = true;

	constructor(serialized: string | undefined = undefined) {
		if (serialized) {
			Object.assign(this, JSON.parse(serialized));
		}
	}

	toString() {
		return JSON.stringify(this);
	}
}