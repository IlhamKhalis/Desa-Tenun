const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const Session = require('../models/Session');
const Shop = require('../models/shop');
const Event = require('../models/event');
const Gallery = require('../models/gallery');

const message = (req) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}
	return message;
};

const oldInput = (req) => {
	let oldInput = req.flash('oldInput');
	if (oldInput.length > 0) {
		oldInput = oldInput[0];
	} else {
		oldInput = null;
	}
	return oldInput;
};

exports.loginPage = async (req, res, next) => {
	if (res.locals.isAuthenticated) {
		res.redirect('/');
	} else {
		res.render('login', { layout: 'login_layout', loginPage: true, pageTitle: 'Login', errorMessage: message(req), oldInput: oldInput(req) });
	}
};

exports.login = (req, res, next) => {
	const validationErrors = [];
	if (!validator.isEmail(req.body.inputEmail)) validationErrors.push('Silakan masukkan alamat email yang valid.');
	if (validator.isEmpty(req.body.inputPassword)) validationErrors.push('Kata sandi tidak boleh kosong.');
	if (validationErrors.length) {
		req.flash('error', validationErrors);
		return res.redirect('/login');
	}
	User.findOne({
		where: {
			email: req.body.inputEmail
		}
	}).then(user => {
		if (user) {
			bcrypt
				.compare(req.body.inputPassword, user.password)
				.then(doMatch => {
					if (doMatch) {
						req.session.isLoggedIn = true;
						req.session.user = user.dataValues;
						return req.session.save(err => {
							console.log(err);
							res.redirect('/dashboard');
						});
					}
					req.flash('error', 'Email atau kata sandi tidak valid.');
					req.flash('oldInput', { email: req.body.inputEmail });
					return res.redirect('/login');
				})
				.catch(err => {
					console.log(err);
					req.flash('error', 'Maaf! Terjadi kesalahan.');
					req.flash('oldInput', { email: req.body.inputEmail });
					return res.redirect('/login');
				});
		} else {
			req.flash('error', 'Tidak ada pengguna yang ditemukan dengan email ini.');
			req.flash('oldInput', { email: req.body.inputEmail });
			return res.redirect('/login');
		}
	})
	.catch(err => console.log(err));
};

exports.logout = (req, res, next) => {
	if (res.locals.isAuthenticated) {
		req.session.destroy(err => {
			return res.redirect('/');
		});
	} else {
		return res.redirect('/login');
	}
};

exports.signUpPage = (req, res, next) => {
	res.render('sign_up', { layout: 'login_layout', signUpPage: true, errorMessage: message(req), oldInput: oldInput(req) });
};

exports.signUp = (req, res, next) => {
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if (!user) {
			return bcrypt
				.hash(req.body.password, 12)
				.then(hashedPassword => {
					const user = new User({
						fullName: req.body.name,
						email: req.body.email,
						password: hashedPassword,
					});
					return user.save();
				})
				.then(result => {
					return res.redirect('/login');
				});
		} else {
			req.flash('error', 'Email sudah ada, silakan pilih yang lain.');
			req.flash('oldInput', { name: req.body.name });
			return res.redirect('/sign-up');
		}
	})
	.catch(err => console.log(err));
};

exports.forgotPasswordPage = (req, res, next) => {
	if (res.locals.isAuthenticated) {
		return res.redirect('/');
	} else {
		return res.render('forgot_password', { layout: 'login_layout', loginPage: true, pageTitle: 'Lupa Kata Sandi', errorMessage: message(req), oldInput: oldInput(req) });
	}
};

