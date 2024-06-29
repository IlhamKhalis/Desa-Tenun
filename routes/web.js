const express = require('express');
const csrf = require('csurf');
const multer = require('multer');
const upload = multer({ dest: 'image/' });
const router = express.Router();
const HomeController = require('../app/controllers/HomeController');
const AuthController = require('../app/controllers/AuthController');

const csrfProtection = csrf({ cookie: true });

router.get('/', AuthController.home);
router.get('/home-en', AuthController.homeen);
router.get('/info', AuthController.infoPage);
router.get('/info-en', AuthController.infoPageen);
router.get('/gallery', AuthController.galleryPage);
router.get('/gallery-en', AuthController.galleryPageen);
router.get('/shop', AuthController.shopPage);
router.get('/shop-en', AuthController.shopPageen);
router.get('/faqs', HomeController.faqsPage);
router.get('/faqs-en', HomeController.faqsPageen);
router.get('/dashboard', AuthController.dashboard);
router.get('/admin-gallery', AuthController.galleryAdmin);
router.get('/login', AuthController.loginPage);

router.post('/login', csrfProtection, AuthController.login);
router.post('/logout', csrfProtection, AuthController.logout);
router.post('/update-item', csrfProtection, AuthController.updateShop);
router.post('/update-event', csrfProtection, AuthController.updateEvent);
router.post('/create-event', csrfProtection, AuthController.createEvent);
router.post('/create-shop', csrfProtection, AuthController.createShop);
router.post('/create-gallery', csrfProtection, AuthController.createGallery);
router.post('/delete-event/:id', csrfProtection, AuthController.deleteEvent);
router.post('/delete-item/:id', csrfProtection, AuthController.deleteShop);
router.post('/delete-gallery/:id', csrfProtection, AuthController.deleteGallery);

module.exports = router;
