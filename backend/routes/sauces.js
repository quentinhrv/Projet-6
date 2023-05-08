const express = require('express');
const saucesCtrl = require('../controllers/sauces');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const router = express.Router();

router.post('/', auth, multer, saucesCtrl.createSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauce);
router.delete('/:id', auth, multer, saucesCtrl.deleteSauce);
router.get('/:id', auth, multer, saucesCtrl.getOneSauce);
router.get('/', auth, multer, saucesCtrl.getAllSauces);
router.post('/:id/like', auth, saucesCtrl.likeDislike);

module.exports = router;