import Theme from '../models/theme-model.js'
const themesCltr = {}

// themesCltr.list = async (req, res) => {
//     try{
//         const allThemes = await Theme.find({})
//         res.json(allThemes)
//         console.log(allThemes)
//     } catch(err) {
//         console.error("Error creating theme:", err)
//         res.json(err)
//     }
    
// }

themesCltr.create = async (req, res) => {

    try{
        const theme = new Theme(req.body)
        await theme.save()
        res.status(201).json(theme)
    }catch(err){
        console.error("Error creating theme:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

themesCltr.update = async (req, res) => {

    try{
        let theme
        const id = req.params.id
        const body = req.body
        theme = await Theme.findByIdAndUpdate(id, body, {new: true})
        
        if(!theme){
            return res.status(404).json({ message: 'Theme not found' })
        }
        return res.json(theme)

    }catch(err){
        console.error("Error creating theme:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

themesCltr.delete = async (req, res) => {
    try{
        let theme
        const id = req.params.id
        
        // First, find the theme to get its details
        theme = await Theme.findById(id)
        
        if(!theme){
            return res.status(404).json({ message: 'Theme not found' })
        }

        // Remove the theme from all contexts that reference it
        const Context = (await import('../models/context-model.js')).default;
        await Context.updateMany(
            { themes: id },
            { $pull: { themes: id } }
        );


        // Now delete the theme
        await Theme.findByIdAndDelete(id)
        
        return res.json({
            success: true,
            message: "Theme deleted successfully and removed from all contexts",
            theme: theme
        })

    }catch(err){
        console.error("Error creating theme:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

// Helper to always return sectors/subSectors as array of ObjectId strings
function toIdArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => (item && item._id ? String(item._id) : String(item)));
}

// Get paginated themes
themesCltr.list = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(limit);

        let themes = await Theme.find({})
            .populate('sectors')
            .populate('subSectors')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalThemes = await Theme.countDocuments();
        themes = themes.map(theme => {
            const t = theme.toObject();
            t.sectors = toIdArray(t.sectors);
            t.subSectors = toIdArray(t.subSectors);
            return t;
        });

        res.json({
            themes,
            totalPages: Math.ceil(totalThemes / limitNumber),
            currentPage: pageNumber,
            totalThemes
        });

    } catch (err) {
        console.error("Error creating theme:", err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

themesCltr.getAllThemes = async (req, res) => {
    try {
        let allThemes = await Theme.find({})
            .populate('sectors')
            .populate('subSectors');
        allThemes = allThemes.map(theme => {
            const t = theme.toObject();
            t.sectors = toIdArray(t.sectors);
            t.subSectors = toIdArray(t.subSectors);
            return t;
        });
        res.json({ success: true, themes: allThemes });
    } catch (err) {
        console.error("Error fetching all themes:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

// Get a single theme by ID
themesCltr.getOne = async (req, res) => {
    try {
        const id = req.params.id;
        let theme = await Theme.findById(id)
            .populate('sectors')
            .populate('subSectors');
        if (!theme) {
            return res.status(404).json({ message: 'Theme not found' });
        }
        theme = theme.toObject();
        theme.sectors = toIdArray(theme.sectors);
        theme.subSectors = toIdArray(theme.subSectors);
        res.json(theme);
    } catch (err) {
        console.error("Error fetching theme:", err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

export default themesCltr