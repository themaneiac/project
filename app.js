"use strict";
process.on( `uncaughtException`, console.error )
if ( process.env.PORT == null )		// Heroku
	process.env.PORT = 5000

const fetch = require('node-fetch')
const server = require('express')()
const intlSort = ( new Intl.Collator() ).compare

const xor = (arr, f) =>
	arr.some(f) && !arr.every(f)
const getPage = async function (URL, raw = false) {
	// await delay( (Math.random()*3+0.5)*1000 )

	const d = await ( await fetch(
		URL,
		// { credentials: 'include', headers: { 'Cookie': 'view_mature=true' } }
	) ).text()

	return raw ? d : /*new JSDOM(*/ d /*).window*/
}

const tags = {
	warning : [
		'artist needed',
		'dead source',
		'source needed',
		'useless source url',
	],
	rating : [
		'explicit',
		'grimdark',
		'grotesque',
		'questionable',
		'safe',
		'semi-grimdark',
		'suggestive',
	],
	source : [
		'alternate version',
		'color edit',
		'derpibooru exclusive',
		'edit',
		'edited screencap',
		'screencap',
	],
	fandom : [
		'fallout equestria',
		'pony town',
		'them\'s fightin\' herds',
	],
	episode : [
		'equestria girls',
		'rainbow rocks',
		'my little pony: the movie',
		'friendship games',
		'legend of everfree',
		'the cutie map',
		'equestria girls (movie)',
		'forgotten friendship',
		'the cutie re-mark',
		'princess twilight sparkle (episode)',
		'the crystal empire',
		'twilight\'s kingdom',
		'to where and back again',
		'magical mystery cure',
		'school daze',
		'the crystalling',
		'a canterlot wedding',
		'make new friends but keep discord',
		'a royal problem',
		'magic duel',
		'too many pinkie pies',
		'bats!',
		'mirror magic',
		'no second prances',
		'crusaders of the lost mark',
		'rainbow falls',
		'slice of life (episode)',
		'friendship is magic',
		'gauntlet of fire',
		'season 1',
		'season 2',
		'season 3',
		'season 4',
		'season 5',
		'season 6',
		'season 7',
		'season 8',
		'season 9',
	],
	character : [
		'adagio dazzle',
		'ahuizotl',
		'aloe',
		'apple bloom',
		'applejack',
		'aria blaze',
		'beauty brass',
		'berry punch',
		'big mac',
		'big macintosh',
		'blossomforth',
		'bon bon',
		'braeburn',
		'button mash',
		'cadance',
		'caramel',
		'carrot cake',
		'celestia',
		'cheerilee',
		'cheese sandwich',
		'chrysalis',
		'cloudchaser',
		'coco pommel',
		'coco',
		'colgate',
		'cranky doodle donkey',
		'cup cake',
		'daisy',
		'daring do',
		'derpy hooves',
		'diamond tiara',
		'discord',
		'doctor whooves',
		'fancy pants',
		'fiddlesticks',
		'flam',
		'flash sentry',
		'fleetfoot',
		'fleur dis lee',
		'flim',
		'fluttershy',
		'gilda',
		'golden harvest',
		'king sombra',
		'little strongheart',
		'lotus',
		'luna',
		'lyra',
		'matilda',
		'maud pie',
		'octavia',
		'pinkie pie',
		'prince blueblood',
		'rainbow dash',
		'rarity',
		'rumble',
		'sassaflash',
		'scootaloo',
		'shining armor',
		'silver spoon',
		'soarin',
		'sombra',
		'sonata dusk',
		'spike',
		'spitfire',
		'stormwalker',
		'sunset shimmer',
		'sweetie belle',
		'thunder lane',
		'thunderlane',
		'tom',
		'trenderhoof',
		'trixie',
		'twilight sparkle',
		'twilight',
		'vinyl scratch',
		'written script',
		'zecora',
	],
}

