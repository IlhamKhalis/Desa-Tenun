const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User');
const Session = require('../models/Session');
const Shop = require('../models/shop')
const Event = require ('../models/event')
const Gallery = require ('../models/gallery')

const message = (req) => {
	let message = req.flash('error');
	if (message.length > 0) {
		message = message[0];
	} else {
		message = null;
	}

	return message;
}

const oldInput = (req) => {
	let oldInput = req.flash('oldInput');
	if (oldInput.length > 0) {
		oldInput = oldInput[0];
	} else {
		oldInput = null;
	}
	
	return oldInput;
}

exports.loginPage = async (req, res, next) => {
	if(res.locals.isAuthenticated){
		res.redirect('/');
	} else {
		res.render('login',{layout: 'login_layout', loginPage: true, pageTitle: 'Login', errorMessage: message(req), oldInput: oldInput(req)});
	}
};

exports.login = (req, res, next) => {
	const validationErrors = [];
	if (!validator.isEmail(req.body.inputEmail)) validationErrors.push('Please enter a valid email address.');
	if (validator.isEmpty(req.body.inputPassword)) validationErrors.push('Password cannot be blank.');
	if (validationErrors.length) {
		req.flash('error', validationErrors);
		return res.redirect('/login');
	}
	User.findOne({
		where: {
			email: req.body.inputEmail
		}
	}).then(user => {
		if(user) {
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
					req.flash('error', 'Invalid email or password.');
					req.flash('oldInput',{email: req.body.inputEmail});
					return res.redirect('/login');
				})
				.catch(err => {
					console.log(err);
					req.flash('error', 'Sorry! Somethig went wrong.');
					req.flash('oldInput',{email: req.body.inputEmail});
					return res.redirect('/login');
				});
		} else {
			req.flash('error', 'No user found with this email');
			req.flash('oldInput',{email: req.body.inputEmail});
			return res.redirect('/login');
		}
	})
	.catch(err => console.log(err));
};

exports.logout = (req, res, next) => {
	if(res.locals.isAuthenticated){
		req.session.destroy(err => {
			return res.redirect('/');
		});
	} else {
		return res.redirect('/login');
	}
};

exports.signUpPage = (req, res, next) => {
	res.render('sign_up',{layout: 'login_layout', signUpPage: true, errorMessage: message(req), oldInput: oldInput(req)});
};

exports.signUp = (req, res, next) => {
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if(!user) {
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
			req.flash('error', 'E-Mail exists already, please pick a different one.');
			req.flash('oldInput',{name: req.body.name});
        	return res.redirect('/sign-up');
		}
	})
	.catch(err => console.log(err));
};

exports.forgotPasswordPage = (req, res, next) => {
	if(res.locals.isAuthenticated){
		return res.redirect('/');
	} else {
		return res.render('forgot_password',{layout: 'login_layout', loginPage: true, pageTitle: 'Forgot Password', errorMessage: message(req), oldInput: oldInput(req)});
	}
};

exports.forgotPassword = (req, res, next) => {
	const validationErrors = [];
	if (!validator.isEmail(req.body.email)) validationErrors.push('Please enter a valid email address.');

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
		User.findOne({where: {
				email: req.body.email
				}
			})
			.then(user => {
				if(!user){
					req.flash('error', 'No user found with that email');
					return res.redirect('/forgot-password');
				}
				user.resetToken = token;
				user.resetTokenExpiry = Date.now() + 3600000;
				return user.save();
			}).then(result => {
				if(result) return res.redirect('/resetlink');
			}).catch(err => {console.log(err)})
	});
};
const dataShop = async () => {
    try {
        // Mengambil semua data shop
        const shops = await Shop.findAll();
        return shops; // Mengembalikan nilai shops
    } catch (err) {
        throw new Error(`Error in getAllData: ${err.message}`); // Melemparkan error agar dapat ditangkap di bagian yang memanggil getAllData
    }
};

