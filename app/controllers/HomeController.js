exports.homePage = (req, res, next) => {
    res.render('home');
};

exports.infoPage = (req, res, next) => {
    res.render('info');
};

exports.galleryPage = (req, res, next) => {
    res.render('gallery');
};

exports.shopPage = (req, res, next) => {
    res.render('shop');
};

exports.faqsPage = (req, res, next) => {
    res.render('faqs');
};

exports.infoPageen = (req, res, next) => {
    res.render('info_en', { layout: 'layout_en' });
};

exports.homePageen = (req, res, next) => {
    res.render('home_en', { layout: 'layout_en' });
};

exports.galleryPageen = (req, res, next) => {
    res.render('gallery_en', { layout: 'layout_en' });
};

exports.shopPageen = (req, res, next) => {
    res.render('shop_en', { layout: 'layout_en' });
};

exports.faqsPageen = (req, res, next) => {
    res.render('faqs_en', { layout: 'layout_en' });
};
