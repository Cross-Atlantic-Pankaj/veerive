import Driver from '../models/driver-model.js'

const driversCltr = {}

driversCltr.list = async (req, res) => {
    try {
        const drivers = await Driver.find().sort({ driverName: 1 })
        res.json({ success: true, data: drivers })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch drivers', error: err.message })
    }
}

driversCltr.create = async (req, res) => {
    try {
        const { driverName, driverDescription, icon } = req.body
        if (!driverName) {
            return res.status(400).json({ success: false, message: 'driverName is required' })
        }
        const driver = new Driver({ driverName, driverDescription, icon })
        await driver.save()
        res.status(201).json({ success: true, data: driver })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create driver', error: err.message })
    }
}

driversCltr.update = async (req, res) => {
    try {
        const { id } = req.params
        const { driverName, driverDescription, icon } = req.body
        
        if (!driverName) {
            return res.status(400).json({ success: false, message: 'driverName is required' })
        }
        
        const driver = await Driver.findByIdAndUpdate(
            id, 
            { driverName, driverDescription, icon }, 
            { new: true, runValidators: true }
        )
        
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' })
        }
        
        res.json({ success: true, data: driver })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update driver', error: err.message })
    }
}

driversCltr.delete = async (req, res) => {
    try {
        const { id } = req.params
        const driver = await Driver.findByIdAndDelete(id)
        
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' })
        }
        
        res.json({ success: true, message: 'Driver deleted successfully' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete driver', error: err.message })
    }
}

export default driversCltr


