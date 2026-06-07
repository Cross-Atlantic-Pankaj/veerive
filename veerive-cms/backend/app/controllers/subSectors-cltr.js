import {SubSector} from '../models/sector-model.js'
const subSectorsCltr = {}

subSectorsCltr.list = async (req, res) => {
    try{
        const response = await SubSector.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

subSectorsCltr.create = async (req, res) => {

    try{
        const subSector = new SubSector(req.body)
        await subSector.save()
        res.status(201).json(subSector)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

subSectorsCltr.update = async (req, res) => {

    try{
        let subSector
        const id = req.params.id
        const body = req.body
        subSector = await SubSector.findByIdAndUpdate(id, body, {new: true})
        
        if(!subSector){
            return res.status(404).json({ message: 'SubSector not found' })
        }
        return res.json(subSector)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

subSectorsCltr.delete = async (req, res) => {
    try{
        let subSector
        const id = req.params.id
        
        subSector = await SubSector.findByIdAndDelete(id)
        
        if(!subSector){
            return res.status(404).json({ message: 'SubSector not found' })
        }
        return res.json(subSector)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default subSectorsCltr