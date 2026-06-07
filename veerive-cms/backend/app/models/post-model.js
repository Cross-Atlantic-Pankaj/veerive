import {Schema, model} from 'mongoose'

const postSchema = new Schema ({
    postTitle: { type: String, required: true },
    date: { type: Date, required: true },       
    postType: { type: String, enum: ['News', 'Expert Opinion', 'Research Report', 'Infographic', 'Interview'], required: true },
    //postTypeId: { type: Schema.Types.ObjectId, ref: 'PostType', required: true},
    isTrending: {type: Boolean, default: false},
    includeInContainer: {type: Boolean, default: false},
    homePageShow: {type: Boolean, default: false},
    doNotPublish: {type: Boolean, default: false},
    contexts: [{ type: Schema.Types.ObjectId, ref: 'Context', required: true}],
    countries: [{ type: Schema.Types.ObjectId, ref: 'Country', required: true}],
    summary: { type: String, required: true },
    completeContent: { type: String, required: false },   
    sentiment: { type: String, enum: ['Positive', 'Negative', 'Neutral'], required: true},
    primaryCompanies: [{ type: Schema.Types.ObjectId, ref: 'Company', required: false}],
    secondaryCompanies: [{ type: Schema.Types.ObjectId, ref: 'Company', required: false}],
    generalComment: { type: String, required: false },
    // source: { type: String, ref: 'Source', required: true},
    // sourceUrl: {type: String, required: true},
    source: [{ type: Schema.Types.ObjectId, ref: 'Source', required: true }], // ✅ Now an array
    sourceUrls: [{ type: String, required: true }], // ✅ Now an array

    // Google Drive URL (always available)
    googleDriveUrl: { type: String, required: false }, // Google Drive link for any post type
    
    // Legacy fields for backward compatibility
    infographicsUrl: { type: String, required: false }, // Deprecated: Google Drive link for Infographic posts
    researchReportsUrl: { type: String, required: false }, // Deprecated: Google Drive link for Research Report posts

    tileTemplateId: { type: Schema.Types.ObjectId, ref: 'TileTemplate', required: false },

    // Market Data Documents
    marketDataDocuments: [{ type: Schema.Types.ObjectId, ref: 'MarketData', required: false }],

    // Image URL for post
    imageUrl: { type: String, required: false },

    seoData: {
      seoURL: { type: String, required: false }, 
      metaTitle: { type: String, required: false },
      metaKeyword: { type: String, required: false },
      metaDescription: { type: Boolean, default: false },
      header: {},
      footer: {},
    },
  
}, {timestamps: true})


const Post = model('Post', postSchema)

export default Post