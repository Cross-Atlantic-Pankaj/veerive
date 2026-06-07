import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import tileTemplate from '@/models/TileTemplate';

let cachedSectors = null;
let cachedSubsectors = null;

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const sectorId = searchParams.get('sectorId');
    const subSectorId = searchParams.get('subSectorId');

    // Models are already registered when imported, no need to re-register

    const filter = { doNotPublish: { $ne: true } }; // Filter out themes where doNotPublish is true

    if (sectorId && mongoose.Types.ObjectId.isValid(sectorId)) {
      filter.sectors = { $in: [new mongoose.Types.ObjectId(sectorId)] };
    }

    if (subSectorId && mongoose.Types.ObjectId.isValid(subSectorId)) {
      const subSector = await SubSector.findById(subSectorId).select('sectorId');
      if (subSector && subSector.sectorId) {
        filter.$and = [
          { subSectors: { $in: [new mongoose.Types.ObjectId(subSectorId)] } },
          { sectors: { $in: [subSector.sectorId] } }
        ];
      } else {
        filter.subSectors = { $in: [new mongoose.Types.ObjectId(subSectorId)] };
      }
    }

    const aggregation = [
      { $match: filter },
      { $sort: { overallScore: -1, _id: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const themes = await Theme.aggregate(aggregation);

    const uniqueThemes = [...new Set(themes.filter(t => t && t._id).map(t => t._id.toString()))].map(id => themes.find(t => t && t._id && t._id.toString() === id)).filter(Boolean);

    const totalThemes = await Theme.countDocuments(filter);

    const populatedThemes = await Theme.populate(uniqueThemes, [
      { path: 'sectors', select: 'sectorName' },
      { path: 'subSectors', select: 'subSectorName' },
      { path: 'tileTemplateId', select: 'name type jsxCode', options: { strictPopulate: false } },
    ]);

    let sectors, subsectors;
    if (cachedSectors && cachedSubsectors) {
      sectors = cachedSectors;
      subsectors = cachedSubsectors;
    } else {
      sectors = await Sector.find({}).select('sectorName').sort({ sectorName: 1 }).lean();
      subsectors = await SubSector.find({}).select('subSectorName sectorId').sort({ subSectorName: 1 }).lean();
      cachedSectors = sectors;
      cachedSubsectors = subsectors;
    }

    const sectorsInThemes = new Set();
    const subSectorsInThemes = new Set();

    populatedThemes.forEach((theme) => {
      if (theme.sectors && Array.isArray(theme.sectors)) {
        theme.sectors.forEach((sector) => {
          if (sector && sector._id) {
            sectorsInThemes.add(sector._id.toString());
          }
        });
      }
      if (theme.subSectors && Array.isArray(theme.subSectors)) {
        theme.subSectors.forEach((subSector) => {
          if (subSector && subSector._id) {
            subSectorsInThemes.add(subSector._id.toString());
          }
        });
      }
    });

    const filteredSectors = (sectors || [])
      .filter((sector) => sector && sector._id && sectorsInThemes.has(sector._id.toString()))
      .map((sector) => {
        const relatedSubsectors = (subsectors || [])
          .filter((subsector) => subsector && subsector.sectorId && subsector.sectorId.toString() === sector._id.toString())
          .filter((subsector) => subsector && subsector._id && subSectorsInThemes.has(subsector._id.toString()))
          .map((subsector) => ({
            subSectorId: subsector._id.toString(),
            subSectorName: subsector.subSectorName || 'Unknown SubSector',
          }));

        return {
          sectorId: sector._id.toString(),
          sectorName: sector.sectorName || 'Unknown Sector',
          subsectors: relatedSubsectors,
        };
      });

    filteredSectors.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

    return NextResponse.json({
      success: true,
      data: populatedThemes,
      Sectordata: filteredSectors,
      totalThemes,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
