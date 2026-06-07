import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Source from '@/models/Source';
import Theme from '@/models/Theme';
import tileTemplate from '@/models/TileTemplate';
import { registerModels } from '@/lib/registerModels';

// Simple in-memory cache for home data
let homeCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
	// Check cache first
	const now = Date.now();
	if (homeCache && (now - cacheTimestamp) < CACHE_DURATION) {
		return new Response(
			JSON.stringify(homeCache),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=300',
					'X-Cache': 'HIT'
				},
			}
		);
	}

	// Set timeout for the entire operation
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error('Request timeout')), 25000); // 25 second timeout
	});

	try {
		const apiPromise = (async () => {
			await connectDB();

		// Register models if not already registered
		registerModels();

		// Run all queries in parallel to reduce total execution time
		const [
			trendingEvents,
			trendingOpinions,
			marketStatistics,
			trendingThemes,
			featuredTheme,
			featuredEvent,
			featuredOpinion,
			featuredInfographic
		] = await Promise.all([
			// Trending Events - optimized with select and lean
			Context.find({ isTrending: true, doNotPublish: { $ne: true } })
				.select('contextTitle summary imageUrl date sectors subSectors tileTemplates')
				.populate('sectors', 'sectorName')
				.populate('subSectors', 'subSectorName')
				.populate('tileTemplates', 'name type jsxCode')
				.sort({ date: -1 })
				.limit(5)
				.lean(),

			// Trending Opinions - optimized with select and lean
			Post.find({
				postType: 'Expert Opinion',
				isTrending: true,
				doNotPublish: { $ne: true }
			})
				.select('postTitle summary imageUrl date source tileTemplateId')
				.populate('source', 'sourceName')
				.populate('tileTemplateId', 'name type jsxCode')
				.sort({ date: -1 })
				.limit(3)
				.lean(),

			// Market Statistics - optimized with select and lean
			Post.find({
				postType: 'Infographic',
				isTrending: true,
				doNotPublish: { $ne: true }
			})
				.select('postTitle summary imageUrl date source tileTemplateId')
				.populate('source', 'sourceName')
				.populate('tileTemplateId', 'name type jsxCode')
				.sort({ date: -1 })
				.limit(3)
				.lean(),

			// Trending Themes - optimized with select and lean
			Theme.find({ doNotPublish: { $ne: true } })
				.select('themeTitle themeDescription summary imageUrl overallScore sectors subSectors tileTemplateId')
				.populate('sectors', 'sectorName')
				.populate('subSectors', 'subSectorName')
				.populate('tileTemplateId', 'name type jsxCode')
				.sort({ overallScore: -1 })
				.limit(3)
				.lean(),

			// Featured items - simplified queries with select
			Theme.findOne({ doNotPublish: { $ne: true } })
				.select('themeTitle themeDescription summary imageUrl overallScore')
				.sort({ overallScore: -1 })
				.lean(),
			Context.findOne({ displayOrder: 1, doNotPublish: { $ne: true } })
				.select('contextTitle summary imageUrl date')
				.sort({ date: -1 })
				.lean(),
			Post.findOne({
				postType: 'Expert Opinion',
				homePageShow: true,
				doNotPublish: { $ne: true }
			})
				.select('postTitle summary imageUrl date source')
				.sort({ date: -1 })
				.populate('source', 'sourceName')
				.lean(),
			Post.findOne({
				postType: 'Infographic',
				homePageShow: true,
				doNotPublish: { $ne: true }
			})
				.select('postTitle summary imageUrl date source')
				.sort({ date: -1 })
				.populate('source', 'sourceName')
				.lean()
		]);

		const Trendurl = (text) => {
			return text
				.toString()
				.toLowerCase()
				.trim()
				.replace(/\s+/g, '-')
				.replace(/[^\w-]+/g, '')
				.replace(/--+/g, '-')
				.replace(/^-+|-+$/g, '');
		};

		const normalizeTitle = (text) => {
			return text
				.toString()
				.toLowerCase()
				.trim()
				.replace(/\$/g, 'dollar')
				.replace(/[^\w\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/--+/g, '-')
				.replace(/^-+|-+$/g, '');
		};

		const getPostRedirectUrl = (post) => {
			if (post && post.sourceUrl) {
				return post.sourceUrl;
			}
			if (
				post &&
				Array.isArray(post.sourceUrls) &&
				post.sourceUrls.length > 0
			) {
				return post.sourceUrls[0];
			}
			return `/influencer-comment/${post?.postType==='Expert Opinion' ? 'expert-opinion' : '' || post?.postType==='Infographic' ? 'market-statistics' : ''}`;
		};

		const slides = {
			slide1: {
				title: 'Featured Trend',
				themeTitle: featuredTheme ? featuredTheme.themeTitle : 'N/A',
				themeDescription: featuredTheme
					? featuredTheme.themeDescription
					: 'N/A',
				redirectUrl: `/analyzer/theme-details/${Trendurl(
					featuredTheme?.themeTitle || 'N/A'
				)}`,
			},
			slide2: {
				title: 'Featured Event',
				contextTitle: featuredEvent ? featuredEvent.contextTitle : 'N/A',
				summary: featuredEvent ? featuredEvent.summary : 'N/A',
				redirectUrl: `/context-details/${normalizeTitle(
					featuredEvent?.contextTitle || 'N/A'
				)}`,
			},
			slide3: {
				title: 'Featured Opinion',
				postTitle: featuredOpinion ? featuredOpinion.postTitle : 'N/A',
				postSummary: featuredOpinion ? featuredOpinion.summary : 'N/A',
				redirectUrl: getPostRedirectUrl(featuredOpinion),
			},
			slide4: {
				title: 'Featured Infographic',
				postTitle: featuredInfographic ? featuredInfographic.postTitle : 'N/A',
				postSummary: featuredInfographic ? featuredInfographic.summary : 'N/A',
				redirectUrl: getPostRedirectUrl(featuredInfographic),
			},
		};

			// Prepare response data with minimal processing
			const responseData = {
				trendingEvents: trendingEvents || [],
				trendingOpinions: trendingOpinions || [],
				marketStatistics: marketStatistics || [],
				trendingThemes: trendingThemes || [],
				slides: slides || {},
			};

			// Cache the response
			homeCache = responseData;
			cacheTimestamp = Date.now();

			return new Response(
				JSON.stringify(responseData),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
						'X-Cache': 'MISS'
					},
				}
			);
		})();

		// Race between API call and timeout
		return await Promise.race([apiPromise, timeoutPromise]);

	} catch (error) {
		console.error('Error in API:', error);
		
		// Return a minimal response on error to prevent complete failure
		return new Response(
			JSON.stringify({
				trendingEvents: [],
				trendingOpinions: [],
				marketStatistics: [],
				trendingThemes: [],
				slides: {},
				error: process.env.NODE_ENV === 'development' ? error.message : 'Service temporarily unavailable'
			}),
			{
				status: error.message === 'Request timeout' ? 504 : 500,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache',
				},
			}
		);
	}
}
