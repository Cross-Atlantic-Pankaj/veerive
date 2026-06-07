import Context from '../models/context-model.js'
import { Sector, SubSector } from '../models/sector-model.js';
import { Signal, SubSignal } from '../models/signal-model.js';
import Theme from '../models/theme-model.js';
import Company from '../models/company-model.js';
import Source from '../models/source-model.js';
import { Country, Region } from '../models/geography-model.js';
import PostType from '../models/postType-model.js';


const contextsCltr = {}

contextsCltr.getAllContexts = async (req, res) => {
    try {
        // Fetch all contexts from the database, sorted alphabetically
        const contexts = await Context.find({})
            .sort({ contextTitle: 1 })
            .lean();

        res.json({ success: true, contexts });
    } catch (err) {
        console.error("Error fetching all contexts:", err);
        res.status(500).json({ error: "Server Error" });
    }
};



contextsCltr.list = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        let query = {};

        if (search) {
            const isDateSearch = /^\d{4}-\d{2}-\d{2}$/.test(search);

            if (isDateSearch) {
                const parsedDate = new Date(search);

                if (!isNaN(parsedDate.getTime())) {
                    const startDate = new Date(parsedDate);
                    startDate.setUTCHours(0, 0, 0, 0); // Force UTC start time

                    const endDate = new Date(startDate);
                    endDate.setUTCHours(23, 59, 59, 999); // End of the same day

                    query.date = { $gte: startDate, $lte: endDate };
                }
            } else {
                query.contextTitle = { $regex: search, $options: "i" }; // Text search
            }
        }

        const totalContexts = await Context.countDocuments(query);

        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const skipRecords = (pageNumber - 1) * pageSize;

        const contexts = await Context.find(query)
            .sort({ date: -1 })
            .skip(skipRecords)
            .limit(pageSize)
            .lean();

        res.json({
            success: true,
            total: totalContexts,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(totalContexts / pageSize),
            contexts
        });
    } catch (err) {
        console.error("Error fetching contexts:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

contextsCltr.show = async (req, res) => {
    try {
        const contextId = req.params.id;

        // ✅ Handle case when ID is "all" by calling getAllContexts
        if (contextId === "all") {
            return contextsCltr.getAllContexts(req, res);
        }

        // ✅ Validate ObjectId format before searching
        if (!contextId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid Context ID format' });
        }

        const context = await Context.findById(contextId);
        if (!context) {
            return res.status(404).json({ message: 'Context not found' });
        }

        res.json(context);
    } catch (err) {
        console.error("Error fetching context:", err);
        res.status(500).json({ message: 'Server error', error: err });
    }
};

contextsCltr.postContext = async (req, res) => {
    const { postId } = req.params;
    try {
        const contexts = await Context.find({ 'posts.postId': postId });
        res.json({ success: true, contexts });
    } catch (error) {
        console.error('Error fetching contexts for post:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// Secure endpoint - POST request with postId in body instead of URL
contextsCltr.getContextsByPost = async (req, res) => {
    const { postId } = req.body;
    try {
        if (!postId) {
            return res.status(400).json({ success: false, error: 'Post ID is required' });
        }
        
        const contexts = await Context.find({ 'posts.postId': postId });
        res.json({ success: true, contexts });
    } catch (error) {
        console.error('Error fetching contexts for post:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};



contextsCltr.create = async (req, res) => {
    try {
        // Check if containerType exists in req.body
        if (!req.body.containerType) {
            return res.status(400).json({ error: 'containerType is required.' });
        }

        // Explicitly handle imageUrl to ensure it's not lost
        const imageUrlValue = req.body.imageUrl || null;
        
        // Handle PDF file data - convert base64 to Buffer if present
        let pdfFileData = null;
        if (req.body.pdfFile && req.body.pdfFile.data) {
            try {
                // Convert base64 data URL to Buffer
                const base64Data = req.body.pdfFile.data.replace(/^data:.*,/, '');
                pdfFileData = {
                    data: Buffer.from(base64Data, 'base64'),
                    contentType: req.body.pdfFile.contentType,
                    fileName: req.body.pdfFile.fileName,
                    fileSize: req.body.pdfFile.fileSize
                };
            } catch (pdfError) {
                console.error('Error processing PDF file:', pdfError);
                return res.status(400).json({ error: 'Invalid PDF file data' });
            }
        }
        
        const contextData = {
            ...req.body,
            imageUrl: imageUrlValue, // ✅ Explicitly set imageUrl
            pdfFile: pdfFileData // ✅ Set PDF file data
        };
        
        // Remove pdfFile from req.body to avoid duplication
        delete contextData.pdfFile;
        if (pdfFileData) {
            contextData.pdfFile = pdfFileData;
        }
        
        const context = new Context(contextData);
        
        // Explicitly set imageUrl to ensure it's not lost
        if (imageUrlValue) {
            context.imageUrl = imageUrlValue;
        }
        
        await context.save();
        
        // Backup: If imageUrl is not saved, try direct MongoDB update
        if (imageUrlValue && !context.imageUrl) {
            try {
                await Context.findByIdAndUpdate(context._id, { imageUrl: imageUrlValue });
            } catch (backupError) {
                console.error('Context backup update failed:', backupError);
            }
        }
        
        res.status(201).json(context);
    } catch (err) {
        console.error('Error creating context:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};



contextsCltr.update = async (req, res) => {
    try{
        let context
        const id = req.params.id
        const body = req.body
        
        // Explicitly handle imageUrl for context update
        const imageUrlValue = body.imageUrl || null;
        
        // Handle PDF file data - convert base64 to Buffer if present
        let pdfFileData = null;
        if (body.pdfFile && body.pdfFile.data) {
            try {
                // Convert base64 data URL to Buffer
                const base64Data = body.pdfFile.data.replace(/^data:.*,/, '');
                pdfFileData = {
                    data: Buffer.from(base64Data, 'base64'),
                    contentType: body.pdfFile.contentType,
                    fileName: body.pdfFile.fileName,
                    fileSize: body.pdfFile.fileSize
                };
            } catch (pdfError) {
                console.error('Error processing PDF file:', pdfError);
                return res.status(400).json({ error: 'Invalid PDF file data' });
            }
        }
        
        const updateData = {
            ...body,
            imageUrl: imageUrlValue, // ✅ Explicitly set imageUrl
            pdfFile: pdfFileData // ✅ Set PDF file data
        };
        
        // Remove pdfFile from body to avoid duplication
        delete updateData.pdfFile;
        if (pdfFileData) {
            updateData.pdfFile = pdfFileData;
        }
        
        // Ensure imageUrl is explicitly set in the context update
        if (imageUrlValue) {
            updateData.imageUrl = imageUrlValue;
        }
        
        context = await Context.findByIdAndUpdate(id, updateData, {new: true})
        
        if(!context){
            return res.status(404).json({ message: 'Context not found' })
        }
        return res.json(context)

    }catch(err){
        console.error("Error updating context:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}



// for updating postId in context when a post is saved
    
    contextsCltr.updatePostId = async (req, res) => {
    const { postId, includeInContainer } = req.body; // postId and includeInContainer being sent in the request body
    const { contextId } = req.params; // contextId from the URL params

    try {
        // Ensure contextId, postId, and includeInContainer are provided
        if (!contextId || !postId) {
            return res.status(400).json({ message: 'Context ID, Post ID, and includeInContainer are required.' });
        }

        // Use the $push operator to add the new post object to the posts array
        const updatedContext = await Context.findByIdAndUpdate(
            contextId, // Find the context by its ID
            { $push: { posts: { postId, includeInContainer } } }, // Push the new post object into the posts array
            { new: true, useFindAndModify: false } // Return the updated document
        );

        // Check if the context was found and updated
        if (!updatedContext) {
            return res.status(404).json({ message: 'Context not found.' });
        }

        // Respond with the updated context
        res.status(200).json({ message: 'Post ID added successfully', updatedContext });
    } catch (error) {
        console.error('Error updating context with postId:', error);
        res.status(500).json({ message: 'An error occurred while updating the context.' });
    }
};


contextsCltr.delete = async (req, res) => {
    try{
        let context
        const id = req.params.id
        
        context = await Context.findByIdAndDelete(id)
        
        if(!context){
            return res.status(404).json({ message: 'Context not found' })
        }
        return res.json(context)

    }catch(err){
        console.error("Error deleting context:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

// Modular API to fetch all master data for context editing
contextsCltr.getEditContextData = async (req, res) => {
    try {
        // Fetch all master data in parallel
        const [
            sectors,
            subSectors,
            signals,
            subSignals,
            themes,
            companies,
            sources,
            countries,
            regions,
            postTypes
        ] = await Promise.all([
            Sector.find({}),
            SubSector.find({}),
            Signal.find({}),
            SubSignal.find({}),
            Theme.find({}),
            Company.find({}),
            Source.find({}),
            Country.find({}),
            Region.find({}),
            PostType.find({})
        ]);

        // User management: restrict data if needed (currently all users can view all master data)
        // If you want to restrict, filter here based on req.user.role

        res.json({
            success: true,
            data: {
                sectors,
                subSectors,
                signals,
                subSignals,
                themes,
                companies,
                sources,
                countries,
                regions,
                postTypes
            }
        });
    } catch (err) {
        console.error('Error fetching edit context data:', err);
        res.status(500).json({ error: 'Server Error' });
    }
};

// Endpoint to retrieve PDF file from database
contextsCltr.getPdfFile = async (req, res) => {
    try {
        const contextId = req.params.id;
        
        // Validate ObjectId format
        if (!contextId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid Context ID format' });
        }
        
        const context = await Context.findById(contextId).select('pdfFile');
        
        if (!context) {
            return res.status(404).json({ message: 'Context not found' });
        }
        
        if (!context.pdfFile || !context.pdfFile.data) {
            return res.status(404).json({ message: 'PDF file not found for this context' });
        }
        
        // Set appropriate headers for file download
        res.set({
            'Content-Type': context.pdfFile.contentType || 'application/pdf',
            'Content-Disposition': `attachment; filename="${context.pdfFile.fileName || 'document.pdf'}"`,
            'Content-Length': context.pdfFile.data.length
        });
        
        // Send the file data
        res.send(context.pdfFile.data);
        
    } catch (err) {
        console.error('Error retrieving PDF file:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

export default contextsCltr