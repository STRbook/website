const express = require('express');
// Removed { Pool } import as pool instance is injected
const authenticateToken = require('../middleware/auth');

const router = express.Router();

let pool; // Database pool instance will be injected
const setPool = (dbPool) => {
  pool = dbPool;
};

// --- Helper Functions for Updating Related Data ---

// Updates parent information (Upsert logic)
async function _updateParentInfo(client, profileId, parentInfo) {
  if (!parentInfo) return; // Do nothing if parentInfo is not provided
  const { father_name, mother_name, parent_contact, parent_email } = parentInfo;
  await client.query(
    `INSERT INTO parent_info (student_profile_id, father_name, mother_name, contact, email)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (student_profile_id) 
     DO UPDATE SET 
       father_name = COALESCE(EXCLUDED.father_name, parent_info.father_name), 
       mother_name = COALESCE(EXCLUDED.mother_name, parent_info.mother_name), 
       contact = COALESCE(EXCLUDED.contact, parent_info.contact), 
       email = COALESCE(EXCLUDED.email, parent_info.email)`,
    [profileId, father_name, mother_name, parent_contact, parent_email]
  );
}

// Updates addresses (Delete then Insert logic)
async function _updateAddresses(client, profileId, permanentAddress, temporaryAddress) {
  await client.query('DELETE FROM addresses WHERE student_profile_id = $1', [profileId]);
  if (permanentAddress) {
    await client.query(
      `INSERT INTO addresses (student_profile_id, address_type, street, city, state, zip_code, country) VALUES ($1, 'permanent', $2, $3, $4, $5, $6)`,
      [profileId, permanentAddress.street, permanentAddress.city, permanentAddress.state, permanentAddress.zip_code, permanentAddress.country]
    );
  }
  if (temporaryAddress) {
    await client.query(
      `INSERT INTO addresses (student_profile_id, address_type, street, city, state, zip_code, country) VALUES ($1, 'temporary', $2, $3, $4, $5, $6)`,
      [profileId, temporaryAddress.street, temporaryAddress.city, temporaryAddress.state, temporaryAddress.zip_code, temporaryAddress.country]
    );
  }
}

// Updates academic records (Delete then Insert logic)
async function _updateAcademicRecords(client, profileId, academicRecords) {
  await client.query('DELETE FROM academic_records WHERE student_profile_id = $1', [profileId]);
  if (academicRecords && Array.isArray(academicRecords)) {
    for (const record of academicRecords) {
      if (record.degree && record.institution && record.year && record.grade) {
        await client.query(
          `INSERT INTO academic_records (student_profile_id, degree, institution, year, grade) VALUES ($1, $2, $3, $4, $5)`,
          [profileId, record.degree, record.institution, record.year, record.grade]
        );
      } else {
        console.warn('Skipping invalid academic record during update:', record);
      }
    }
  }
}

// Updates siblings (Delete then Insert logic)
async function _updateSiblings(client, profileId, siblings) {
  await client.query('DELETE FROM sibling_info WHERE student_profile_id = $1', [profileId]);
  if (siblings && Array.isArray(siblings)) {
    for (const sibling of siblings) {
      if (sibling.sibling_name && sibling.relationship) {
        await client.query(
          `INSERT INTO sibling_info (student_profile_id, sibling_name, relationship) VALUES ($1, $2, $3)`,
          [profileId, sibling.sibling_name, sibling.relationship]
        );
      } else {
         console.warn('Skipping invalid sibling record during update:', sibling);
      }
    }
  }
}

// Updates hobbies (Delete then Insert logic)
async function _updateHobbies(client, profileId, hobbies) {
  await client.query('DELETE FROM hobbies WHERE student_profile_id = $1', [profileId]);
  if (hobbies && Array.isArray(hobbies)) {
    for (const hobby of hobbies) {
      if (hobby.hobby_name) {
         await client.query(
           `INSERT INTO hobbies (student_profile_id, hobby_name) VALUES ($1, $2)`,
           [profileId, hobby.hobby_name]
         );
      } else {
         console.warn('Skipping invalid hobby record during update:', hobby);
      }
    }
  }
}

// --- Route Handlers ---

