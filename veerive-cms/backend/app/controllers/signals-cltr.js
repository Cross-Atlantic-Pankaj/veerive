import {Signal} from '../models/signal-model.js'
const signalsCltr = {}

signalsCltr.list = async (req, res) => {
    try{
        const response = await Signal.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

signalsCltr.create = async (req, res) => {

    try{
        const signal = new Signal(req.body)
        await signal.save()
        res.status(201).json(signal)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

signalsCltr.update = async (req, res) => {

    try{
        let signal
        const id = req.params.id
        const body = req.body
        signal = await Signal.findByIdAndUpdate(id, body, {new: true})
        
        if(!signal){
            return res.status(404).json({ message: 'Signal not found' })
        }
        return res.json(signal)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

signalsCltr.delete = async (req, res) => {
    try{
        let signal
        const id = req.params.id
        
        signal = await Signal.findByIdAndDelete(id)
        
        if(!signal){
            return res.status(404).json({ message: 'Signal not found' })
        }
        return res.json(signal)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default signalsCltr