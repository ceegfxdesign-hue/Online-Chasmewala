import { Router } from 'express';
import { offerController } from '../../controllers/offer.controller.js';

const router = Router();

router.get('/', offerController.listActive);

export default router;
