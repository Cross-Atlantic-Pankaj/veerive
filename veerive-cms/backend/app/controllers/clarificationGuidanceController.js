import ClarificationGuidance from '../models/clarificationGuidance.js';

export const createClarificationGuidance = async (req, res) => {
  try {
    // Preprocess the data to handle empty subSector
    const data = { ...req.body };
    
    // Remove subSector if it's empty, null, or undefined
    if (!data.subSector || data.subSector === '' || data.subSector === null || data.subSector === undefined) {
      delete data.subSector;
    }
    
    const doc = new ClarificationGuidance(data);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllClarificationGuidance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await ClarificationGuidance.countDocuments();
    const guidances = await ClarificationGuidance.find()
      .populate('sector')
      .populate('subSector')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      guidances,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllClarificationGuidances = async (req, res) => {
  try {
    const guidances = await ClarificationGuidance.find()
      .populate('sector')
      .populate('subSector')
      .sort({ createdAt: -1 });
    
    res.json({
      guidances
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOneClarificationGuidance = async (req, res) => {
  try {
    const guidance = await ClarificationGuidance.findById(req.params.id)
      .populate('sector')
      .populate('subSector');
    
    if (!guidance) {
      return res.status(404).json({ error: 'Clarification guidance not found' });
    }
    
    res.json(guidance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateClarificationGuidance = async (req, res) => {
  try {
    // Preprocess the data to handle empty subSector
    const data = { ...req.body };
    
    // Remove subSector if it's empty, null, or undefined
    if (!data.subSector || data.subSector === '' || data.subSector === null || data.subSector === undefined) {
      delete data.subSector;
    }
    
    const guidance = await ClarificationGuidance.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).populate('sector').populate('subSector');
    
    if (!guidance) {
      return res.status(404).json({ error: 'Clarification guidance not found' });
    }
    
    res.json(guidance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteClarificationGuidance = async (req, res) => {
  try {
    const guidance = await ClarificationGuidance.findByIdAndDelete(req.params.id);
    
    if (!guidance) {
      return res.status(404).json({ error: 'Clarification guidance not found' });
    }
    
    res.json({ message: 'Clarification guidance deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 