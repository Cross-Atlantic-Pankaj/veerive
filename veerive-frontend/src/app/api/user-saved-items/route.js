import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Source from '@/models/Source';
import tileTemplate from '@/models/TileTemplate';

export async function POST(request) {
	try {
		await connectDB();

		const { email } = await request.json();
		const { searchParams } = new URL(request.url);
		const sectorId = searchParams.get('sectorId');
		const subsectorId = searchParams.get('subsectorId');
		const signalId = searchParams.get('signalId');
		const subsignalId = searchParams.get('subsignalId');

		if (!email) {
			return NextResponse.json({ error: 'Email is required' }, { status: 401 });
		}

		const user = await User.findOne({ email }).lean();
		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		let sectorObjectId, subsectorObjectId, signalObjectId, subsignalObjectId;
		try {
			if (sectorId && mongoose.Types.ObjectId.isValid(sectorId)) {
				sectorObjectId = new mongoose.Types.ObjectId(sectorId);
			}
			if (subsectorId && mongoose.Types.ObjectId.isValid(subsectorId)) {
				subsectorObjectId = new mongoose.Types.ObjectId(subsectorId);
			}
			if (signalId && mongoose.Types.ObjectId.isValid(signalId)) {
				signalObjectId = new mongoose.Types.ObjectId(signalId);
			}
			if (subsignalId && mongoose.Types.ObjectId.isValid(subsignalId)) {
				subsignalObjectId = new mongoose.Types.ObjectId(subsignalId);
			}
		} catch (error) {
			console.error('Error converting ObjectId:', error.message);
			return NextResponse.json(
				{
					success: false,
					error:
						'Invalid sectorId, subsectorId, signalId, or subsignalId format',
				},
				{ status: 400 }
			);
		}

		if (
			(sectorObjectId || subsectorObjectId) &&
			(signalObjectId || subsignalObjectId)
		) {
			return NextResponse.json(
				{
					success: false,
					error: 'Cannot filter by both sector and signal simultaneously',
				},
				{ status: 400 }
			);
		}

		let contextMatch = {};
		if (subsectorObjectId) {
			const matchingContexts = await Context.find({
				subSectors: subsectorObjectId,
			}).select('_id');
			if (matchingContexts.length > 0) {
				contextMatch = { $in: matchingContexts.map((ctx) => ctx._id) };
			} else {
				contextMatch = { $in: [] };
			}
		} else if (sectorObjectId) {
			const matchingContexts = await Context.find({
				sectors: sectorObjectId,
			}).select('_id');
			if (matchingContexts.length > 0) {
				contextMatch = { $in: matchingContexts.map((ctx) => ctx._id) };
			} else {
				contextMatch = { $in: [] };
			}
		} else if (subsignalObjectId) {
			const matchingContexts = await Context.find({
				signalSubCategories: subsignalObjectId,
			}).select('_id');
			if (matchingContexts.length > 0) {
				contextMatch = { $in: matchingContexts.map((ctx) => ctx._id) };
			} else {
				contextMatch = { $in: [] };
			}
		} else if (signalObjectId) {
			const matchingContexts = await Context.find({
				signalCategories: signalObjectId,
			}).select('_id');
			if (matchingContexts.length > 0) {
				contextMatch = { $in: matchingContexts.map((ctx) => ctx._id) };
			} else {
				contextMatch = { $in: [] };
			}
		}

		const savedItems = {
			contexts: [],
			posts: [],
			themes: [],
		};

		const savedPosts = Array.isArray(user.savedPosts) ? user.savedPosts : [];

		for (const savedPost of savedPosts) {
			if (!savedPost || !savedPost.SavedpostId) {
				console.warn('Invalid savedPost object:', savedPost);
				continue;
			}
			
			const savedPostId = savedPost.SavedpostId;
			if (!mongoose.Types.ObjectId.isValid(savedPostId)) {
				console.warn(`Invalid SavedpostId: ${savedPostId}`);
				continue;
			}

			if (savedPost.SavedpostType && savedPost.SavedpostType === 'Context') {
				let query = { _id: savedPostId };
				if (sectorObjectId) query.sectors = sectorObjectId;
				if (subsectorObjectId) query.subSectors = subsectorObjectId;
				if (signalObjectId) query.signalCategories = signalObjectId;
				if (subsignalObjectId) query.signalSubCategories = subsignalObjectId;

				const context = await Context.findOne(query)
					.select('contextTitle summary containerType posts date')
					.populate({
						path: 'sectors',
						model: 'Sector',
						select: 'sectorName',
					})
					.populate({
						path: 'subSectors',
						model: 'SubSector',
						select: 'subSectorName',
					})
					.populate({
						path: 'posts.postId',
						model: 'Post',
						select: 'postTitle postType summary sourceUrl',
					})
					.populate({
						path: 'tileTemplates',
						model: 'TileTemplate',
						select: 'name type jsxCode',
						options: { strictPopulate: false },
					})
					.lean();

				if (context) {
					savedItems.contexts.push({
						_id: context._id,
						contextTitle: context.contextTitle,
						summary: context.summary,
						containerType: context.containerType,
						sectorNames: (context.sectors || []).map((sector) => sector?.sectorName || 'Unknown Sector'),
						subSectorNames: (context.subSectors || []).map(
							(subSector) => subSector?.subSectorName || 'Unknown SubSector'
						),
						posts: (context.posts || []).map((post) => ({
							postId: post.postId?._id,
							postTitle: post.postId?.postTitle || 'Unknown Post',
							postType: post.postId?.postType || 'Unknown',
							summary: post.postId?.summary || '',
							sourceUrl: post.postId?.sourceUrl || '',
						})).filter(post => post.postId),
						date: context.date,
						savedAt: savedPost.savedAt,
						tileTemplates: context.tileTemplates || null,
					});
				}
			} else if (savedPost.SavedpostType && savedPost.SavedpostType === 'Post') {
				let postQuery = { _id: savedPostId };
				if (Object.keys(contextMatch).length > 0) {
					postQuery.contexts = contextMatch;
				}

				const post = await Post.findOne(postQuery)
					.select(
						'postTitle postType summary sourceUrl sourceUrls contexts date'
					)
					.populate({
						path: 'source',
						model: 'Source',
						select: 'sourceName',
					})
					.populate({
						path: 'contexts',
						model: 'Context',
						select: 'sectors',
						populate: {
							path: 'sectors',
							model: 'Sector',
							select: 'sectorName',
						},
					})
					.lean();
				if (post) {
					const sourceUrl =
						post.sourceUrl ||
						(Array.isArray(post.sourceUrls) && post.sourceUrls[0]) ||
						'';
					const sectorNames = Array.from(
						new Set(
							(post.contexts || [])
								.flatMap((context) => context?.sectors || [])
								.map((sector) => sector?.sectorName || 'Unknown Sector')
						)
					);
					savedItems.posts.push({
						_id: post._id,
						postTitle: post.postTitle,
						postType: post.postType,
						summary: post.summary,
						sourceName: post.source?.sourceName || 'Unknown Source',
						sourceUrl,
						sectorNames,
						date: post.date,
						savedAt: savedPost.savedAt,
					});
				}
			} else if (savedPost.SavedpostType && savedPost.SavedpostType === 'Theme') {
				if (signalObjectId || subsignalObjectId) {
					continue;
				}

				let themeQuery = { _id: savedPostId };
				if (sectorObjectId) themeQuery.sectors = sectorObjectId;
				if (subsectorObjectId) themeQuery.subSectors = subsectorObjectId;

				const theme = await Theme.findOne(themeQuery)
					.select(
						'themeTitle themeDescription trendingScore impactScore predictiveMomentumScore date'
					)
					.populate({
						path: 'sectors',
						model: 'Sector',
						select: 'sectorName',
					})
					.populate({
						path: 'subSectors',
						model: 'SubSector',
						select: 'subSectorName',
					})
					.populate({
						path: 'tileTemplateId',
						model: 'TileTemplate',
						select: 'name type jsxCode',
						options: { strictPopulate: false },
					})
					.lean();
          
				if (theme) {
					savedItems.themes.push({
						_id: theme._id,
						themeTitle: theme.themeTitle,
						themeDescription: theme.themeDescription,
						trendingScore: theme.trendingScore || 0,
						impactScore: theme.impactScore || 0,
						predictiveMomentumScore: theme.predictiveMomentumScore || 0,
						sectorNames: (theme.sectors || []).map((sector) => sector?.sectorName || 'Unknown Sector'),
						subSectorNames: (theme.subSectors || []).map(
							(subSector) => subSector?.subSectorName || 'Unknown SubSector'
						),
						date: theme.date || theme.createdAt,
						savedAt: savedPost.savedAt,
						tileTemplates: theme.tileTemplateId || null,
					});
				}
			}
		}

		return NextResponse.json({ savedItems }, { status: 200 });
	} catch (error) {
		console.error('Error fetching saved items:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error', details: error.message },
			{ status: 500 }
		);
	}
}
