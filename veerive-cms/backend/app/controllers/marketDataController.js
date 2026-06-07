import MarketData from '../models/marketData.js';

export const createMarketData = async (req, res) => {
  try {
    const { url, ...rest } = req.body;
    const doc = new MarketData(rest);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllMarketData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await MarketData.countDocuments();
    const marketData = await MarketData.find()
      .populate('sector')
      .populate('subSector')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      marketData,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCount: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllMarketDatas = async (req, res) => {
  try {
    const marketData = await MarketData.find()
      .populate('sector')
      .populate('subSector')
      .sort({ createdAt: -1 });
    
    res.json({
      marketData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOneMarketData = async (req, res) => {
  try {
    const marketData = await MarketData.findById(req.params.id)
      .populate('sector')
      .populate('subSector');
    
    if (!marketData) {
      return res.status(404).json({ error: 'Market data not found' });
    }
    
    res.json(marketData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMarketData = async (req, res) => {
  try {
    const marketData = await MarketData.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('sector').populate('subSector');
    
    if (!marketData) {
      return res.status(404).json({ error: 'Market data not found' });
    }
    
    res.json(marketData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteMarketData = async (req, res) => {
  try {
    const marketData = await MarketData.findByIdAndDelete(req.params.id);
    
    if (!marketData) {
      return res.status(404).json({ error: 'Market data not found' });
    }
    
    res.json({ message: 'Market data deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 