const dataEvent = async () =>{
    try {
        // Mengambil semua data shop
        const event = await Event.findAll();
        return event; // Mengembalikan nilai shops
    } catch (err) {
        throw new Error(`Error in getAllData: ${err.message}`); // Melemparkan error agar dapat ditangkap di bagian yang memanggil getAllData
    }
}

const dataGallery = async () =>{
    try{
        const gallery = await Gallery.findAll();
        return gallery;
    }catch (err){
        throw new Error(`Error in getAllData: ${err.message}`)
    }
}

exports.infoPage = async (req, res, next) => {
    try {
        // Memanggil getAllData untuk mendapatkan semua data shop
        const events = await dataGallery();
        
        // Merender halaman 'shop' dengan layout 'admin_layout' dan data shops
        res.render('info', {
            info: events, // Mengirimkan data shops ke halaman render
        });
    } catch (err) {
        console.error(`Error in infoPage: ${err.message}`);
        res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
    }
};

exports.infoPageen = async (req, res, next) => {
    try {
        // Memanggil getAllData untuk mendapatkan semua data shop
        const events = await dataGallery();
        
        // Merender halaman 'shop' dengan layout 'admin_layout' dan data shops
        res.render('info', {
            layout: 'layout_en',
            info: events, // Mengirimkan data shops ke halaman render
        });
    } catch (err) {
        console.error(`Error in infoPageen: ${err.message}`);
        res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
    }
};

exports.galleryPage = async (req, res, next) => {
    try {
        // Memanggil getAllData untuk mendapatkan semua data shop
        const gallery = await dataGallery();
        
        // Merender halaman 'shop' dengan layout 'admin_layout' dan data shops
        res.render('gallery', {
            gallery: gallery, // Mengirimkan data shops ke halaman render
        });
    } catch (err) {
        console.error(`Error in galleryPage: ${err.message}`);
        res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
    }
};

exports.galleryPageen = async (req, res, next) => {
    try {
        // Memanggil getAllData untuk mendapatkan semua data shop
        const gallery = await dataGallery();
        
        // Merender halaman 'shop' dengan layout 'admin_layout' dan data shops
        res.render('gallery', {
            layout: 'layout_en',
            gallery: gallery, // Mengirimkan data shops ke halaman render
        });
    } catch (err) {
        console.error(`Error in galleryPageen: ${err.message}`);
        res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
    }
};

exports.shopPage = async (req, res, next) => {
    try {
        // Memanggil getAllData untuk mendapatkan semua data shop
        const shops = await dataShop();
        
        // Merender halaman 'shop' dengan layout 'admin_layout' dan data shops
        res.render('shop', {
            shops: shops, // Mengirimkan data shops ke halaman render
            title: 'Nama Toko'
        });
    } catch (err) {
        console.error(`Error in shopPageen: ${err.message}`);
        res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
    }
};

exports.shopPageen = async (req, res, next) => {
    try {
        // Memanggil getAllData untuk mendapatkan semua data shop
        const shops = await dataShop();
        
        // Merender halaman 'shop' dengan layout 'admin_layout' dan data shops
        res.render('shop_en', {
            layout: 'layout_en',
            shops: shops, // Mengirimkan data shops ke halaman render
            title: 'Shop Name'
        });
    } catch (err) {
        console.error(`Error in shopPageen: ${err.message}`);
        res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
    }
};


exports.dashboard = async (req, res, next) => {
    if(res.locals.isAuthenticated){
		try {
            // Memanggil getAllData untuk mendapatkan semua data shop
            const shops = await dataShop();
            const events = await dataEvent();
            
            // Merender halaman 'dashboard' dengan layout 'admin_layout' dan data shops serta data lain yang diperlukan
            res.render('dashboard', {
                layout: 'admin_layout',
                shops,
                events,
                title: 'Dashboard'
            });
        } catch (err) {
            console.error(`Error in Dashboard: ${err.message}`);
            res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
        }
	} else {
		res.render('login',{layout: 'login_layout', loginPage: true, pageTitle: 'Login', errorMessage: message(req), oldInput: oldInput(req)});
	}
};

