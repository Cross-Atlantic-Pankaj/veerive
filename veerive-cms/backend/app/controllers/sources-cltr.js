import Source from '../models/source-model.js'
const sourcesCltr = {}

sourcesCltr.list = async (req, res) => {
    try{
        const response = await Source.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

sourcesCltr.create = async (req, res) => {

    try{
        const source = new Source(req.body)
        await source.save()
        res.status(201).json(source)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

sourcesCltr.update = async (req, res) => {

    try{
        let source
        const id = req.params.id
        const body = req.body
        source = await Source.findByIdAndUpdate(id, body, {new: true})
        
        if(!source){
            return res.status(404).json({ message: 'Source not found' })
        }
        return res.json(source)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

sourcesCltr.delete = async (req, res) => {
    try{
        let source
        const id = req.params.id
        
        source = await Source.findByIdAndDelete(id)
        
        if(!source){
            return res.status(404).json({ message: 'Source not found' })
        }
        return res.json(source)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default sourcesCltr