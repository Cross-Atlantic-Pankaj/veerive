import express from 'express'
import cors from 'cors'
import configDB from './config/db.js'
import dotenv from 'dotenv'
import passport from 'passport'
import setupOAuthStrategies from './config/oauthConfig.js'
import oauthRouth from './oauthRoutes.js'
import { checkSchema } from 'express-validator'
import path from 'path'
import {
  userRegisterSchema,
  userLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateEmailSchema
} from './app/validators/user-validator.js';
// import { userLoginSchema, userRegisterSchema } from './app/validators/user-validation-schema.js'
import {authenticateUser, conditionalAuth, checkPasswordExpiry }from './app/middlewares/authenticateUser.js'
import authorizeUser from './app/middlewares/authorizeUser.js'
import registerCltr from './app/controllers/register-cltr.js'
import usersCltr from './app/controllers/users-cltr.js'
import rolesCltr from './app/controllers/roles-cltr.js'
import profilesCltr from './app/controllers/profiles-cltr.js'

import contextsCltr from './app/controllers/contexts-cltr.js'
import postsCltr from './app/controllers/posts-cltr.js'
import postTypesCltr from './app/controllers/postTypes-cltr.js'

import companiesCltr from './app/controllers/companies-cltr.js'
import regionsCltr from './app/controllers/regions-cltr.js'
import countriesCltr from './app/controllers/countries-cltr.js'
import sectorsCltr from './app/controllers/sectors-cltr.js'
import subSectorsCltr from './app/controllers/subSectors-cltr.js'
import signalsCltr from './app/controllers/signals-cltr.js'
import subSignalsCltr from './app/controllers/subSignals-cltr.js'
import sourcesCltr from './app/controllers/sources-cltr.js'
import themesCltr from './app/controllers/themes-cltr.js'
import storyOrdersCltr from './app/controllers/storyOrders-cltr.js'
import { createClarificationGuidance, getAllClarificationGuidance, getAllClarificationGuidances, getOneClarificationGuidance, updateClarificationGuidance, deleteClarificationGuidance } from './app/controllers/clarificationGuidanceController.js';
import { createQueryRefiner, getAllQueryRefiner, getAllQueryRefiners, getOneQueryRefiner, updateQueryRefiner, deleteQueryRefiner } from './app/controllers/queryRefinerController.js';
import { createMarketData, getAllMarketData, getAllMarketDatas, getOneMarketData, updateMarketData, deleteMarketData } from './app/controllers/marketDataController.js';
import User from './app/models/user-model.js';
import bcryptjs from 'bcryptjs';
import ensureSuperAdmin from './utils/superAdmin.js';
import { bulkUploadClarificationGuidance, bulkUploadQueryRefiner, bulkUploadMarketData } from './app/controllers/bulkUploadController.js';
import tileTemplatesCltr from './app/controllers/tileTemplates-cltr.js'
import imageUploadRoutes from './app/routes/imageUploadRoutes.js'
import { uploadSingleImageForMaster } from './utils/s3Upload.js'
import imagesCltr from './app/controllers/images-cltr.js'
import driversCltr from './app/controllers/drivers-cltr.js'

dotenv.config()

const app = express()


// Allow all origins for maximum compatibility
app.use(
  cors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Explicitly allowed HTTP methods
    credentials: true, // Allow cookies or credentials
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'], // Allow headers for secure requests
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // Cache preflight response for 24 hours
  })
);

app.options('*', cors()); // Preflight requests for all routes


// Initialize Passport and OAuth Strategies
setupOAuthStrategies();
app.use(passport.initialize());

// Middleware to parse JSON with increased limit for large PPT files
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))


// User routes
app.post('/api/users/register', conditionalAuth,checkSchema(userRegisterSchema), usersCltr.register);
app.post('/api/users/login', checkPasswordExpiry,checkSchema(userLoginSchema), usersCltr.login);
app.post('/api/users/forgot-password', checkSchema(forgotPasswordSchema), usersCltr.forgotPassword);
app.post('/api/users/reset-password', checkSchema(resetPasswordSchema), usersCltr.resetPassword);
app.put('/api/users/update-password', authenticateUser, checkSchema(updatePasswordSchema), usersCltr.updatePassword);
app.put('/api/users/update-email', authenticateUser, checkSchema(updateEmailSchema), usersCltr.updateEmail);

