exports.historyPage = (req, res, next) => {
    res.render('history', { layout: 'web_layout_1' });
};

exports.historyPageen = (req, res, next) => {
    res.render('history_en', { layout: 'layout_en_1' });
};

exports.faqsPage = (req, res, next) => {
    res.render('faqs', { layout: 'web_layout_1' });
};

exports.faqsPageen = (req, res, next) => {
    res.render('faqs_en', { layout: 'layout_en_1' });
};
