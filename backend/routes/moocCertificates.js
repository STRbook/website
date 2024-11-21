const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/auth');

// Get all MOOC certificates for a student
router.get('/:studentId', authenticateToken, async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const result = await pool.query(
            `SELECT mc.*, sp.first_name, sp.last_name 
             FROM mooc_certificates mc
             JOIN student_profiles sp ON mc.student_profile_id = sp.profile_id
             WHERE sp.student_id = $1
             ORDER BY mc.created_at DESC`,
            [studentId]
        );
        
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching MOOC certificates:', err);
        res.status(500).json({ error: 'Failed to fetch MOOC certificates' });
    }
});

// Add a new MOOC certificate
router.post('/', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        const {
            student_id,
            semester,
            platform,
            title,
            start_date,
            end_date,
            hours_per_week,
            certificate_url
        } = req.body;

        // Validate required fields
        if (!student_id || !semester || !platform || !title || !start_date || 
            !end_date || !hours_per_week || !certificate_url) {
            return res.status(400).json({ 
                error: 'All fields are required',
                receivedData: req.body
            });
        }

        // Validate data types
        if (typeof hours_per_week !== 'number' || hours_per_week <= 0) {
            return res.status(400).json({ 
                error: 'Hours per week must be a positive number',
                received: hours_per_week
            });
        }

        // Start transaction
        await client.query('BEGIN');

        // Get student_profile_id
        const profileResult = await client.query(
            'SELECT profile_id FROM student_profiles WHERE student_id = $1',
            [student_id]
        );

        if (profileResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ 
                error: 'Student profile not found',
                student_id: student_id
            });
        }

        const student_profile_id = profileResult.rows[0].profile_id;

        console.log('Inserting certificate with data:', {
            student_profile_id,
            semester,
            platform,
            title,
            start_date,
            end_date,
            hours_per_week,
            certificate_url
        });

        // Insert certificate
        const result = await client.query(
            `INSERT INTO mooc_certificates (
                student_profile_id,
                semester,
                platform,
                title,
                start_date,
                end_date,
                hours_per_week,
                certificate_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                student_profile_id,
                semester,
                platform,
                title,
                start_date,
                end_date,
                hours_per_week,
                certificate_url
            ]
        );

        // Commit transaction
        await client.query('COMMIT');

        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding MOOC certificate:', err);
        res.status(500).json({ error: err.message || 'Failed to add MOOC certificate' });
    } finally {
        client.release();
    }
});

// Update a MOOC certificate
router.put('/:certificateId', authenticateToken, async (req, res) => {
    try {
        const { certificateId } = req.params;
        const {
            semester,
            platform,
            title,
            start_date,
            end_date,
            hours_per_week,
            certificate_url
        } = req.body;

        const result = await pool.query(
            `UPDATE mooc_certificates
             SET semester = $1,
                 platform = $2,
                 title = $3,
                 start_date = $4,
                 end_date = $5,
                 hours_per_week = $6,
                 certificate_url = $7
             WHERE certificate_id = $8
             RETURNING *`,
            [
                semester,
                platform,
                title,
                start_date,
                end_date,
                hours_per_week,
                certificate_url,
                certificateId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating MOOC certificate:', err);
        res.status(500).json({ error: 'Failed to update MOOC certificate' });
    }
});

// Delete a MOOC certificate
router.delete('/:certificateId', authenticateToken, async (req, res) => {
    try {
        const { certificateId } = req.params;

        const result = await pool.query(
            'DELETE FROM mooc_certificates WHERE certificate_id = $1 RETURNING *',
            [certificateId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        res.json({ message: 'Certificate deleted successfully' });
    } catch (err) {
        console.error('Error deleting MOOC certificate:', err);
        res.status(500).json({ error: 'Failed to delete MOOC certificate' });
    }
});

module.exports = router;
