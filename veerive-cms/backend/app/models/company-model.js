import {Schema, model} from 'mongoose'

const companySchema = new Schema ({
    companyName: { type: String, required: true },
    parentName: { type: String, required: false },
    website: { type: String, required: true },
    country: { type: Schema.Types.ObjectId, ref: 'Country', required: true},
    sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector', required: true }], // Array for multiple sectors
    subSectors: [{ type: Schema.Types.ObjectId, ref: 'SubSector', required: false }],
    generalComment: { type: String, required: false },
    seoData: {
      seoURL: { type: String, required: false }, 
      metaTitle: { type: String, required: false },
      metaKeyword: { type: String, required: false },
      metaDescription: { type: Boolean, default: false },
      header: {},
      footer: {},
    },
  
}, {timestamps: true})


const Company = model('Company', companySchema)

export default Company