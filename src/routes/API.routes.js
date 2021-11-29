const router = require('express').Router();
const { getOportunities, registerInBling } = require('@controllers/Api.Controller.js');

router.post('/register', registerInBling);
router.get('/oportunities', getOportunities);

router.use('/v1', router);

module.exports = router;