app.get('/api/users/account', authenticateUser,checkPasswordExpiry, usersCltr.account);
app.get('/api/users/list', authenticateUser, usersCltr.list);
app.put('/api/users/update/:id', authenticateUser, authorizeUser(['Admin']), usersCltr.updateUser);
app.delete('/api/users/:id', authenticateUser, authorizeUser(['Admin']), usersCltr.destroy);
app.put('/api/users/change-role/:id', authenticateUser, authorizeUser(['Admin']), usersCltr.changeRole);

// OAuth Routes
app.use('/api/auth', oauthRouth);

//profile routes
app.get('/api/profiles', authenticateUser, profilesCltr.list)
app.put('/api/profiles/:id', authenticateUser, profilesCltr.update)

// context routes
app.get('/api/contexts', authenticateUser, contextsCltr.list)
//admin routes
app.get('/api/admin/contexts', authenticateUser, contextsCltr.list)
app.get('/api/admin/contexts/:id', authenticateUser, contextsCltr.show)
app.get('/api/admin/posts/:postId/contexts', authenticateUser, contextsCltr.postContext)
// Secure endpoints without ObjectIDs in URLs
app.post('/api/admin/contexts/by-post', authenticateUser, contextsCltr.getContextsByPost)
app.post('/api/admin/contexts', authenticateUser, contextsCltr.create)
app.put('/api/admin/contexts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), contextsCltr.update)
app.put('/api/admin/contexts/:contextId/postId', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), contextsCltr.updatePostId) // for updating postId in context when a post is saved
app.delete('/api/admin/contexts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), contextsCltr.delete)
// ✅ Route for fetching all posts (for Context Form)
app.get('/api/admin/posts/all', authenticateUser, postsCltr.getAllPosts);
// ✅ Route for fetching a single post by ID
app.get('/api/admin/posts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), postsCltr.getOne);

// ✅ Route for fetching all contexts (for Post Form)
app.get('/api/admin/contexts/all', authenticateUser, contextsCltr.getAllContexts);

// post routes
app.get('/api/posts', authenticateUser, postsCltr.list)
//admin routes
app.get('/api/admin/posts', authenticateUser, postsCltr.list)
app.get('/api/admin/posts/date', authenticateUser, postsCltr.date)
app.post('/api/admin/posts', authenticateUser, postsCltr.create)
app.put('/api/admin/posts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), postsCltr.update)
app.delete('/api/admin/posts/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), postsCltr.delete)

// post-type routes
app.get('/api/post-types', authenticateUser, postTypesCltr.list)
//admin routes
app.get('/api/admin/post-types', authenticateUser, postTypesCltr.list)
app.post('/api/admin/post-types', authenticateUser, postTypesCltr.create)
app.put('/api/admin/post-types/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), postTypesCltr.update)
app.delete('/api/admin/post-types/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), postTypesCltr.delete)

// Themes routes (Accessible by authenticated users)
app.get('/api/themes', authenticateUser, themesCltr.list); // Paginated themes
app.get('/api/themes/all', authenticateUser, themesCltr.getAllThemes); // All themes (no pagination)
app.get('/api/themes/:id', authenticateUser, themesCltr.getOne); // Get single theme

// Admin routes (GET only, open to all authenticated users)
app.get('/api/admin/themes', authenticateUser, themesCltr.list); // Paginated themes
app.get('/api/admin/themes/all', authenticateUser, themesCltr.getAllThemes); // All themes (no pagination)
app.get('/api/admin/themes/:id', authenticateUser, themesCltr.getOne); // Get single theme

app.post('/api/admin/themes', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), themesCltr.create)
app.put('/api/admin/themes/:id', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), themesCltr.update)
app.delete('/api/admin/themes/:id', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), themesCltr.delete)

// Tile Templates routes (Admin only)
app.get('/api/admin/tile-templates', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), tileTemplatesCltr.list);
app.post('/api/admin/tile-templates', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), tileTemplatesCltr.create);
app.get('/api/admin/tile-templates/:id', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), tileTemplatesCltr.show);
app.put('/api/admin/tile-templates/:id', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), tileTemplatesCltr.update);
app.delete('/api/admin/tile-templates/:id', authenticateUser, authorizeUser(['Admin', 'SuperAdmin']), tileTemplatesCltr.destroy);