exports.galleryAdmin = async (req, res, next) =>{
    try{
        const gallery = await dataGallery()
        res.render('admin-gallery',{
            layout : 'admin_layout',
            gallery,
            title : 'GALLERY'
        })

    }catch (err) {
        console.error(`Error in gallery admin: ${err.message}`);
        res.status(500).json({ error: err.message }); // Menangkap error jika terjadi
    } 
}
exports.home = async (req, res ,next) => {
    try{
        const shops = await dataShop();
        const events = await dataEvent();
        res.render('home',{
            shops,
            events,
        })
    } catch(err){
        console.error(`Error in home: ${err.message} `)
        res.status(500).json({error : err.message})
    }
}

exports.homeen = async (req, res ,next) => {
    try{
        const shops = await dataShop();
        const events = await dataEvent();
        res.render('home_en',{
            layout: 'layout_en',
            shops,
            events,
        })
    } catch(err){
        console.error(`Error in home: ${err.message} `)
        res.status(500).json({error : err.message})
    }
}

// Kontroler untuk menampilkan halaman tambah event baru
exports.getCreateEventPage = (req, res) => {
    res.render('create-event', { csrfToken: req.csrfToken() });
};
exports.getCreateItemPage = (req, res) => {
    res.render('create-item', { csrfToken: req.csrfToken() });
};
exports.getCreateGalleryPage = (req, res) => {
    res.render('create-gallery', {csrfToken: req.csrfToken()})
}

