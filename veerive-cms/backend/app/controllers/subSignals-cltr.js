import {SubSignal} from '../models/signal-model.js'
const subSignalsCltr = {}

subSignalsCltr.list = async (req, res) => {
    try{
        const response = await SubSignal.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

subSignalsCltr.create = async (req, res) => {

    try{
        const subSignal = new SubSignal(req.body)
        await subSignal.save()
        res.status(201).json(subSignal)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

subSignalsCltr.update = async (req, res) => {

    try{
        let subSignal
        const id = req.params.id
        const body = req.body
        subSignal = await SubSignal.findByIdAndUpdate(id, body, {new: true})
        
        if(!subSignal){
            return res.status(404).json({ message: 'SubSignal not found' })
        }
        return res.json(subSignal)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

subSignalsCltr.delete = async (req, res) => {
    try{
        let subSignal
        const id = req.params.id
        
        subSignal = await SubSignal.findByIdAndDelete(id)
        
        if(!subSignal){
            return res.status(404).json({ message: 'SubSignal not found' })
        }
        return res.json(subSignal)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default subSignalsCltr