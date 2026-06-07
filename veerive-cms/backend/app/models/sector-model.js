import {Schema, model} from 'mongoose'

const sectorSchema = new Schema ({
    sectorName: { type: String, required: true },
    generalComment: { type: String, required: false },
}, {timestamps: true})

const subSectorSchema = new Schema ({
    subSectorName: { type: String, required: true },
    sectorId: {type: Schema.Types.ObjectId, ref: 'Sector', required: true},
    generalComment: { type: String, required: false },
}, {timestamps: true})

const Sector = model('Sector', sectorSchema)
const SubSector = model('SubSector', subSectorSchema)

export {Sector, SubSector}