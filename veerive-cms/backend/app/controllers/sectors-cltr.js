import {Sector} from '../models/sector-model.js'
const sectorsCltr = {}

sectorsCltr.list = async (req, res) => {
    try{
        const response = await Sector.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

sectorsCltr.create = async (req, res) => {

    try{
        const sector = new Sector(req.body)
        await sector.save()
        res.status(201).json(sector)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

sectorsCltr.update = async (req, res) => {

    try{
        let sector
        const id = req.params.id
        const body = req.body
        sector = await Sector.findByIdAndUpdate(id, body, {new: true})
        
        if(!sector){
            return res.status(404).json({ message: 'Sector not found' })
        }
        return res.json(sector)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

sectorsCltr.delete = async (req, res) => {
    try{
        let sector
        const id = req.params.id
        
        sector = await Sector.findByIdAndDelete(id)
        
        if(!sector){
            return res.status(404).json({ message: 'Sector not found' })
        }
        return res.json(sector)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default sectorsCltr