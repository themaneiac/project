"use strict";
process.on( `uncaughtException`, console.error )
if ( process.env.PORT == null )		// Heroku
	process.env.PORT = 5000

const fetch = require('node-fetch')
const server = require('express')()

const getPage = async function (URL, raw = false) {
	// await delay( (Math.random()*3+0.5)*1000 )

	const d = await ( await fetch(
		URL,
		// { credentials: 'include', headers: { 'Cookie': 'view_mature=true' } }
	) ).text()

	return raw ? d : /*new JSDOM(*/ d /*).window*/
}

;( async () => { try {

	await server.get( '/images/watched.rss', async (req, res) => {

		/*if ( req.query['key'] !== 'sikritkey' )
			return;*/

		res.set('Content-Type', 'application/rss+xml')

		res.end(
			( await getPage( `https://derpibooru.org/images/watched.rss?key=${req.query.key}`, true ) )
			.replace( /(https:\/\/derpicdn\.net\/img\/\d+\/\d+\/\d+\/\d+\/)\w+(\.\w+)/ig, '$1full$2' )
		)
	})

	server.listen( process.env.PORT, '0.0.0.0' )

} catch (e) {
	console.error(e)
} })()
