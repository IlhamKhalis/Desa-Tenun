const path = require('path');
// load dependencies
const env = require('dotenv');
const csrf = require('csurf');
const multer = require('multer')
const express = require('express');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressHbs = require('express-handlebars');
const SequelizeStore = require("connect-session-sequelize")(session.Store); // initalize sequelize with session store
const editor = require ('./app/controllers/AuthController')

const app = express();
const csrfProtection = csrf();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/assets/images')); // Tentukan direktori penyimpanan gambar
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Atur nama file yang diunggah
    }
});

const upload = multer({ storage: storage });

// Middleware untuk pengunggahan file
app.post('/create-event', upload.single('image'), editor.createEvent);
app.post('/create-shop', upload.single('image'), editor.createShop);
app.post('/create-gallery', upload.single('image'), editor.createGallery)
app.post('/update-item', upload.single('image'), editor.updateShop);
app.post('/update-event',upload.single('image'), editor.updateEvent)
app.post('/delete-item:id', editor.deleteShop);
app.post('/delete-event:id', editor.deleteEvent);
app.post('/delete-gallery/:id', editor.deleteGallery);


//Loading Routes	
const webRoutes = require('./routes/web');
const sequelize = require('./config/database');
const errorController = require('./app/controllers/ErrorController');

env.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// required for csurf
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  	cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new SequelizeStore({
    	db: sequelize,
    	table: "sessions",
    }),
}));

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.engine(
	'hbs',
	expressHbs({
		layoutsDir: 'views/layouts/',
		defaultLayout: 'web_layout',
		extname: 'hbs'
	})
);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(webRoutes);
app.use(errorController.pageNotFound);
sequelize
	//.sync({force : true})
	.sync()
	.then(() => {
		app.listen(process.env.PORT);
		//pending set timezone
		console.log("App listening on port " + process.env.PORT);
	})
	.catch(err => {
		console.log(err);
	});