exports.index = async (req, res) => {
    res.render('index');
}

exports.explore = async (req, res) => {
    res.render('explore');
}

exports.game = async (req, res) => {
    res.render('game');
}
