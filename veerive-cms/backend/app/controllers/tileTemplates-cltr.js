import TileTemplate from '../models/tileTemplate-model.js';

const tileTemplatesCltr = {};

// List all tile templates
tileTemplatesCltr.list = async (req, res) => {
    try {
        const templates = await TileTemplate.find();
        res.json(templates);
    } catch (e) {
        res.status(500).json(e);
    }
};

// Create a tile template
tileTemplatesCltr.create = async (req, res) => {
    const body = req.body;
    try {
        const template = new TileTemplate(body);
        await template.save();
        res.json(template);
    } catch (e) {
        res.status(500).json(e);
    }
};

// Show a single tile template
tileTemplatesCltr.show = async (req, res) => {
    const id = req.params.id;
    try {
        const template = await TileTemplate.findById(id);
        res.json(template);
    } catch (e) {
        res.status(500).json(e);
    }
};

// Update a tile template
tileTemplatesCltr.update = async (req, res) => {
    const id = req.params.id;
    const body = req.body;
    try {
        const template = await TileTemplate.findByIdAndUpdate(id, body, { new: true });
        res.json(template);
    } catch (e) {
        res.status(500).json(e);
    }
};

// Delete a tile template
tileTemplatesCltr.destroy = async (req, res) => {
    const id = req.params.id;
    try {
        const template = await TileTemplate.findByIdAndDelete(id);
        res.json(template);
    } catch (e) {
        res.status(500).json(e);
    }
};

export default tileTemplatesCltr; 