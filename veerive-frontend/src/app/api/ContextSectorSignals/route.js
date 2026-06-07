import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import Context from '@/models/Context';
import Post from '@/models/Post';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    // Step 1: Find all posts and their associated context IDs
    const posts = await Post.find({}).select('contexts').lean();
    const contextIdsWithPosts = [
      ...new Set(
        posts
          .filter(post => Array.isArray(post.contexts) && post.contexts.length > 0)
          .flatMap(post => post.contexts.map(id => id.toString()))
      ),
    ];

    if (contextIdsWithPosts.length === 0) {
      console.log('No posts with contexts found.');
      return NextResponse.json(
        {
          success: true,
          data: {
            sectors: [],
            signals: [],
          },
        },
        { status: 200 }
      );
    }

    // Validate context IDs
    const validContextIds = contextIdsWithPosts.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validContextIds.length === 0) {
      console.log('No valid context IDs found.');
      return NextResponse.json(
        {
          success: true,
          data: {
            sectors: [],
            signals: [],
          },
        },
        { status: 200 }
      );
    }

    // Step 2: Find contexts that have posts and their associated sectors and subsectors
    const contexts = await Context.find({ _id: { $in: validContextIds.map(id => new mongoose.Types.ObjectId(id)) } })
      .select('sectors subSectors signalCategories signalSubCategories')
      .lean();

    const sectorIds = [
      ...new Set(
        contexts
          .filter(context => Array.isArray(context.sectors))
          .flatMap(context => context.sectors.map(id => id.toString()))
      ),
    ].filter(id => mongoose.Types.ObjectId.isValid(id));

    const subSectorIds = [
      ...new Set(
        contexts
          .filter(context => Array.isArray(context.subSectors))
          .flatMap(context => context.subSectors.map(id => id.toString()))
      ),
    ].filter(id => mongoose.Types.ObjectId.isValid(id));

    const signalIds = [
      ...new Set(
        contexts
          .filter(context => Array.isArray(context.signalCategories))
          .flatMap(context => context.signalCategories.map(id => id.toString()))
      ),
    ].filter(id => mongoose.Types.ObjectId.isValid(id));

    const subSignalIds = [
      ...new Set(
        contexts
          .filter(context => Array.isArray(context.signalSubCategories))
          .flatMap(context => context.signalSubCategories.map(id => id.toString()))
      ),
    ].filter(id => mongoose.Types.ObjectId.isValid(id));

    if (sectorIds.length === 0 && subSectorIds.length === 0 && signalIds.length === 0 && subSignalIds.length === 0) {
      console.log('No valid sector, subsector, signal, or subsignal IDs found.');
      return NextResponse.json(
        {
          success: true,
          data: {
            sectors: [],
            signals: [],
          },
        },
        { status: 200 }
      );
    }

    // Step 3: Aggregate sectors with subsectors that have posts
    const sectorsWithDetails = await Sector.aggregate([
      {
        $match: {
          _id: { $in: sectorIds.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $lookup: {
          from: 'subsectors',
          localField: '_id',
          foreignField: 'sectorId',
          as: 'subsectors',
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: '_id',
          foreignField: 'sectors',
          as: 'contexts',
        },
      },
      {
        $unwind: {
          path: '$contexts',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'contexts._id': { $in: validContextIds.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'contexts._id',
          foreignField: 'contexts',
          as: 'contextPosts',
        },
      },
      {
        $group: {
          _id: '$_id',
          sectorName: { $first: '$sectorName' },
          subsectors: { $first: '$subsectors' },
          totalPostCount: {
            $sum: { $size: { $ifNull: ['$contextPosts', []] } },
          },
        },
      },
      {
        $match: {
          totalPostCount: { $gt: 0 },
        },
      },
      {
        $unwind: {
          path: '$subsectors',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: 'subsectors._id',
          foreignField: 'subSectors',
          as: 'subsectors.contexts',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'subsectors.contexts._id',
          foreignField: 'contexts',
          as: 'subsectors.posts',
        },
      },
      {
        $group: {
          _id: '$_id',
          sectorName: { $first: '$sectorName' },
          totalPostCount: { $first: '$totalPostCount' },
          subsectors: {
            $push: {
              _id: '$subsectors._id',
              subSectorName: '$subsectors.subSectorName',
              postCount: { $size: { $ifNull: ['$subsectors.posts', []] } },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          sectorName: 1,
          totalPostCount: 1,
          subsectors: {
            $filter: {
              input: '$subsectors',
              as: 'subsector',
              cond: { $gt: ['$$subsector.postCount', 0] },
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { totalPostCount: { $gt: 0 } },
            { 'subsectors.0': { $exists: true } },
          ],
        },
      },
      {
        $sort: {
          totalPostCount: -1,
        },
      },
      {
        $project: {
          _id: 1,
          sectorName: 1,
          totalPostCount: 1,
          subsectors: {
            $cond: {
              if: { $eq: ['$subsectors', []] },
              then: [],
              else: {
                $sortArray: {
                  input: '$subsectors',
                  sortBy: { postCount: -1 },
                },
              },
            },
          },
        },
      },
    ]);

    // Step 4: Aggregate signals with subsignals that have posts
    const signalsWithDetails = await Signal.aggregate([
      {
        $match: {
          _id: { $in: signalIds.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $lookup: {
          from: 'subsignals',
          localField: '_id',
          foreignField: 'signalId',
          as: 'subsignals',
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: '_id',
          foreignField: 'signalCategories',
          as: 'contexts',
        },
      },
      {
        $unwind: {
          path: '$contexts',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          'contexts._id': { $in: validContextIds.map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'contexts._id',
          foreignField: 'contexts',
          as: 'contextPosts',
        },
      },
      {
        $group: {
          _id: '$_id',
          signalName: { $first: '$signalName' },
          subsignals: { $first: '$subsignals' },
          totalPostCount: {
            $sum: { $size: { $ifNull: ['$contextPosts', []] } },
          },
        },
      },
      {
        $match: {
          totalPostCount: { $gt: 0 },
        },
      },
      {
        $unwind: {
          path: '$subsignals',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: 'subsignals._id',
          foreignField: 'signalSubCategories',
          as: 'subsignals.contexts',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'subsignals.contexts._id',
          foreignField: 'contexts',
          as: 'subsignals.posts',
        },
      },
      {
        $group: {
          _id: '$_id',
          signalName: { $first: '$signalName' },
          totalPostCount: { $first: '$totalPostCount' },
          subsignals: {
            $push: {
              _id: '$subsignals._id',
              subSignalName: '$subsignals.subSignalName',
              postCount: { $size: { $ifNull: ['$subsignals.posts', []] } },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          signalName: 1,
          totalPostCount: 1,
          subsignals: {
            $filter: {
              input: '$subsignals',
              as: 'subsignal',
              cond: { $gt: ['$$subsignal.postCount', 0] },
            },
          },
        },
      },
      {
        $match: {
          $or: [
            { totalPostCount: { $gt: 0 } },
            { 'subsignals.0': { $exists: true } },
          ],
        },
      },
      {
        $sort: {
          totalPostCount: -1,
        },
      },
      {
        $project: {
          _id: 1,
          signalName: 1,
          totalPostCount: 1,
          subsignals: {
            $cond: {
              if: { $eq: ['$subsignals', []] },
              then: [],
              else: {
                $sortArray: {
                  input: '$subsignals',
                  sortBy: { postCount: -1 },
                },
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          sectors: sectorsWithDetails,
          signals: signalsWithDetails,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in /api/ContextSectorSignals:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}