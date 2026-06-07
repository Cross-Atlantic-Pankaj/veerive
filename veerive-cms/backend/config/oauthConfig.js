// import passport from 'passport';
// import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
// import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
// import { Strategy as TwitterStrategy } from 'passport-twitter';
// import User from '../app/models/user-model.js';

// const setupOAuthStrategies = () => {
//     // Google OAuth Strategy
//     passport.use(
//         new GoogleStrategy(
//             {
//                 clientID: process.env.GOOGLE_CLIENT_ID,
//                 clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//                 callbackURL: process.env.GOOGLE_CALLBACK_URL,
//             },
//             async (accessToken, refreshToken, profile, done) => {
//                 try {
//                     let user = await User.findOne({ email: profile.emails[0].value });
//                     if (!user) {
//                         user = new User({
//                             name: profile.displayName,
//                             email: profile.emails[0].value,
//                             role: 'User',
//                         });
//                         await user.save();
//                     }
//                     done(null, user);
//                 } catch (err) {
//                     console.error('Error during Google OAuth:', err);
//                     done(err, null);
//                 }
//             }
//         )
//     );

//     // Facebook OAuth Strategy
//     passport.use(
//         new FacebookStrategy(
//             {
//                 clientID: process.env.FACEBOOK_CLIENT_ID,
//                 clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//                 callbackURL: process.env.FACEBOOK_CALLBACK_URL,
//                 profileFields: ['id', 'displayName', 'emails'], // Ensure emails are included
//             },
//             async (accessToken, refreshToken, profile, done) => {
//                 try {
//                     let user = await User.findOne({ email: profile.emails[0].value });
//                     if (!user) {
//                         user = new User({
//                             name: profile.displayName,
//                             email: profile.emails[0].value,
//                             role: 'User',
//                         });
//                         await user.save();
//                     }
//                     done(null, user);
//                 } catch (err) {
//                     console.error('Error during Facebook OAuth:', err);
//                     done(err, null);
//                 }
//             }
//         )
//     );

//     // LinkedIn OAuth Strategy
//     passport.use(
//         new LinkedInStrategy(
//             {
//                 clientID: process.env.LINKEDIN_CLIENT_ID,
//                 clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
//                 callbackURL: process.env.LINKEDIN_CALLBACK_URL,
//                 scope: ['r_emailaddress', 'r_liteprofile'], // Requesting email and profile
//             },
//             async (accessToken, refreshToken, profile, done) => {
//                 try {
//                     let user = await User.findOne({ email: profile.emails[0].value });
//                     if (!user) {
//                         user = new User({
//                             name: profile.displayName,
//                             email: profile.emails[0].value,
//                             role: 'User',
//                         });
//                         await user.save();
//                     }
//                     done(null, user);
//                 } catch (err) {
//                     console.error('Error during LinkedIn OAuth:', err);
//                     done(err, null);
//                 }
//             }
//         )
//     );

//     // Twitter OAuth Strategy
//     passport.use(
//         new TwitterStrategy(
//             {
//                 consumerKey: process.env.TWITTER_CONSUMER_KEY,
//                 consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//                 callbackURL: process.env.TWITTER_CALLBACK_URL,
//                 includeEmail: true, // Ensure email is requested
//             },
//             async (token, tokenSecret, profile, done) => {
//                 try {
//                     let email = profile.emails?.[0]?.value || `${profile.username}@twitter.com`;
//                     let user = await User.findOne({ email });
//                     if (!user) {
//                         user = new User({
//                             name: profile.displayName,
//                             email,
//                             role: 'User',
//                         });
//                         await user.save();
//                     }
//                     done(null, user);
//                 } catch (err) {
//                     console.error('Error during Twitter OAuth:', err);
//                     done(err, null);
//                 }
//             }
//         )
//     );

//     // Serialization and Deserialization
//     passport.serializeUser((user, done) => done(null, user.id));
//     passport.deserializeUser(async (id, done) => {
//         try {
//             const user = await User.findById(id);
//             done(null, user);
//         } catch (err) {
//             done(err, null);
//         }
//     });
// };

// export default setupOAuthStrategies;
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
// import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
// import { Strategy as TwitterStrategy } from 'passport-twitter';
import User from '../app/models/user-model.js';

const setupOAuthStrategies = () => {
    // Google OAuth Strategy (only register when credentials are configured)
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ email: profile.emails[0].value });
                    if (!user) {
                        user = new User({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            provider: 'google', // Set provider to 'google'
                            role: 'User',
                        });
                        await user.save();
                    }
                    done(null, user);
                } catch (err) {
                    console.error('Error during Google OAuth:', err);
                    done(err, null);
                }
            }
        )
    );
    } else {
        console.warn('Google OAuth not configured (GOOGLE_CLIENT_ID/SECRET missing) — skipping strategy.');
    }

    // Facebook OAuth Strategy (only register when credentials are configured)
    if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_CLIENT_ID,
                clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL,
                profileFields: ['id', 'displayName', 'emails'], // Ensure emails are included
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await User.findOne({ email: profile.emails[0].value });
                    if (!user) {
                        user = new User({
                            name: profile.displayName,
                            email: profile.emails[0].value,
                            provider: 'facebook', // Set provider to 'facebook'
                            role: 'User',
                        });
                        await user.save();
                    }
                    done(null, user);
                } catch (err) {
                    console.error('Error during Facebook OAuth:', err);
                    done(err, null);
                }
            }
        )
    );
    } else {
        console.warn('Facebook OAuth not configured (FACEBOOK_CLIENT_ID/SECRET missing) — skipping strategy.');
    }

    // // LinkedIn OAuth Strategy
    // passport.use(
    //     new LinkedInStrategy(
    //         {
    //             clientID: process.env.LINKEDIN_CLIENT_ID,
    //             clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    //             callbackURL: process.env.LINKEDIN_CALLBACK_URL,
    //             scope: ['r_emailaddress', 'r_liteprofile'],
    //         },
    //         async (accessToken, refreshToken, profile, done) => {
    //             try {
    //                 let user = await User.findOne({ email: profile.emails[0].value });
    //                 if (!user) {
    //                     user = new User({
    //                         name: profile.displayName,
    //                         email: profile.emails[0].value,
    //                         provider: 'linkedin', // Set provider to 'linkedin'
    //                         role: 'User',
    //                     });
    //                     await user.save();
    //                 }
    //                 done(null, user);
    //             } catch (err) {
    //                 console.error('Error during LinkedIn OAuth:', err);
    //                 done(err, null);
    //             }
    //         }
    //     )
    // );

    // // Twitter OAuth Strategy
    // passport.use(
    //     new TwitterStrategy(
    //         {
    //             consumerKey: process.env.TWITTER_CONSUMER_KEY,
    //             consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    //             callbackURL: process.env.TWITTER_CALLBACK_URL,
    //             includeEmail: true, // Ensure email is requested
    //         },
    //         async (token, tokenSecret, profile, done) => {
    //             try {
    //                 let email = profile.emails?.[0]?.value || `${profile.username}@twitter.com`;
    //                 let user = await User.findOne({ email });
    //                 if (!user) {
    //                     user = new User({
    //                         name: profile.displayName,
    //                         email,
    //                         provider: 'twitter', // Set provider to 'twitter'
    //                         role: 'User',
    //                     });
    //                     await user.save();
    //                 }
    //                 done(null, user);
    //             } catch (err) {
    //                 console.error('Error during Twitter OAuth:', err);
    //                 done(err, null);
    //             }
    //         }
    //     )
    // );

    // Serialization and Deserialization
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });
};

export default setupOAuthStrategies;
