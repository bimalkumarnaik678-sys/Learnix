import Certificate from '../models/Certificate.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// Get all certificates for a user
export const getUserCertificates = async (req, res) => {
    try {
        const { userId } = req.params;

        const certificates = await Certificate.find({ userId })
            .populate('courseId', 'title description thumbnail')
            .sort({ issuedAt: -1 });

        res.json({
            success: true,
            count: certificates.length,
            data: certificates
        });
    } catch (error) {
        console.error('Error fetching certificates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificates',
            error: error.message
        });
    }
};

// Check certificate eligibility for a course
export const checkCertificateEligibility = async (req, res) => {
    try {
        const { userId, courseId } = req.params;

        const progress = await Progress.findOne({ userId, courseId });

        if (!progress) {
            return res.json({
                success: true,
                eligible: false,
                message: 'No progress found for this course'
            });
        }

        const eligible = progress.checkCertificateEligibility();

        res.json({
            success: true,
            eligible,
            completionPercentage: progress.completionPercentage,
            certificateEarned: progress.certificateEarned,
            message: eligible ? 'Eligible for certificate' : 'Not yet eligible for certificate'
        });
    } catch (error) {
        console.error('Error checking eligibility:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check eligibility',
            error: error.message
        });
    }
};

// Verify certificate by ID
export const verifyCertificate = async (req, res) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findOne({ certificateId })
            .populate('userId', 'name email')
            .populate('courseId', 'title description');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            data: certificate,
            verified: true
        });
    } catch (error) {
        console.error('Error verifying certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify certificate',
            error: error.message
        });
    }
};

// Get certificate for a specific course
export const getCourseCertificate = async (req, res) => {
    try {
        const { userId, courseId } = req.params;

        const certificate = await Certificate.findOne({ userId, courseId })
            .populate('courseId', 'title description thumbnail');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        res.json({
            success: true,
            data: certificate
        });
    } catch (error) {
        console.error('Error fetching certificate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch certificate',
            error: error.message
        });
    }
};
