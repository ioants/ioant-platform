var express = require('express')
  , router = express.Router()


router.use('/streams', require('./streams'))
router.use('/stream', require('./stream'))
router.use('/analytics', require('./analytics'))


router.get('/', function(req, res, next) {
    res.redirect('/streams');
})

router.get('/analytics', function(req, res, next) {
    res.redirect('/analytics');
})

router.get('/about', function(req, res) {
    res.render('about', {title: 'about'})
})

module.exports = router
