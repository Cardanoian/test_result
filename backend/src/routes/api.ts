import { Router } from 'express';
import { generateContent } from '../controllers/geminiController';

const router = Router();

router.post('/gemini/generate', generateContent);

export default router;
