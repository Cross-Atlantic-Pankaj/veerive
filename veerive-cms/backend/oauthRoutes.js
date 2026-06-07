// import express from 'express';
// import passport from 'passport';
// import jwt from 'jsonwebtoken';

// const router = express.Router();

// // Generate JWT Token
// const generateToken = (user) => {
//     return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
// };

// // Google OAuth Routes
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get(
//     '/google/callback',
//     passport.authenticate('google', { session: false }),
//     (req, res) => {
//         const token = generateToken(req.user);
//         res.redirect(`/auth-success?token=${token}`); // Redirect to frontend with token
//     }
// );

// // Facebook OAuth Routes
// router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
// router.get(
//     '/facebook/callback',
//     passport.authenticate('facebook', { session: false }),
//     (req, res) => {
//         const token = generateToken(req.user);
//         res.redirect(`/auth-success?token=${token}`);
//     }
// );

// // LinkedIn OAuth Routes
// router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
// router.get(
//     '/linkedin/callback',
//     passport.authenticate('linkedin', { session: false }),
//     (req, res) => {
//         const token = generateToken(req.user);
//         res.redirect(`/auth-success?token=${token}`);
//     }
// );

// // Twitter OAuth Routes
// router.get('/twitter', passport.authenticate('twitter'));
// router.get(
//     '/twitter/callback',
//     passport.authenticate('twitter', { session: false }),
//     (req, res) => {
//         const token = generateToken(req.user);
//         res.redirect(`/auth-success?token=${token}`);
//     }
// );

// export default router;
import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.status(200).json({
            message: 'Google authentication successful',
            token,
            user: req.user, // User details
        });
    }
);

// Facebook OAuth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false }),
    (req, res) => {
        const token = generateToken(req.user);
        res.status(200).json({
            message: 'Facebook authentication successful',
            token,
            user: req.user, // User details
        });
    }
);

// LinkedIn OAuth Routes
// router.get('/linkedin', passport.authenticate('linkedin', { scope: ['r_emailaddress', 'r_liteprofile'] }));
// router.get(
//     '/linkedin/callback',
//     passport.authenticate('linkedin', { session: false }),
//     (req, res) => {
//         const token = generateToken(req.user);
//         res.status(200).json({
//             message: 'LinkedIn authentication successful',
//             token,
//             user: req.user, // User details
//         });
//     }
// );

// // Twitter OAuth Routes
// router.get('/twitter', passport.authenticate('twitter'));
// router.get(
//     '/twitter/callback',
//     passport.authenticate('twitter', { session: false }),
//     (req, res) => {
//         const token = generateToken(req.user);
//         res.status(200).json({
//             message: 'Twitter authentication successful',
//             token,
//             user: req.user, // User details
//         });
//     }
// );

 export default router;
