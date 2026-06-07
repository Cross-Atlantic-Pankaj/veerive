import Profile from '../models/profile-model.js'
const profilesCltr = {}

profilesCltr.list = async (req, res) => {
    try{
        const profiles = await Profile.find({user: req.userId})
        res.json(profiles)
    } catch(err) {
        console.error("Error:", err)
        res.json(err)
    }
    
}

profilesCltr.show = async (req, res) => {

    try{
        const profile = await Profile.findOne({user : req.params.id, userId: req.userId})  
        if(!profile){
            return res.status(404).json({ message: 'Profile not found' })
        }
        res.json(profile)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

profilesCltr.create = async (req, res) => {

    try{
        const profile = new Profile(req.body)
        await profile.save()
        res.status(201).json(profile)
    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

profilesCltr.update = async (req, res) => {

    try{
        let profile
        const id = req.params.id
        const body = req.body
        profile = await Profile.findByIdAndUpdate(id, body, {new: true})
        
        if(!profile){
            return res.status(404).json({ message: 'Profile not found' })
        }
        return res.json(profile)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

profilesCltr.delete = async (req, res) => {
    try{
        let profile
        const id = req.params.id
        
        profile = await Profile.findByIdAndDelete(id)
        
        if(!profile){
            return res.status(404).json({ message: 'Profile not found' })
        }
        return res.json(profile)

    }catch(err){
        console.error("Error:", err)
        res.status(500).json({error: 'something went wrong'})
    }
}

export default profilesCltr