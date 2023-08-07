export async function getNocleSutomSolution(datePartie: Date): Promise<string> {
	const url = getNocleSutomWordUrl(datePartie);

	const apiResponse = await fetch(url);
	return apiResponse.text();
}

function getNocleSutomWordUrl(datePartie: Date): string {
	const id = '34ccc522-c264-4e51-b293-fd5bd60ef7aa';

	const datePartieStr =
		datePartie.getFullYear().toString() +
		'-' +
		(datePartie.getMonth() + 1).toString().padStart(2, '0') +
		'-' +
		datePartie.getDate().toString().padStart(2, '0');

	const url = 'https://sutom.nocle.fr/mots/' + btoa(id + '-' + datePartieStr) + '.txt';

	return url;
}
