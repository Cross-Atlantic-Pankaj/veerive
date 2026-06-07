import {Region} from '../models/geography-model.js'
const regionsCltr = {}

regionsCltr.list = async (req, res) => {
    try{
        const response = await Region.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

regionsCltr.create = async (req, res) => {

    try{
        const region = new Region(req.body)
        await region.save()
        res.status(201).json(region)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

regionsCltr.update = async (req, res) => {

    try{
        let region
        const id = req.params.id
        const body = req.body
        region = await Region.findByIdAndUpdate(id, body, {new: true})
        
        if(!region){
            return res.status(404).json({ message: 'Region not found' })
        }
        return res.json(region)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

regionsCltr.delete = async (req, res) => {
    try{
        let region
        const id = req.params.id
        
        region = await Region.findByIdAndDelete(id)
        
        if(!region){
            return res.status(404).json({ message: 'Region not found' })
        }
        return res.json(region)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default regionsCltr