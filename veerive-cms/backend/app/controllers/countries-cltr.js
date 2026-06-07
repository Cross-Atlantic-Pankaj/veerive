import {Country} from '../models/geography-model.js'
const countriesCltr = {}

countriesCltr.list = async (req, res) => {
    try{
        const response = await Country.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

countriesCltr.create = async (req, res) => {

    try{
        const country = new Country(req.body)
        await country.save()
        res.status(201).json(country)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

countriesCltr.update = async (req, res) => {

    try{
        let country
        const id = req.params.id
        const body = req.body
        country = await Country.findByIdAndUpdate(id, body, {new: true})
        
        if(!country){
            return res.status(404).json({ message: 'Country not found' })
        }
        return res.json(country)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

countriesCltr.delete = async (req, res) => {
    try{
        let country
        const id = req.params.id
        
        country = await Country.findByIdAndDelete(id)
        
        if(!country){
            return res.status(404).json({ message: 'Country not found' })
        }
        return res.json(country)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default countriesCltr