exports.forgotPassword = (req, res, next) => {
	const validationErrors = [];
	if (!validator.isEmail(req.body.email)) validationErrors.push('Silakan masukkan alamat email yang valid.');

	if (validationErrors.length) {
		req.flash('error', validationErrors);
		return res.redirect('/forgot-password');
	}
	crypto.randomBytes(32, (err, buffer) => {
		if (err) {
			console.log(err);
			return res.redirect('/forgot-password');
		}
		const token = buffer.toString('hex');
		User.findOne({
			where: {
				email: req.body.email
			}
		})
		.then(user => {
			if (!user) {
				req.flash('error', 'Tidak ada pengguna yang ditemukan dengan email tersebut.');
				return res.redirect('/forgot-password');
			}
			user.resetToken = token;
			user.resetTokenExpiry = Date.now() + 3600000;
			return user.save();
		}).then(result => {
			if (result) return res.redirect('/resetlink');
		}).catch(err => { console.log(err); });
	});
};

const dataShop = async () => {
	try {
		const shops = await Shop.findAll();
		return shops;
	} catch (err) {
		throw new Error(`Error in getAllData: ${err.message}`);
	}
};

const dataEvent = async () => {
	try {
		const event = await Event.findAll();
		return event;
	} catch (err) {
		throw new Error(`Error in getAllData: ${err.message}`);
	}
};

const dataGallery = async () => {
	try {
		const gallery = await Gallery.findAll();
		return gallery;
	} catch (err) {
		throw new Error(`Error in getAllData: ${err.message}`);
	}
};

