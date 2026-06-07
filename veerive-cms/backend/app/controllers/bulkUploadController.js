import ClarificationGuidance from '../models/clarificationGuidance.js';
import QueryRefiner from '../models/queryRefiner.js';
import MarketData from '../models/marketData.js';
import { Sector } from '../models/sector-model.js';
import { SubSector } from '../models/sector-model.js';

const handleBulkUpload = async (Model, data) => {
    try {
        // First, validate that all referenced sectors and subsectors exist
        for (const item of data) {
            if (item.sector) {
                const sector = await Sector.findById(item.sector);
                if (!sector) {
                    throw new Error(`Sector with ID ${item.sector} not found`);
                }
            }
            if (item.subSector) {
                const subSector = await SubSector.findById(item.subSector);
                if (!subSector) {
                    throw new Error(`SubSector with ID ${item.subSector} not found`);
                }
            }
        }

        const result = await Model.insertMany(data);
        return { success: true, data: result };
    } catch (error) {
        console.error('Bulk upload error:', error);
        throw new Error(`Failed to bulk upload: ${error.message}`);
    }
};

export const bulkUploadClarificationGuidance = async (req, res) => {
    try {
        const result = await handleBulkUpload(ClarificationGuidance, req.body.data);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const bulkUploadQueryRefiner = async (req, res) => {
    try {
        const result = await handleBulkUpload(QueryRefiner, req.body.data);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const bulkUploadMarketData = async (req, res) => {
    try {
        const result = await handleBulkUpload(MarketData, req.body.data);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}; 