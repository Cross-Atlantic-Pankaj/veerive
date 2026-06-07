import {Schema, model} from 'mongoose'

const contextSchema = new Schema ({
    contextTitle: { type: String, required: true },
    date: { type: Date, required: true },       
    isTrending: {type: Boolean, default: false},
    displayOrder: {type: Number, default: 0},
    sectors: [{ type: Schema.Types.ObjectId, ref: 'Sector', required: true}],
    subSectors: [{ type: Schema.Types.ObjectId, ref: 'SubSector', required: false}],
    signalCategories: [{type: Schema.Types.ObjectId, ref: 'Signal', required: true}],
    signalSubCategories: [{type: Schema.Types.ObjectId, ref: 'SubSignal', required: false}],
    themes: [{ type: Schema.Types.ObjectId, ref: 'Theme', required: false }], 
    tileTemplates: [{ type: Schema.Types.ObjectId, ref: 'TileTemplate', required: false }],
    //posts: [{ type: Schema.Types.ObjectId, ref: 'Post', required: false }], 

    posts: [
      {
        postId: { type: Schema.Types.ObjectId, ref: 'Post', required: false },  // Reference to Post model
        includeInContainer: { type: Boolean, default: true }  // New boolean field
      }
    ],
    //containerType: { type: String, enum: ['Type-Five', 'Type-Four', 'Type-Three', 'Type-Two', 'Type-One', 'Type-Num'], default: 'Type-One', required: true },
    containerType: { 
      type: String, 
      enum: ['Type-Five', 'Type-Four', 'Type-Three', 'Type-Two', 'Type-One', 'Type-Num'], 
      default: 'Type-One', 
      required: [true, "containerType is required"] 
  },
  
    bannerShow: {type: Boolean, default: false},
    homePageShow: {type: Boolean, default: false},
    doNotPublish: {type: Boolean, default: false},
    bannerImage: {type: String, required: false},
    otherImage: {type: String, required: false},
    dataForTypeNum: { type: String, required: false },
    summary: { type: String, required: false },
    hasSlider: { type: Boolean, default: false },
    slide1: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide2: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide3: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide4: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide5: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide6: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide7: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide8: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide9: { title: { type: String, required: false }, description: { type: String, required: false } },
    slide10: { title: { type: String, required: false }, description: { type: String, required: false } },   
    generalComment: { type: String, required: false },
    
    // Image URL for context
    imageUrl: { type: String, required: false },
    
    // PDF URL for complete presentation (deprecated - use pdfFile instead)
    pdfUrl: { type: String, required: false },
    
    // PDF file stored directly in database
    pdfFile: {
        data: { type: Buffer, required: false },
        contentType: { type: String, required: false },
        fileName: { type: String, required: false },
        fileSize: { type: Number, required: false }
    },
    
    seoData: {
        seoURL: { type: String, required: false }, 
        metaTitle: { type: String, required: false },
        metaKeyword: { type: String, required: false },
        metaDescription: { type: Boolean, default: false },
        header: {},
        footer: {},
      },
}, {timestamps: true})

const Context = model('Context', contextSchema)

export default Context
