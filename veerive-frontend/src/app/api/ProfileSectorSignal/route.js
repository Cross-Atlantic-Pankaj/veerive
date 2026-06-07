import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import User from '@/models/User';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Theme from '@/models/Theme';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const savedPosts = Array.isArray(user.savedPosts) ? user.savedPosts : [];

    const sectorIds = new Set();
    const subSectorIds = new Set();
    const signalIds = new Set();
    const subSignalIds = new Set();

    const contextIds = savedPosts
      .filter((item) => item && item.SavedpostType && item.SavedpostType === 'Context' && item.SavedpostId)
      .map((item) => item.SavedpostId);

    if (contextIds.length > 0) {
      const contexts = await Context.find({
        _id: { $in: contextIds },
      }).lean();

      contexts.forEach((context) => {
        if (context && context.sectors) {
          context.sectors.forEach((id) => {
            if (id) sectorIds.add(id.toString());
          });
        }
        if (context && context.subSectors) {
          context.subSectors.forEach((id) => {
            if (id) subSectorIds.add(id.toString());
          });
        }
        if (context && context.signalCategories) {
          context.signalCategories.forEach((id) => {
            if (id) signalIds.add(id.toString());
          });
        }
        if (context && context.signalSubCategories) {
          context.signalSubCategories.forEach((id) => {
            if (id) subSignalIds.add(id.toString());
          });
        }
      });
    }

    const postIds = savedPosts
      .filter((item) => item && item.SavedpostType && item.SavedpostType === 'Post' && item.SavedpostId)
      .map((item) => item.SavedpostId);

    if (postIds.length > 0) {
      const posts = await Post.find({
        _id: { $in: postIds },
      }).lean();

      const postContextIds = posts
        .flatMap((post) => post.contexts || [])
        .map((id) => id.toString());

      if (postContextIds.length > 0) {
        const postContexts = await Context.find({
          _id: { $in: postContextIds },
        }).lean();

        postContexts.forEach((context) => {
          if (context && context.sectors) {
            context.sectors.forEach((id) => {
              if (id) sectorIds.add(id.toString());
            });
          }
          if (context && context.subSectors) {
            context.subSectors.forEach((id) => {
              if (id) subSectorIds.add(id.toString());
            });
          }
          if (context && context.signalCategories) {
            context.signalCategories.forEach((id) => {
              if (id) signalIds.add(id.toString());
            });
          }
          if (context && context.signalSubCategories) {
            context.signalSubCategories.forEach((id) => {
              if (id) subSignalIds.add(id.toString());
            });
          }
        });
      }
    }

    const themeIds = savedPosts
      .filter((item) => item && item.SavedpostType && item.SavedpostType === 'Theme' && item.SavedpostId)
      .map((item) => item.SavedpostId);

    if (themeIds.length > 0) {
      const themes = await Theme.find({
        _id: { $in: themeIds },
      }).lean();

      themes.forEach((theme) => {
        if (theme && theme.sectors) {
          theme.sectors.forEach((id) => {
            if (id) sectorIds.add(id.toString());
          });
        }
        if (theme && theme.subSectors) {
          theme.subSectors.forEach((id) => {
            if (id) subSectorIds.add(id.toString());
          });
        }
      });
    }

    if (
      sectorIds.size === 0 &&
      subSectorIds.size === 0 &&
      signalIds.size === 0 &&
      subSignalIds.size === 0
    ) {
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

    const sectorsWithSubsectors = await Sector.aggregate([
      {
        $match: {
          _id: { $in: Array.from(sectorIds).map((id) => new mongoose.Types.ObjectId(id)) },
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
        $unwind: {
          path: '$subsectors',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { 'subsectors._id': { $in: Array.from(subSectorIds).map((id) => new mongoose.Types.ObjectId(id)) } },
            { subsectors: { $exists: false } },
          ],
        },
      },
      {
        $group: {
          _id: '$_id',
          sectorName: { $first: '$sectorName' },
          subsectors: { $push: '$subsectors' },
        },
      },
      {
        $project: {
          _id: 1,
          sectorName: 1,
          subsectors: {
            $cond: {
              if: { $eq: ['$subsectors', [{}] ] },
              then: [],
              else: {
                $filter: {
                  input: '$subsectors',
                  as: 'subsector',
                  cond: { $ne: ['$$subsector', {}] },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          sectorName: 1,
          subsectors: {
            $map: {
              input: '$subsectors',
              as: 'subsector',
              in: {
                _id: '$$subsector._id',
                subSectorName: '$$subsector.subSectorName',
              },
            },
          },
        },
      },
    ]);

    sectorsWithSubsectors.sort((a, b) => a.sectorName.localeCompare(b.sectorName));
    sectorsWithSubsectors.forEach((sector) => {
      sector.subsectors.sort((a, b) => a.subSectorName.localeCompare(b.subSectorName));
    });

    const signalsWithSubsignals = await Signal.aggregate([
      {
        $match: {
          _id: { $in: Array.from(signalIds).map((id) => new mongoose.Types.ObjectId(id)) },
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
        $unwind: {
          path: '$subsignals',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { 'subsignals._id': { $in: Array.from(subSignalIds).map((id) => new mongoose.Types.ObjectId(id)) } },
            { subsignals: { $exists: false } },
          ],
        },
      },
      {
        $group: {
          _id: '$_id',
          signalName: { $first: '$signalName' },
          subsignals: { $push: '$subsignals' },
        },
      },
      {
        $project: {
          _id: 1,
          signalName: 1,
          subsignals: {
            $cond: {
              if: { $eq: ['$subsignals', [{}] ] },
              then: [],
              else: {
                $filter: {
                  input: '$subsignals',
                  as: 'subsignal',
                  cond: { $ne: ['$$subsignal', {}] },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          signalName: 1,
          subsignals: {
            $map: {
              input: '$subsignals',
              as: 'subsignal',
              in: {
                _id: '$$subsignal._id',
                subSignalName: '$$subsignal.subSignalName',
              },
            },
          },
        },
      },
    ]);

    signalsWithSubsignals.sort((a, b) => a.signalName.localeCompare(b.signalName));
    signalsWithSubsignals.forEach((signal) => {
      signal.subsignals.sort((a, b) => a.subSignalName.localeCompare(b.subSignalName));
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          sectors: sectorsWithSubsectors,
          signals: signalsWithSubsignals,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching sectors, subsectors, signals, and subsignals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}