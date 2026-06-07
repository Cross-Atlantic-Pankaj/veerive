import StoryOrder from '../models/storyOrder-model.js'
const storyOrdersCltr = {}



storyOrdersCltr.list = async (req, res) => {
    try {
        const { startDate, endDate, publishDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: "Start and End date are required." });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Ensure it includes the full day

        let query = {
            publishDate: { $gte: start, $lte: end } // Filter between start and end date
        };

        // If `publishDate` is provided, filter by that specific date
        if (publishDate) {
            const publish = new Date(publishDate);
            query.publishDate = { $eq: publish };
        }


        const response = await StoryOrder.find(query);
        res.json(response);
    } catch (err) {
        console.error("Error fetching story orders:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};




storyOrdersCltr.create = async (req, res) => {
    try {
        const { publishDate, contextId, rank } = req.body;

        if (!publishDate || !contextId || !rank) {
            return res.status(400).json({ error: "Publish Date, Context ID, and Rank are required." });
        }

        const publishDateObj = new Date(publishDate); // Convert to Date object

        const storyOrder = new StoryOrder({ publishDate: publishDateObj, contextId, rank });
        await storyOrder.save();

        res.status(201).json(storyOrder);
    } catch (err) {
        console.error("Error creating story order:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};



storyOrdersCltr.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { publishDate, contextId, rank } = req.body;

        // Ensure required fields are provided
        if (!publishDate || !contextId || rank === undefined) {
            return res.status(400).json({ error: "Publish Date, Context ID, and Rank are required." });
        }

        const publishDateObj = new Date(publishDate);
        if (isNaN(publishDateObj.getTime())) {
            return res.status(400).json({ error: "Invalid Publish Date format." });
        }


        const updatedStoryOrder = await StoryOrder.findByIdAndUpdate(
            id,
            { publishDate: publishDateObj, contextId, rank: parseInt(rank) }, // Convert rank to number
            { new: true, runValidators: true }
        );

        if (!updatedStoryOrder) {
            return res.status(404).json({ error: "Story Order not found" });
        }

        res.json(updatedStoryOrder);
    } catch (err) {
        console.error("Error updating story order:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

storyOrdersCltr.delete = async (req, res) => {
    try{
        let storyOrder
        const id = req.params.id
        
        storyOrder = await StoryOrder.findByIdAndDelete(id)
        
        if(!storyOrder){
            return res.status(404).json({ message: 'Story Order not found' })
        }
        return res.json(storyOrder)

    }catch(err){
        console.error("Error updating story order:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default storyOrdersCltr