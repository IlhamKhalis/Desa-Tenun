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
router.get('/history', HomeController.historyPage);
router.get('/history-en', HomeController.historyPageen);
router.get('/faqs', HomeController.faqsPage);
router.get('/faqs-en', HomeController.faqsPageen);
router.get('/dashboard', AuthController.dashboard);
router.get('/admin-gallery', AuthController.galleryAdmin);
router.get('/login', AuthController.loginPage);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/update-item', AuthController.updateShop);
router.post('/update-event', AuthController.updateEvent);
router.post('/create-event', AuthController.createEvent);
router.post('/create-shop', AuthController.createShop);
router.post('/create-gallery', AuthController.createGallery);
router.post('/delete-event/:id', AuthController.deleteEvent);
router.post('/delete-item/:id', AuthController.deleteShop);
router.post('/delete-gallery/:id', AuthController.deleteGallery);

module.exports = router;
