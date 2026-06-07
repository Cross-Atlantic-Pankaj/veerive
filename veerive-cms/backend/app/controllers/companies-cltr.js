import Company from '../models/company-model.js'
const companiesCltr = {}

companiesCltr.list = async (req, res) => {
    try{
        const companies = await Company.find({})
        res.json(companies)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

companiesCltr.create = async (req, res) => {

    try{
        const company = new Company(req.body)
        await company.save()
        res.status(201).json(company)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

companiesCltr.update = async (req, res) => {

    try{
        let company
        const id = req.params.id
        const body = req.body
        company = await Company.findByIdAndUpdate(id, body, {new: true})
        
        if(!company){
            return res.status(404).json({ message: 'Company not found' })
        }
        return res.json(company)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

companiesCltr.delete = async (req, res) => {
    try{
        let company
        const id = req.params.id
        
        company = await Company.findByIdAndDelete(id)
        
        if(!company){
            return res.status(404).json({ message: 'Company not found' })
        }
        return res.json(company)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default companiesCltr