;( async () => { try {

	server.get( '/robots.txt', async (req, res) => {
		res.end( 'User-agent: *\nDisallow: /' )
	})

	await server.get( '/api/watched.rss', async (req, res) => {
		// if ( req.query['key'] !== 'sikritkey' ) return;

		res.set('Content-Type', 'application/rss+xml')

		res.end(
			( await getPage( `https://derpibooru.org/images/watched.rss?key=${req.query.key}`, true ) )
			.replace(
				/(<item>\s+<title>)(.*?)(<\/title>(?:\n.*){3}Tagged: .*Tagged: )(.*?)(".*\<img .*)(https:\/\/derpicdn\.net\/img\/)(\d+\/\d+\/\d+\/)(\d+)\/\w+(\.\w+)(.*(?:\n.*){3}<pubDate>)(.*?)(<\/pubDate>)/ig,
				(_, misc1, title, misc2, taglist, misc3, prefix, path, id, ext, misc4, date, misc5) =>
					[
						misc1,
						'derpi_', id, '.json',
						misc2, taglist, misc3,
						'https://derpibooru.org/', id, '.json',
						misc4, date, misc5,
					].join('')
			)
		)
	})

	await server.get( '/images/watched.rss', async (req, res) => {
		res.set('Content-Type', 'application/rss+xml')

		res.end(
			( await getPage( `https://derpibooru.org/images/watched.rss?key=${req.query.key}`, true ) )
			//.replace( /(https:\/\/derpicdn\.net\/img\/\d+\/\d+\/\d+\/\d+\/)\w+(\.\w+)/ig, '$1full$2' )
			.replace(
				/(<item>\s+<title>)(.*?)(<\/title>(?:\n.*){3}Tagged: .*Tagged: )(.*?)(".*\<img .*)(https:\/\/derpicdn\.net\/img\/)(\d+\/\d+\/\d+\/)(\d+)\/\w+(\.\w+)(.*(?:\n.*){3}<pubDate>)(.*?)(<\/pubDate>)/ig,
				(_, misc1, title, misc2, taglist, misc3, prefix, path, id, ext, misc4, date, misc5) =>
					[
						misc1,
						'derpi_', id, ext,
						misc2, taglist, misc3,
						prefix, path, id, '/full', ext,
						misc4, date, misc5,
					].join('')
					/*[
						misc1,
						//path.match( /\d+$/ )[0], '__',
						id, '__', taglist
							.split(', ')
							.sort( (a, b) => {
								if ( xor( [a, b], e => tags.warning.includes(e) ) )
									return tags.warning.includes(a) ? -1 : 1

								if ( xor( [a, b], e => tags.rating.includes(e) ) )
									return tags.rating.includes(a) ? -1 : 1

								if ( xor( [a, b], e => !!(false
									||  /^artist:./i.test(e)
									|| tags.source.includes(e)
								)) )
									return !!(false
										||  /^artist:./i.test(a)
										|| tags.source.includes(a)
									) ? -1 : 1

								if ( xor( [a, b], e => tags.character.includes(e) ) )
									return tags.character.includes(a) ? -1 : 1

								if ( xor( [a, b], e => /^oc(:.|( only|)$)/i.test(e) ) )
									return /^oc(:.|( only|)$)/i.test(a) ? -1 : 1

								if ( xor( [a, b], e => !!(false
									|| /^(comic|fanfic|tumblr):./i.test(e)
									|| tags.fandom.includes(e)
								)) )
									return !!(false
										|| /^(comic|fanfic|tumblr):./i.test(a)
										|| tags.fandom.includes(a)
									) ? -1 : 1

								if ( xor( [a, b], e => tags.episode.includes(e) ) )
									return tags.episode.includes(a) ? -1 : 1

								if ( xor( [a, b], e => /^spoiler:./i.test(e) ) )
									return /^spoiler:./i.test(a) ? -1 : 1

								return [a, b].sort( intlSort )[0] === a ? -1 : 1
							}).map( s => s
								.replace( /-/g, '-dash-' )
								.replace( /\+/g, '-plus-' )
								.replace( / /g, '+' )
								.replace( /\./g, '-dot-' )
								.replace( /:/g, '-colon-' )
								.replace( /\//g, '-fwslash-' )
								.replace( /[$%&=?;@#]/g, m => encodeURIComponent(m) )
							).join('_')
							// .slice( 0, 138 )
							,
						'__', (new Date(Date.parse( date ))).toISOString().replace( /[:.]/g,'_'), ext,
						misc2, taglist, misc3,
						prefix, 'view/', path, id, ext,
						misc4, date, misc5,
					].join('')*/
			)
		)
	})

	server.listen( process.env.PORT, '0.0.0.0' )

} catch (e) {
	console.error(e)
} })()
