import Role from '../models/role-model.js'
const rolesCltr = {}

rolesCltr.list = async (req, res) => {
    try{
        const response = await Role.find({})
        res.json(response)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

rolesCltr.create = async (req, res) => {

    try{
        const role = new Role(req.body)
        await role.save()
        res.status(201).json(role)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

rolesCltr.update = async (req, res) => {

    try{
        let role
        const id = req.params.id
        const body = req.body
        role = await Role.findByIdAndUpdate(id, body, {new: true})
        
        if(!role){
            return res.status(404).json({ message: 'Role not found' })
        }
        return res.json(role)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

rolesCltr.delete = async (req, res) => {
    try{
        let role
        const id = req.params.id
        
        role = await Role.findByIdAndDelete(id)
        
        if(!role){
            return res.status(404).json({ message: 'Role not found' })
        }
        return res.json(role)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default rolesCltr