exports.infoPage = async (req, res, next) => {
	try {
		const events = await dataEvent();
		res.render('info', {
			layout: 'web_layout_1',
			events: events,
		});
	} catch (err) {
		console.error(`Error in infoPage: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.infoPageen = async (req, res, next) => {
	try {
		const events = await dataEvent();
		res.render('info_en', {
			layout: 'layout_en_1',
			events: events,
		});
	} catch (err) {
		console.error(`Error in infoPageen: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.galleryPage = async (req, res, next) => {
	try {
		const gallery = await dataGallery();
		res.render('gallery', {
			layout: 'web_layout_1',
			gallery: gallery,
		});
	} catch (err) {
		console.error(`Error in galleryPage: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.galleryPageen = async (req, res, next) => {
	try {
		const gallery = await dataGallery();
		res.render('gallery_en', {
			layout: 'layout_en_1',
			gallery: gallery,
		});
	} catch (err) {
		console.error(`Error in galleryPageen: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.shopPage = async (req, res, next) => {
	try {
		const shops = await dataShop();
		
		// Format prices
		shops.forEach(shop => {
			shop.dataValues.formattedPrice = shop.dataValues.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		});

		res.render('shop', {
			layout: 'web_layout_1',
			shops: shops,
		});
	} catch (err) {
		console.error(`Error in shopPage: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.shopPageen = async (req, res, next) => {
	try {
		const shops = await dataShop();
		
		// Format prices
		shops.forEach(shop => {
			shop.dataValues.formattedPrice = shop.dataValues.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		});

		res.render('shop_en', {
			layout: 'layout_en_1',
			shops: shops,
			title: 'Nama Toko'
		});
	} catch (err) {
		console.error(`Error in shopPageen: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.dashboard = async (req, res, next) => {
	if (res.locals.isAuthenticated) {
		try {
			const shops = await dataShop();
			const events = await dataEvent();
			const gallerys = await dataGallery();
			res.render('dashboard', {
				layout: 'admin_layout',
				shops,
				events,
				gallerys,
				title: 'Dashboard'
			});
		} catch (err) {
			console.error(`Error in Dashboard: ${err.message}`);
			res.status(500).json({ error: err.message });
		}
	} else {
		res.render('login', { layout: 'login_layout', loginPage: true, pageTitle: 'Login', errorMessage: message(req), oldInput: oldInput(req) });
	}
};

exports.galleryAdmin = async (req, res, next) => {
	try {
		const gallery = await dataGallery();
		res.render('admin-gallery', {
			layout: 'admin_layout',
			gallery,
		});
	} catch (err) {
		console.error(`Error in gallery admin: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.home = async (req, res, next) => {
	try {
		const shops = await dataShop();
		const events = await dataEvent();
		const gallery = await dataGallery();

		// Format prices
		shops.forEach(shop => {
			shop.dataValues.formattedPrice = shop.dataValues.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		});

		res.render('home', {
			shops,
			events,
			gallery,
		});
	} catch (err) {
		console.error(`Error in home: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.homeen = async (req, res, next) => {
	try {
		const shops = await dataShop();
		const events = await dataEvent();
		const gallery = await dataGallery();
		
		// Format prices
		shops.forEach(shop => {
			shop.dataValues.formattedPrice = shop.dataValues.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		});

		res.render('home_en', {
			layout: 'layout_en',
			shops,
			events,
			gallery,
		});
	} catch (err) {
		console.error(`Error in home: ${err.message}`);
		res.status(500).json({ error: err.message });
	}
};

exports.getCreateEventPage = (req, res) => {
	res.render('create-event', { csrfToken: req.csrfToken() });
};

exports.getCreateItemPage = (req, res) => {
	res.render('create-item', { csrfToken: req.csrfToken() });
};

exports.getCreateGalleryPage = (req, res) => {
	res.render('create-gallery', { csrfToken: req.csrfToken() });
};

exports.getUpdateShopPage = async (req, res) => {
	const shopId = req.params.id;
	try {
		const shop = await Shop.findByPk(shopId);
		if (!shop) {
			return res.status(404).send('Toko tidak ditemukan');
		}
		res.render('update-item', { shop, csrfToken: req.csrfToken() });
	} catch (err) {
		console.error('Error fetching shop:', err);
		res.status(500).send('Terjadi kesalahan saat mengambil data toko');
	}
};

exports.getDeleteItem = async (req, res) => {
	const shopId = req.params.id;
	try {
		const shop = await Shop.findByPk(shopId);
		if (!shop) {
			return res.status(404).send('Toko tidak ditemukan');
		}
		res.render('delete-item/:id', { shop, csrfToken: req.csrfToken() });
	} catch (err) {
		console.error('Error fetching shop:', err);
		res.status(500).send('Terjadi kesalahan saat mengambil data toko');
	}
};

exports.getUpdateEventPage = async (req, res) => {
	const eventId = req.params.id;
	try {
		const event = await Event.findByPk(eventId);
		if (!event) {
			return res.status(404).send('Event tidak ditemukan');
		}
		res.render('update-event/:id', { event, csrfToken: req.csrfToken() });
	} catch (err) {
		console.error('Error fetching event:', err);
		res.status(500).send('Terjadi kesalahan saat mengambil data event');
	}
};

exports.getDeleteEvent = async (req, res) => {
	const eventId = req.params.id;
	try {
		const event = await Event.findByPk(eventId);
		if (!event) {
			return res.status(404).send('Event tidak ditemukan');
		}
		res.render('delete-event/:id', { event, csrfToken: req.csrfToken() });
	} catch (err) {
		console.error('Error fetching event:', err);
		res.status(500).send('Terjadi kesalahan saat mengambil data event');
	}
};

exports.createEvent = async (req, res) => {
	const { title, titleen, descriptionid, descriptionen } = req.body;
	const image = req.file ? req.file.filename : null;
	try {
		const newEvent = await Event.create({
			title,
			titleen,
			descriptionid,
			descriptionen,
			image
		});
		console.log('Event baru telah ditambahkan:');
		console.log(newEvent.toJSON());
		res.redirect('/dashboard');
	} catch (error) {
		console.error('Gagal menambahkan event:', error);
		res.status(500).json({ error: 'Gagal menambahkan event', message: error.message });
	}
};

exports.createShop = async (req, res) => {
	const { name, description, descriptionen, price, link1, link2 } = req.body;
	const image = req.file ? req.file.filename : null;
	try {
		const newShop = await Shop.create({
			name,
			description,
			descriptionen,
			price,
			link1,
			link2,
			image
		});
		console.log('Toko baru telah ditambahkan:');
		console.log(newShop.toJSON());
		res.redirect('/dashboard');
	} catch (error) {
		console.error('Gagal menambahkan toko:', error);
		res.status(500).json({ error: 'Gagal menambahkan toko', message: error.message });
	}
};

exports.createGallery = async (req, res) => {
	const { title, titleen, descriptionid, descriptionen } = req.body;
	const image = req.file ? req.file.filename : null;
	try {
		const newGallery = await Gallery.create({
			title,
			titleen,
			image,
			descriptionid,
			descriptionen
		});
		console.log(newGallery.toJSON());
		res.redirect('/admin-gallery');
	} catch (error) {
		console.error('Gagal menambahkan foto:', error);
		res.status(500).json({ error: 'Gagal menambahkan foto', message: error.message });
	}
};

exports.updateShop = async (req, res) => {
	const shopId = req.body.id;
	const { name, description, descriptionen, price, link1, link2 } = req.body;
	const imageUrl = req.file ? req.file.filename : null;

	if (!shopId) {
		return res.status(400).send('ID Toko diperlukan');
	}

	try {
		const shop = await Shop.findByPk(shopId);
		if (!shop) {
			return res.status(404).send('Toko tidak ditemukan');
		}

		if (name) shop.name = name;
		if (description) shop.description = description;
		if (descriptionen) shop.descriptionen = descriptionen;
		if (price) shop.price = price;
		if (link1) shop.link1 = link1;
		if (link2) shop.link2 = link2;
		if (imageUrl) shop.image = imageUrl;

		await shop.save();
		res.redirect('/dashboard');
	} catch (err) {
		console.error('Terjadi kesalahan saat mengupdate toko:', err);
		res.status(500).send('Terjadi kesalahan saat mengupdate toko');
	}
};

exports.updateEvent = async (req, res) => {
	const eventId = req.body.id;
	const { title, titleen, descriptionid, descriptionen, date } = req.body;
	const imageUrl = req.file ? req.file.filename : null;

	if (!eventId) {
		return res.status(400).send('ID Event diperlukan');
	}

	try {
		const event = await Event.findByPk(eventId);
		if (!event) {
			return res.status(404).send('Event tidak ditemukan');
		}

		if (title) event.title = title;
		if (titleen) event.titleen = titleen;
		if (descriptionid) event.descriptionid = descriptionid;
		if (descriptionen) event.descriptionen = descriptionen;
		if (date) event.date = date;
		if (imageUrl) event.image = imageUrl;

		await event.save();
		res.redirect('/dashboard');
	} catch (err) {
		console.error('Terjadi kesalahan saat mengupdate event:', err);
		res.status(500).send('Terjadi kesalahan saat mengupdate event');
	}
};

exports.deleteShop = async (req, res) => {
	const shopId = req.params.id;

	try {
		const shop = await Shop.findByPk(shopId);
		if (!shop) {
			return res.status(404).send('Toko tidak ditemukan');
		}

		await shop.destroy();
		res.redirect('/dashboard');
	} catch (err) {
		console.error('Terjadi kesalahan saat menghapus toko:', err);
		res.status(500).send('Terjadi kesalahan saat menghapus toko');
	}
};

exports.deleteEvent = async (req, res) => {
	const eventId = req.params.id;

	try {
		const event = await Event.findByPk(eventId);
		if (!event) {
			return res.status(404).send('Event tidak ditemukan');
		}

		await event.destroy();
		res.redirect('/dashboard');
	} catch (err) {
		console.error('Terjadi kesalahan saat menghapus event:', err);
		res.status(500).send('Terjadi kesalahan saat menghapus event');
	}
};

exports.deleteGallery = async (req, res) => {
	const galleryId = req.params.id;
	try {
		const gallery = await Gallery.findByPk(galleryId);
		if (!gallery) {
			return res.status(404).send('Foto tidak ditemukan');
		}

		await gallery.destroy();
		res.redirect('/admin-gallery');
	} catch (err) {
		console.error('Terjadi kesalahan saat mengambil data foto:', err);
		res.status(500).send('Terjadi kesalahan saat mengambil data foto');
	}
};