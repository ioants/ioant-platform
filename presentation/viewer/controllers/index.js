var express = require('express')
  , router = express.Router()


router.use('/streams', require('./streams'))
router.use('/stream', require('./stream'))


router.get('/', function(req, res, next) {
    //res.render('homepage', {title: 'home'})
    res.redirect('/streams');
})

router.get('/about', function(req, res) {
    res.render('about', {title: 'about'})
})

module.exports = router