// POST /api/student-profile - Create or Update Profile (handles initial creation and full update)
router.post('/', authenticateToken, async (req, res) => {
  if (!pool) return res.status(500).send('Database pool not configured');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { 
      studentId,
      first_name, last_name, usn, dob, phone,
      father_name, mother_name, parent_contact, parent_email,
      permanent_address, temporary_address,
      academic_records, siblings, hobbies,
      profile_picture_url
    } = req.body;

    // Verify the authenticated user matches the studentId being modified
    if (req.user.student_id !== studentId) {
      throw new Error('Unauthorized: User ID mismatch');
    }

    const existingProfile = await client.query(
      'SELECT profile_id FROM student_profiles WHERE student_id = $1',
      [studentId]
    );

    if (existingProfile.rows.length > 0) { // Profile exists, update it
      const profileId = existingProfile.rows[0].profile_id;
      
      await client.query(
        `UPDATE student_profiles 
         SET first_name = $1, last_name = $2, usn = $3, dob = $4, phone = $5, 
             profile_completed = true, profile_picture_url = $6
         WHERE profile_id = $7`,
        [first_name, last_name, usn, dob, phone, profile_picture_url, profileId]
      );

      // Use helper functions to update related data
      await _updateParentInfo(client, profileId, { father_name, mother_name, parent_contact, parent_email });
      await _updateAddresses(client, profileId, permanent_address, temporary_address);
      await _updateAcademicRecords(client, profileId, academic_records);
      await _updateSiblings(client, profileId, siblings);
      await _updateHobbies(client, profileId, hobbies);
 
       // Ensure is_first_login is set to false after successful update
       await client.query(
         `UPDATE students SET is_first_login = false WHERE student_id = $1`,
         [studentId]
       );
 
       await client.query('COMMIT');
       res.json({ message: 'Profile updated successfully', profileId });

    } else { // Profile doesn't exist, create it
      const profileResult = await client.query(
        `INSERT INTO student_profiles (student_id, first_name, last_name, usn, dob, phone, profile_completed, profile_picture_url)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7) RETURNING profile_id`,
        [studentId, first_name, last_name, usn, dob, phone, profile_picture_url]
      );
      const profileId = profileResult.rows[0].profile_id;

      // Use helper functions to insert related data
      await _updateParentInfo(client, profileId, { father_name, mother_name, parent_contact, parent_email }); // Using update which handles insert
      await _updateAddresses(client, profileId, permanent_address, temporary_address); // Using update which handles insert
      await _updateAcademicRecords(client, profileId, academic_records); // Using update which handles insert
      await _updateSiblings(client, profileId, siblings); // Using update which handles insert
      await _updateHobbies(client, profileId, hobbies); // Using update which handles insert
       
       // Ensure is_first_login is set to false after successful creation
       await client.query(
         `UPDATE students SET is_first_login = false WHERE student_id = $1`,
         [studentId]
       );
 
       await client.query('COMMIT');
       res.status(201).json({ message: 'Profile created successfully', profileId });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating/updating profile:', err);
    res.status(err.message === 'Unauthorized: User ID mismatch' ? 403 : 500).json({ 
      message: 'Failed to create/update profile',
      error: err.message 
    });
  } finally {
    client.release();
  }
});

// GET /api/student-profile/:studentId - Fetch Profile
router.get('/:studentId', authenticateToken, async (req, res) => {
  if (!pool) return res.status(500).send('Database pool not configured');
  const client = await pool.connect();
  try {
    const { studentId } = req.params;
    const requestedStudentId = parseInt(studentId); // Ensure it's a number

    // Authorization Check: Allow if user is a teacher OR if user is a student viewing their own profile
    const isOwnProfile = req.user.role === 'student' && req.user.id === requestedStudentId;
    const isTeacher = req.user.role === 'teacher';

    if (!isOwnProfile && !isTeacher) {
      return res.status(403).json({ 
        message: 'Unauthorized: Access denied.',
        requested: requestedStudentId,
        authenticatedUserId: req.user.id,
        authenticatedUserRole: req.user.role
      });
    }
    // If we reach here, the user is authorized (either teacher or student viewing own profile)

    const studentResult = await client.query(
      'SELECT student_id, email, is_first_login FROM students WHERE student_id = $1',
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const basicStudentInfo = studentResult.rows[0]; // Store basic info including is_first_login

    const profileResult = await client.query(
      `SELECT sp.*, s.email 
       FROM student_profiles sp
       JOIN students s ON s.student_id = sp.student_id
       WHERE sp.student_id = $1
       ORDER BY sp.profile_id DESC 
       LIMIT 1`, // Get the latest profile if multiple exist (shouldn't happen with current logic)
      [studentId]
    );

    // If no profile exists yet, return basic student info (which includes is_first_login)
    if (profileResult.rows.length === 0) {
      return res.json({
        ...basicStudentInfo, // Use the stored basic info
        profile_completed: false
      });
    }

    const profile = profileResult.rows[0];
    const profileId = profile.profile_id;

    // Fetch related data in parallel, including projects and MOOCs
    // Note: Assuming 'projects' and 'mooc_certificates' tables use student_id directly, adjust if they use profile_id
    const [
        parentResult, 
        addressesResult, 
        academicResult, 
        siblingsResult, 
        hobbiesResult,
        projectsResult, // Add projects query
        moocsResult     // Add MOOCs query
    ] = await Promise.all([
      client.query('SELECT * FROM parent_info WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM addresses WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM academic_records WHERE student_profile_id = $1 ORDER BY year DESC', [profileId]),
      client.query('SELECT * FROM sibling_info WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM hobbies WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM student_projects WHERE student_id = $1 ORDER BY created_at DESC', [studentId]), // Correct table name: student_projects
      client.query('SELECT * FROM mooc_certificates WHERE student_profile_id = $1 ORDER BY end_date DESC', [profileId]) // Correct FK: student_profile_id, order by end_date
    ]);

    // Construct the full profile object, ensuring is_first_login is included
    const studentProfile = {
      student_id: profile.student_id,
      email: profile.email, // Email from profile join is fine, but could use basicStudentInfo.email
      is_first_login: basicStudentInfo.is_first_login, // Add is_first_login from the initial query
      first_name: profile.first_name,
      last_name: profile.last_name,
      usn: profile.usn,
      dob: profile.dob,
      phone: profile.phone,
      profile_completed: profile.profile_completed,
      profile_picture_url: profile.profile_picture_url,
      parent_info: parentResult.rows[0] || null,
      addresses: addressesResult.rows || [],
      academic_records: academicResult.rows || [],
      siblings: siblingsResult.rows || [],
      hobbies: hobbiesResult.rows || [],
      projects: projectsResult.rows || [], // Add projects to response (using correct table name)
      mooc_certificates: moocsResult.rows || [] // Add MOOCs to response (using correct FK)
    };

    res.json(studentProfile);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ 
      message: 'Failed to fetch profile',
      error: err.message 
    });
  } finally {
    client.release();
  }
});

