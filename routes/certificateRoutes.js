import express from 'express';
import {
    getUserCertificates,
    checkCertificateEligibility,
    verifyCertificate,
    getCourseCertificate
} from '../controllers/certificateController.js';

const router = express.Router();

// Get all certificates for a user
router.get('/user/:userId', getUserCertificates);

// Check certificate eligibility for a course
router.get('/eligibility/:userId/:courseId', checkCertificateEligibility);

// Get certificate for a specific course
router.get('/:userId/:courseId', getCourseCertificate);

// Verify certificate by ID
router.get('/verify/:certificateId', verifyCertificate);

export default router;
