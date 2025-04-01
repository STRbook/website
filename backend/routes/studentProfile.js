const express = require('express');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

let pool; 
const setPool = (dbPool) => {
  pool = dbPool;
};



async function _updateParentInfo(client, profileId, parentInfo) {
  if (!parentInfo) return; 
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

    if (req.user.student_id !== studentId) {
      throw new Error('Unauthorized: User ID mismatch');
    }

    const existingProfile = await client.query(
      'SELECT profile_id FROM student_profiles WHERE student_id = $1',
      [studentId]
    );

    if (existingProfile.rows.length > 0) { 
      const profileId = existingProfile.rows[0].profile_id;
      
      await client.query(
        `UPDATE student_profiles 
         SET first_name = $1, last_name = $2, usn = $3, dob = $4, phone = $5, 
             profile_completed = true, profile_picture_url = $6
         WHERE profile_id = $7`,
        [first_name, last_name, usn, dob, phone, profile_picture_url, profileId]
      );

      await _updateParentInfo(client, profileId, { father_name, mother_name, parent_contact, parent_email });
      await _updateAddresses(client, profileId, permanent_address, temporary_address);
      await _updateAcademicRecords(client, profileId, academic_records);
      await _updateSiblings(client, profileId, siblings);
      await _updateHobbies(client, profileId, hobbies);
 
       await client.query(
         `UPDATE students SET is_first_login = false WHERE student_id = $1`,
         [studentId]
       );
 
       await client.query('COMMIT');
       res.json({ message: 'Profile updated successfully', profileId });

    } else { 
      const profileResult = await client.query(
        `INSERT INTO student_profiles (student_id, first_name, last_name, usn, dob, phone, profile_completed, profile_picture_url)
         VALUES ($1, $2, $3, $4, $5, $6, true, $7) RETURNING profile_id`,
        [studentId, first_name, last_name, usn, dob, phone, profile_picture_url]
      );
      const profileId = profileResult.rows[0].profile_id;

      await _updateParentInfo(client, profileId, { father_name, mother_name, parent_contact, parent_email }); 
      await _updateAddresses(client, profileId, permanent_address, temporary_address); 
      await _updateAcademicRecords(client, profileId, academic_records); 
      await _updateSiblings(client, profileId, siblings); 
      await _updateHobbies(client, profileId, hobbies); 
       
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


router.get('/:studentId', authenticateToken, async (req, res) => {
  if (!pool) return res.status(500).send('Database pool not configured');
  const client = await pool.connect();
  try {
    const { studentId } = req.params;
    const requestedStudentId = parseInt(studentId); 

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
    

    const studentResult = await client.query(
      'SELECT student_id, email, is_first_login FROM students WHERE student_id = $1',
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const basicStudentInfo = studentResult.rows[0]; 

    const profileResult = await client.query(
      `SELECT sp.*, s.email 
       FROM student_profiles sp
       JOIN students s ON s.student_id = sp.student_id
       WHERE sp.student_id = $1
       ORDER BY sp.profile_id DESC 
       LIMIT 1`, 
      [studentId]
    );

    if (profileResult.rows.length === 0) {
      return res.json({
        ...basicStudentInfo, 
        profile_completed: false
      });
    }

    const profile = profileResult.rows[0];
    const profileId = profile.profile_id;

    
    
    const [
        parentResult, 
        addressesResult, 
        academicResult, 
        siblingsResult, 
        hobbiesResult,
        projectsResult, 
        moocsResult     
    ] = await Promise.all([
      client.query('SELECT * FROM parent_info WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM addresses WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM academic_records WHERE student_profile_id = $1 ORDER BY year DESC', [profileId]),
      client.query('SELECT * FROM sibling_info WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM hobbies WHERE student_profile_id = $1', [profileId]),
      client.query('SELECT * FROM student_projects WHERE student_id = $1 ORDER BY created_at DESC', [studentId]), 
      client.query('SELECT * FROM mooc_certificates WHERE student_profile_id = $1 ORDER BY end_date DESC', [profileId]) 
    ]);

    
    const studentProfile = {
      student_id: profile.student_id,
      email: profile.email, 
      is_first_login: basicStudentInfo.is_first_login, 
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
      projects: projectsResult.rows || [], 
      mooc_certificates: moocsResult.rows || [] 
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


router.put('/update', authenticateToken, async (req, res) => {
  if (!pool) return res.status(500).send('Database pool not configured');
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const profileData = req.body; 
    const studentId = req.user.student_id; 

    if (!profileData) {
      throw new Error('Profile data is required');
    }

    
    const profileResult = await client.query(
      'SELECT profile_id FROM student_profiles WHERE student_id = $1',
      [studentId]
    );

    if (profileResult.rows.length === 0) {
      
      return res.status(404).json({ message: 'Profile not found. Use POST to create a profile.' });
    }

    const profileId = profileResult.rows[0].profile_id;

    
    await client.query(
      `UPDATE student_profiles 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           dob = COALESCE($4, dob),
           usn = COALESCE($5, usn), 
           profile_picture_url = COALESCE($6, profile_picture_url) 
       WHERE profile_id = $7`,
      [
        profileData.first_name, profileData.last_name, profileData.phone, 
        profileData.dob, profileData.usn, profileData.profile_picture_url, 
        profileId
      ]
    );

    
    await _updateParentInfo(client, profileId, profileData.parent_info);
    
    
    let permanentAddress, temporaryAddress;
    if (profileData.addresses && Array.isArray(profileData.addresses)) {
        permanentAddress = profileData.addresses.find(a => a.address_type === 'permanent');
        temporaryAddress = profileData.addresses.find(a => a.address_type === 'temporary');
    }
    await _updateAddresses(client, profileId, permanentAddress, temporaryAddress);
    
    await _updateAcademicRecords(client, profileId, profileData.academic_records);
    await _updateSiblings(client, profileId, profileData.siblings);
    await _updateHobbies(client, profileId, profileData.hobbies);

    
    await client.query(
      `UPDATE student_profiles SET profile_completed = true WHERE profile_id = $1 AND profile_completed = false`,
      [profileId]
    );
    
    
    await client.query(
      `UPDATE students SET is_first_login = false WHERE student_id = $1`,
      [studentId]
    );

    await client.query('COMMIT');

    
    
    const updatedProfileResult = await client.query(
      `SELECT sp.*, s.email 
       FROM student_profiles sp
       JOIN students s ON s.student_id = sp.student_id
       WHERE sp.profile_id = $1`,
      [profileId]
    );
    

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