// PUT /api/student-profile/update - Update existing profile parts (more granular update)
// Note: This seems somewhat redundant with the POST endpoint's update logic. 
// Consider consolidating or clarifying the purpose of PUT vs POST update.
// For now, implementing as it was in index.js.
router.put('/update', authenticateToken, async (req, res) => {
  if (!pool) return res.status(500).send('Database pool not configured');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const profileData = req.body; // Renamed from 'profile' to avoid conflict
    const studentId = req.user.student_id; // Get studentId from authenticated token

    if (!profileData) {
      throw new Error('Profile data is required');
    }

    // Find the profile_id for the authenticated student
    const profileResult = await client.query(
      'SELECT profile_id FROM student_profiles WHERE student_id = $1',
      [studentId]
    );

    if (profileResult.rows.length === 0) {
      // If profile doesn't exist, PUT shouldn't create it (use POST for creation)
      return res.status(404).json({ message: 'Profile not found. Use POST to create a profile.' });
    }

    const profileId = profileResult.rows[0].profile_id;

    // Update core profile fields using COALESCE to only update provided fields
    await client.query(
      `UPDATE student_profiles 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           dob = COALESCE($4, dob),
           usn = COALESCE($5, usn), -- Added USN update
           profile_picture_url = COALESCE($6, profile_picture_url) -- Added profile picture update
       WHERE profile_id = $7`,
      [
        profileData.first_name, profileData.last_name, profileData.phone, 
        profileData.dob, profileData.usn, profileData.profile_picture_url, 
        profileId
      ]
    );

    // Use helper functions to update related data if provided in the request body
    await _updateParentInfo(client, profileId, profileData.parent_info);
    
    // Separate permanent and temporary addresses for the helper function
    let permanentAddress, temporaryAddress;
    if (profileData.addresses && Array.isArray(profileData.addresses)) {
        permanentAddress = profileData.addresses.find(a => a.address_type === 'permanent');
        temporaryAddress = profileData.addresses.find(a => a.address_type === 'temporary');
    }
    await _updateAddresses(client, profileId, permanentAddress, temporaryAddress);
    
    await _updateAcademicRecords(client, profileId, profileData.academic_records);
    await _updateSiblings(client, profileId, profileData.siblings);
    await _updateHobbies(client, profileId, profileData.hobbies);

    // Mark profile as completed if it wasn't already
    await client.query(
      `UPDATE student_profiles SET profile_completed = true WHERE profile_id = $1 AND profile_completed = false`,
      [profileId]
    );
    
    // Ensure is_first_login is set to false after successful update
    await client.query(
      `UPDATE students SET is_first_login = false WHERE student_id = $1`,
      [studentId]
    );

    await client.query('COMMIT');

    // Fetch the updated profile to return it
    // Re-using the logic from the GET endpoint might be better here, but for now, keeping it simple
    const updatedProfileResult = await client.query(
      `SELECT sp.*, s.email 
       FROM student_profiles sp
       JOIN students s ON s.student_id = sp.student_id
       WHERE sp.profile_id = $1`,
      [profileId]
    );
    // Fetch other related data similarly to the GET endpoint if needed for the response

    res.json({ message: 'Profile updated successfully', profile: updatedProfileResult.rows[0] });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating profile:', err);
    res.status(500).json({ 
      message: err.message || 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } finally {
    client.release();
  }
});


module.exports = { router, setPool };
