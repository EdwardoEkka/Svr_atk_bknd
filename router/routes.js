const express = require('express');
const controller = require('../controller/controller');
const router=express.Router();
const cors = require("cors");
router.use(cors());

router.post('/player-login',controller.addPlayer);
router.post('/steal',controller.stealTokens);
router.put('/secure',controller.secureDb);
router.post('/players-log',controller.login);
router.post('/playerLevel',controller.getPlayerL);
router.post('/updatePlayerLevel',controller.updatePlayer);
router.get('/getPlayers',controller.getPlayers);
router.post('/increasePoints',controller.increasePoints);


module.exports=router;