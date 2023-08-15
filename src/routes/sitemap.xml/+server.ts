export async function GET() {

  const sitemapRaw = await fetch('sitemap.xml');
	const sitemap = await sitemapRaw.text();

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
