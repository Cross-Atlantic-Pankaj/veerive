import QueryRefiner from '../models/queryRefiner.js';

export const createQueryRefiner = async (req, res) => {
  try {
    // Preprocess the data to handle empty subSector
    const data = { ...req.body };
    
    // Remove subSector if it's empty, null, or undefined
    if (!data.subSector || data.subSector === '' || data.subSector === null || data.subSector === undefined) {
      delete data.subSector;
    }
    
    const doc = new QueryRefiner(data);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get paginated query refiners
export const getAllQueryRefiner = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let refiners = await QueryRefiner.find()
      .populate('sector')
      .populate('subSector')
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    const totalRefiners = await QueryRefiner.countDocuments();

    res.json({
      refiners,
      totalPages: Math.ceil(totalRefiners / limitNumber),
      currentPage: pageNumber,
      totalRefiners
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Get all query refiners (for search/export functionality)
export const getAllQueryRefiners = async (req, res) => {
  try {
    const allRefiners = await QueryRefiner.find()
      .populate('sector')
      .populate('subSector');
    res.json({ success: true, refiners: allRefiners });
  } catch (err) {
    console.error("Error fetching all query refiners:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get a single query refiner by ID
export const getOneQueryRefiner = async (req, res) => {
  try {
    const id = req.params.id;
    const refiner = await QueryRefiner.findById(id)
      .populate('sector')
      .populate('subSector');
    if (!refiner) {
      return res.status(404).json({ message: 'Query refiner not found' });
    }
    res.json(refiner);
  } catch (err) {
    console.error("Error fetching query refiner:", err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Update query refiner
export const updateQueryRefiner = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Preprocess the data to handle empty subSector
    const data = { ...req.body };
    
    // Remove subSector if it's empty, null, or undefined
    if (!data.subSector || data.subSector === '' || data.subSector === null || data.subSector === undefined) {
      delete data.subSector;
    }
    
    const refiner = await QueryRefiner.findByIdAndUpdate(id, data, { new: true })
      .populate('sector')
      .populate('subSector');
    
    if (!refiner) {
      return res.status(404).json({ message: 'Query refiner not found' });
    }
    res.json(refiner);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// Delete query refiner
export const deleteQueryRefiner = async (req, res) => {
  try {
    const id = req.params.id;
    const refiner = await QueryRefiner.findByIdAndDelete(id);
    
    if (!refiner) {
      return res.status(404).json({ message: 'Query refiner not found' });
    }
    res.json(refiner);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}; 