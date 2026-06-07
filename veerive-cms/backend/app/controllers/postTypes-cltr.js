import PostType from '../models/postType-model.js'
const postTypesCltr = {}

postTypesCltr.list = async (req, res) => {
    try{
        const response = await PostType.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

postTypesCltr.create = async (req, res) => {

    try{
        const postType = new PostType(req.body)
        await postType.save()
        res.status(201).json(postType)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

postTypesCltr.update = async (req, res) => {

    try{
        let postType
        const id = req.params.id
        const body = req.body
        postType = await PostType.findByIdAndUpdate(id, body, {new: true})
        
        if(!postType){
            return res.status(404).json({ message: 'PostType not found' })
        }
        return res.json(postType)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

postTypesCltr.delete = async (req, res) => {
    try{
        let postType
        const id = req.params.id
        
        postType = await PostType.findByIdAndDelete(id)
        
        if(!postType){
            return res.status(404).json({ message: 'PostType not found' })
        }
        return res.json(postType)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default postTypesCltr