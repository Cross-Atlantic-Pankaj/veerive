import {Schema, model} from 'mongoose'

const regionSchema = new Schema ({
    regionName: { type: String, required: true },
    regionIcon: { type: String, required: false },
    regionDescription: { type: String, required: false },
    generalComment: { type: String, required: false },
}, {timestamps: true})

const countrySchema = new Schema ({
    countryName: { type: String, required: true },
    regionId: {type: Schema.Types.ObjectId, ref: 'Region', required: true},
    generalComment: { type: String, required: false },
}, {timestamps: true})

const Region = model('Region', regionSchema)
const Country = model('Country', countrySchema)

export {Region, Country}