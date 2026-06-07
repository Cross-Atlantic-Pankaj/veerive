import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import SidebarMessage from '@/models/SidebarMessage';
import Theme from '@/models/Theme';
import Source from '@/models/Source';
import connectDB from '@/lib/db';
import tileTemplate from '@/models/TileTemplate';
import { registerModels } from '@/lib/registerModels';

export async function POST(request) {
	try {
		await connectDB();
		registerModels();

		const body = await request.json();
		const page = body.page || 1;
		
		// Get filter parameters
		const sector = body.sector;
		const subSector = body.subSector;
		const signalCategory = body.signalCategory;
		const signalSubCategory = body.signalSubCategory;

		// Build base filter (without date restriction) so that we compute dates
		// only from publishable contexts and applied facet filters
		const baseFilter = { doNotPublish: { $ne: true } };

		// Add filtering based on parameters (to the base filter)
		if (sector) {
			// Find sector by name and get its ObjectId
			const sectorDoc = await Sector.findOne({ sectorName: sector });
			if (sectorDoc) {
				baseFilter['sectors'] = { $in: [sectorDoc._id] };
			}
		}
		if (subSector) {
			// Find subSector by name and get its ObjectId
			const subSectorDoc = await SubSector.findOne({ subSectorName: subSector });
			if (subSectorDoc) {
				baseFilter['subSectors'] = { $in: [subSectorDoc._id] };
			}
		}
		if (signalCategory) {
			// Find signal category by name and get its ObjectId
			const signalDoc = await Signal.findOne({ signalName: signalCategory });
			if (signalDoc) {
				baseFilter['signalCategories'] = { $in: [signalDoc._id] };
			}
		}
		if (signalSubCategory) {
			// Find signal sub-category by name and get its ObjectId
			const subSignalDoc = await SubSignal.findOne({ subSignalName: signalSubCategory });
			if (subSignalDoc) {
				baseFilter['signalSubCategories'] = { $in: [subSignalDoc._id] };
			}
		}

		// Compute distinct dates only from documents that match the base filter
		const distinctDates = await mongoose.model('contexts').aggregate([
			{ $match: baseFilter },
			{
				$group: {
					_id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
					originalDate: { $first: '$date' },
				},
			},
			{ $sort: { originalDate: -1 } },
		]);


		if (page > distinctDates.length) {
			return NextResponse.json({
				contexts: [],
				messages: [],
				trendingThemes: [],
				expertPosts: [],
				hasMore: false,
				currentDate: null,
			});
		}

		const targetDate = distinctDates[page - 1];
		const startOfDay = new Date(targetDate.originalDate.setHours(0, 0, 0, 0));
		const endOfDay = new Date(
			targetDate.originalDate.setHours(23, 59, 59, 999)
		);

		// Final filter includes the date window
		const filterQuery = {
			...baseFilter,
			date: {
				$gte: startOfDay,
				$lte: endOfDay,
			},
		};

		const [
			contextsResult,
			sidebarMessagesResult,
			trendingThemes,
			expertPostsResult,
		] = await Promise.all([
			mongoose.model('contexts').find(filterQuery)
				.sort({ date: -1 })
				.populate('sectors', 'sectorName')
				.populate('subSectors', 'subSectorName')
				.populate('signalCategories', 'signalName')
				.populate('signalSubCategories', 'subSignalName')
				.populate({
					path: 'posts.postId',
					select: 'postTitle postType date summary',
				})
        .populate({
				path: 'tileTemplates',
				model: 'TileTemplate',
				select: 'name type jsxCode',
				options: { strictPopulate: false },
			})
				.exec(),

			SidebarMessage.find({ isActive: true })
				.sort({ createdAt: -1 })
				.limit(1)
				.exec(),

			Theme.find({ isTrending: true, doNotPublish: { $ne: true } })
				.sort({ overallScore: -1 })
				.limit(5)
				.populate('sectors', 'sectorName')
				.populate('subSectors', 'subSectorName')
				.exec(),

			Post.find({ postType: 'Expert Opinion', doNotPublish: { $ne: true } })
				.sort({ date: -1 })
				.limit(7)
				.populate('source', 'sourceName')
				.populate('contexts', 'subSectors')
				.select('postTitle date sourceUrl sourceUrls _id contexts')
				.exec(),
		]);

		const seenIds = new Set();
		const uniqueContexts = contextsResult.filter((context) => {
			const idString = context._id.toString();
			if (seenIds.has(idString)) return false;
			seenIds.add(idString);
			return true;
		});


		const processedContexts = uniqueContexts.map((context) => {
			const uniquePosts = [];
			const seenPostIds = new Set();
			context.posts.forEach((p) => {
				if (p.postId && !seenPostIds.has(p.postId._id.toString())) {
					seenPostIds.add(p.postId._id.toString());
					uniquePosts.push({
						postTitle: p.postId.postTitle,
						postType: p.postId.postType,
						date: p.postId.date,
						summary: p.postId.summary,
					});
				}
			});

			return {
				id: context._id,
				containerType: context.containerType,
				contextTitle: context.contextTitle,
				sectors: context.sectors.map((s) => s.sectorName),
				subSectors: context.subSectors.map((s) => s.subSectorName),
				originalContextSector: context.sectors.map((s) => s.sectorName),
				originalContextSubSector: context.subSectors.map((s) => s.subSectorName),
				originalContextSignalCategory: context.signalCategories ? context.signalCategories.map((s) => s.signalName) : [],
				originalContextSignalSubCategory: context.signalSubCategories ? context.signalSubCategories.map((s) => s.subSignalName) : [],
				bannerImage: context.bannerImage,
				imageUrl: context.imageUrl,
				summary: context.summary,
				dataForTypeNum: context.dataForTypeNum,
				posts: uniquePosts,
				displayOrder: context.displayOrder,
        tileTemplates: context.tileTemplates.map((tile) => ({
          _id: tile._id,
          name: tile.name,
          type: tile.type,
          jsxCode: tile.jsxCode,
        })),
			};
		});

		const processedThemes = trendingThemes.map((theme) => ({
			id: theme._id,
			title: theme.themeTitle,
			score: theme.overallScore,
			description: theme.themeDescription,
			imageUrl: theme.imageUrl,
			sectors: theme.sectors.map((s) => s.sectorName),
			subSectors: theme.subSectors.map((s) => ({
				_id: s._id,
				subSectorName: s.subSectorName
			})),
		}));

		// Get all unique sub-sector IDs from expert posts' contexts
		const allSubSectorIds = new Set();
		expertPostsResult.forEach((post) => {
			if (post.contexts && post.contexts.length > 0) {
				post.contexts.forEach((context) => {
					if (context.subSectors && context.subSectors.length > 0) {
						context.subSectors.forEach((subSectorId) => {
							allSubSectorIds.add(subSectorId);
						});
					}
				});
			}
		});

		// Fetch all sub-sectors in one query
		const subSectorsMap = new Map();
		if (allSubSectorIds.size > 0) {
			const subSectors = await SubSector.find({
				_id: { $in: Array.from(allSubSectorIds) }
			}).select('_id subSectorName');
			
			subSectors.forEach((subSector) => {
				subSectorsMap.set(subSector._id.toString(), subSector.subSectorName);
			});
		}

		const expertPosts = expertPostsResult.map((post) => {
			let effectiveSourceUrl = post.sourceUrl;
			if (!effectiveSourceUrl && post.sourceUrls) {
				effectiveSourceUrl = Array.isArray(post.sourceUrls)
					? post.sourceUrls[0]
					: post.sourceUrls;
			}

			// Extract sub-sectors from the post's contexts
			const postSubSectors = new Set();
			if (post.contexts && post.contexts.length > 0) {
				post.contexts.forEach((context) => {
					if (context.subSectors && context.subSectors.length > 0) {
						context.subSectors.forEach((subSectorId) => {
							const subSectorName = subSectorsMap.get(subSectorId.toString());
							if (subSectorName) {
								postSubSectors.add(subSectorName);
							}
						});
					}
				});
			}

			return {
				_id: post._id,
				postTitle: post.postTitle,
				date: post.date,
				SourceUrl: effectiveSourceUrl || '',
				subSectors: Array.from(postSubSectors),
			};
		});

		return NextResponse.json({
			contexts: processedContexts,
			messages: sidebarMessagesResult,
			trendingThemes: processedThemes,
			expertPosts,
			hasMore: page < distinctDates.length,
			currentDate: targetDate._id,
		});
	} catch (error) {
		console.error('Error fetching Pulse Today data:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error', details: error.message },
			{ status: 500 }
		);
	}
}