//company routes
app.get('/api/companies', authenticateUser, companiesCltr.list)

//admin routes
app.get('/api/admin/companies', authenticateUser, companiesCltr.list)
app.post('/api/admin/companies', authenticateUser, companiesCltr.create)
app.put('/api/admin/companies/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), companiesCltr.update)
app.delete('/api/admin/companies/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), companiesCltr.delete)

// region routes
app.get('/api/regions', authenticateUser, regionsCltr.list)

//admin routes
app.get('/api/admin/regions', authenticateUser, regionsCltr.list)
app.post('/api/admin/regions', authenticateUser, regionsCltr.create)
app.put('/api/admin/regions/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), regionsCltr.update)
app.delete('/api/admin/regions/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), regionsCltr.delete)

// country routes
app.get('/api/countries', authenticateUser, countriesCltr.list)

//admin routes
app.get('/api/admin/countries', authenticateUser, countriesCltr.list)
app.post('/api/admin/countries', authenticateUser, countriesCltr.create)
app.put('/api/admin/countries/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), countriesCltr.update)
app.delete('/api/admin/countries/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), countriesCltr.delete)

// sector routes
app.get('/api/sectors', authenticateUser, sectorsCltr.list)

//admin routes
app.get('/api/admin/sectors', authenticateUser, sectorsCltr.list)
app.post('/api/admin/sectors', authenticateUser, sectorsCltr.create)
app.put('/api/admin/sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), sectorsCltr.update)
app.delete('/api/admin/sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), sectorsCltr.delete)

// sub-sector routes
app.get('/api/sub-sectors', authenticateUser, subSectorsCltr.list)

//admin routes
app.get('/api/admin/sub-sectors', authenticateUser, subSectorsCltr.list)
app.post('/api/admin/sub-sectors', authenticateUser, subSectorsCltr.create)
app.put('/api/admin/sub-sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), subSectorsCltr.update)
app.delete('/api/admin/sub-sectors/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), subSectorsCltr.delete)

// source routes
app.get('/api/sources', authenticateUser, sourcesCltr.list)

//admin routes
app.get('/api/admin/sources', authenticateUser, sourcesCltr.list)
app.post('/api/admin/sources', authenticateUser, sourcesCltr.create)
app.put('/api/admin/sources/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), sourcesCltr.update)
app.delete('/api/admin/sources/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), sourcesCltr.delete)

// signal routes
app.get('/api/signals', authenticateUser, signalsCltr.list)

//admin routes
app.get('/api/admin/signals', authenticateUser, signalsCltr.list)
app.post('/api/admin/signals', authenticateUser, signalsCltr.create)
app.put('/api/admin/signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), signalsCltr.update)
app.delete('/api/admin/signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), signalsCltr.delete)

// sub-signal routes
app.get('/api/sub-signals', authenticateUser, subSignalsCltr.list)

//admin routes
app.get('/api/admin/sub-signals', authenticateUser, subSignalsCltr.list)
app.post('/api/admin/sub-signals', authenticateUser, subSignalsCltr.create)
app.put('/api/admin/sub-signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), subSignalsCltr.update)
app.delete('/api/admin/sub-signals/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), subSignalsCltr.delete)

// source routes
app.get('/api/story-orders', authenticateUser, storyOrdersCltr.list)

//admin routes
app.get('/api/admin/story-orders', authenticateUser, storyOrdersCltr.list)
app.post('/api/admin/story-orders', authenticateUser, storyOrdersCltr.create)
app.put('/api/admin/story-orders/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), storyOrdersCltr.update)
app.delete('/api/admin/story-orders/:id', authenticateUser, authorizeUser(['Admin', 'Moderator', 'SuperAdmin']), storyOrdersCltr.delete)

// ClarificationGuidance routes
app.post('/api/admin/clarification-guidance', authenticateUser, createClarificationGuidance);
app.get('/api/admin/clarification-guidance', authenticateUser, getAllClarificationGuidance);
app.get('/api/admin/clarification-guidance/all', authenticateUser, getAllClarificationGuidances);
app.get('/api/admin/clarification-guidance/:id', authenticateUser, getOneClarificationGuidance);
app.put('/api/admin/clarification-guidance/:id', authenticateUser, updateClarificationGuidance);
app.delete('/api/admin/clarification-guidance/:id', authenticateUser, deleteClarificationGuidance);

// QueryRefiner routes
app.post('/api/admin/query-refiner', authenticateUser, createQueryRefiner);
app.get('/api/admin/query-refiner', authenticateUser, getAllQueryRefiner);
app.get('/api/admin/query-refiner/all', authenticateUser, getAllQueryRefiners);
app.get('/api/admin/query-refiner/:id', authenticateUser, getOneQueryRefiner);
app.put('/api/admin/query-refiner/:id', authenticateUser, updateQueryRefiner);
app.delete('/api/admin/query-refiner/:id', authenticateUser, deleteQueryRefiner);

// MarketData routes
app.post('/api/admin/market-data', authenticateUser, createMarketData);
app.get('/api/admin/market-data', authenticateUser, getAllMarketData);
app.get('/api/admin/market-data/all', authenticateUser, getAllMarketDatas);
app.get('/api/admin/market-data/:id', authenticateUser, getOneMarketData);
app.put('/api/admin/market-data/:id', authenticateUser, updateMarketData);
app.delete('/api/admin/market-data/:id', authenticateUser, deleteMarketData);

// Bulk upload routes
app.post('/api/admin/clarification-guidance/bulk', authenticateUser, authorizeUser(['admin']), bulkUploadClarificationGuidance);
app.post('/api/admin/query-refiner/bulk', authenticateUser, authorizeUser(['admin']), bulkUploadQueryRefiner);
app.post('/api/admin/market-data/bulk', authenticateUser, authorizeUser(['admin']), bulkUploadMarketData);

// Image upload routes
app.use('/api/images', imageUploadRoutes);

// Images CRUD (metadata records)
app.get('/api/admin/images', authenticateUser, imagesCltr.list)
app.post('/api/admin/images', authenticateUser, authorizeUser(['Admin','SuperAdmin']), imagesCltr.create)
app.put('/api/admin/images/:id', authenticateUser, authorizeUser(['Admin','SuperAdmin']), imagesCltr.update)
app.delete('/api/admin/images/:id', authenticateUser, authorizeUser(['Admin','SuperAdmin']), imagesCltr.delete)

// Image upload for Images master page (dedicated S3 directory)
app.post('/api/admin/images/upload', 
    authenticateUser, 
    authorizeUser(['Admin','SuperAdmin']),
    uploadSingleImageForMaster('image'),
    imagesCltr.upload
)

// Drivers CRUD (metadata records)
app.get('/api/admin/drivers', authenticateUser, driversCltr.list)
app.post('/api/admin/drivers', authenticateUser, authorizeUser(['Admin','SuperAdmin']), driversCltr.create)
app.put('/api/admin/drivers/:id', authenticateUser, authorizeUser(['Admin','SuperAdmin']), driversCltr.update)
app.delete('/api/admin/drivers/:id', authenticateUser, authorizeUser(['Admin','SuperAdmin']), driversCltr.delete)

// Route to serve data deletion instructions
app.get('/data-deletion.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'data-deletion.html'));
});

app.get('/api/admin/contexts/edit-data', authenticateUser, contextsCltr.getEditContextData);

const port = process.env.PORT || 3050

// Initialize database and start server
configDB()
  .then(() => {
    console.log('Database connected successfully');
    return ensureSuperAdmin();
  })
  .then(() => {
    console.log('SuperAdmin ensured successfully');
    
    // Start server only after database is connected
    app.listen(port, () => {
      console.log('Server is running on port', port);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