exports.getUpdateShopPage = async (req, res) => {
    const shopId = req.params.id;
    try {
        const shop = await Shop.findByPk(shopId);
        if (!shop) {
            return res.status(404).send('Shop not found');
        }
        res.render('update-item', { shop, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error('Error fetching shop:', err);
        res.status(500).send('Error fetching shop');
    }
};

exports.getDeleteItem = async(req, res) => {
    const shopId = req.params.id;
    try {
        const shop = await Shop.findByPk(shopId);
        if (!shop) {
            return res.status(404).send('Shop not found');
        }
        res.render('delete-item', { shop, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error('Error fetching shop:', err);
        res.status(500).send('Error fetching shop');
    }
};

exports.getUpdateEventPage = async (req, res) => {
    const eventId = req.params.id;
    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).send('Shop not found');
        }
        res.render('update-event/:id', { event, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Error fetching event');
    }
};
exports.getDeleteEvent = async(req, res) => {
    const eventId = req.params.id;
    try {
        const event = await Event.findByPk(eventId);
        if (!event) {
            return res.status(404).send('Shop not found');
        }
        res.render('delete-event/:id', { event, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send('Error fetching event');
    }
};

exports.createEvent = async (req, res) => {
    const { title, titleen, descriptionid, descriptionen} = req.body; // Mengambil data dari body request
	const image = req.file ? req.file.filename : null;
	try {
        // Membuat event baru di dalam tabel
        const newEvent = await Event.create({
            title,
            titleen,
            descriptionid,
            descriptionen,
			image
        });


        console.log('Event baru telah ditambahkan:');
        console.log(newEvent.toJSON()); // Menampilkan data event yang baru ditambahkan

        // Menanggapi dengan status 201 Created dan data event yang baru ditambahkan
        res.redirect('/dashboard')
    } catch (error) {
        console.error('Gagal menambahkan event:', error);
        // Menanggapi dengan status 500 Internal Server Error dan pesan kesalahan
        res.status(500).json({ error: 'Gagal menambahkan event', message: error.message });
    }
};

exports.createShop = async (req, res) => {
    const { name, description, descriptionen,price,link1,link2 } = req.body; // Assuming these fields are in your request body
    const image = req.file ? req.file.filename : null; // Assuming logo is uploaded as a file

    try {
        // Create a new shop in the database
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
        console.log(newShop.toJSON()); // Log the newly created shop data

        // Respond with status 201 Created and the newly created shop data
        res.redirect('/dashboard')
    } catch (error) {
        console.error('Gagal menambahkan toko:', error);
        // Respond with status 500 Internal Server Error and error message
        res.status(500).json({ error: 'Gagal menambahkan toko', message: error.message });
    }
};

exports.createGallery = async (req, res) => {
    const {title, titleen, descriptionid, descriptionen} = req.body;
    const image = req.file ? req.file.filename : null
    try{
        const newGallery = await Gallery.create({
            title,
            titleen,
            image,
            descriptionid,
            descriptionen
        })
        console.log(newGallery.toJSON())
        res.redirect('/admin-gallery')
    }catch (error){
        console.error ('gagal menambahkan foto:', error)
        res.status(500).json({ error: 'Gagal menambahkan foto', message: error.message });
    }
}

// Controller untuk mengupdate item berdasarkan ID
exports.updateShop = async (req, res) => {
    const shopId = req.body.id;
    const { name, description, descriptionen, price, link1, link2 } = req.body;
    let imageUrl = req.file ? req.file.filename : null; // Tentukan imageUrl berdasarkan file yang diunggah

    // Validasi field yang diperlukan
    if (!shopId) {
        return res.status(400).send('ID Toko diperlukan');
    }

    try {
        const shop = await Shop.findByPk(shopId);

        if (!shop) {
            return res.status(404).send('Toko tidak ditemukan');
        }

        // Update detail toko
        if (name) {
            shop.name = name;
        }
        if (description) {
            shop.description = description;
        }
        if (descriptionen) {
            shop.descriptionen = descriptionen;
        }
        if (price) {
            shop.price = price;
        }
        if (link1) {
            shop.link1 = link1
        }
        if (link2) {
            shop.link2 = link2
        }
        if (imageUrl) {
            shop.image = imageUrl;
        }

        await shop.save();
        res.redirect('/dashboard'); // Redirect ke dashboard setelah berhasil update
    } catch (err) {
        console.error('Error updating shop:', err);
        res.status(500).send('Terjadi kesalahan saat mengupdate toko');
    }
};

exports.updateEvent = async (req, res) => {
    const eventId = req.body.id;
    const { title, titleen, descriptionid, descriptionen, date } = req.body;
    let imageUrl = req.file ? req.file.filename : null; // Determine imageUrl based on uploaded file

    // Validate required fields
    if (!eventId) {
        return res.status(400).send('ID Event is required');
    }

    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            return res.status(404).send('Event not found');
        }

        // Update event details
        if (title) {
            event.title = title;
        }
        if (titleen) {
            event.titleen = titleen;
        }
        if (descriptionid) {
            event.descriptionid = descriptionid;
        }
        if (descriptionen) {
            event.descriptionen = descriptionen;
        }
        if (date) {
            event.date = date;
        }
        if (imageUrl) {
            event.image = imageUrl;
        }

        await event.save();
        res.redirect('/dashboard'); // Redirect to dashboard after successful update
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).send('Error updating event');
    }
};

exports.deleteShop = async (req, res) => {
    const shopId = req.params.id; // Ambil ID dari parameter URL

    try {
        const shop = await Shop.findByPk(shopId);

        if (!shop) {
            return res.status(404).send('Toko tidak ditemukan');
        }

        await shop.destroy(); // Hapus data toko dari database

        res.redirect('/dashboard')
    } catch (err) {
        console.error('Error deleting shop:', err);
        res.status(500).send('Terjadi kesalahan saat menghapus toko');
    }
};

exports.deleteEvent = async (req, res) => {
    const eventId = req.params.id; // Ambil ID dari parameter URL

    try {
        const event = await Event.findByPk(eventId);

        if (!event) {
            return res.status(404).send('Event tidak ditemukan');
        }

        await event.destroy(); // Hapus data event dari database

        res.redirect('/dashboard')
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).send('Terjadi kesalahan saat menghapus event');
    }
};

exports.deleteGallery = async (req, res) =>{
    const galleryid = req.params.id
    try{
        const gallery = await Gallery.findByPk(galleryid)
        if(!gallery){
            return res.status(404).send('Foto tidak ditemukan')
        }
        
        await gallery.destroy();
        res.redirect('/admin-gallery')
    }catch (err) {
        console.error('Error fetching foto:', err);
        res.status(500).send('Error fetching foto');
    }
}