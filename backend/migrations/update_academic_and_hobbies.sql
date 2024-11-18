-- Drop existing tables if they exist
DROP TABLE IF EXISTS academic_records;
DROP TABLE IF EXISTS hobbies;

-- Create new academic_records table
CREATE TABLE academic_records (
    record_id SERIAL PRIMARY KEY,
    student_profile_id INTEGER REFERENCES student_profiles(profile_id),
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    grade VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create new hobbies table
CREATE TABLE hobbies (
    hobby_id SERIAL PRIMARY KEY,
    student_profile_id INTEGER REFERENCES student_profiles(profile_id),
    hobby_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_academic_records_student_profile ON academic_records(student_profile_id);
CREATE INDEX idx_hobbies_student_profile ON hobbies(student_profile_id);

-- Create trigger to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_academic_records_updated_at
    BEFORE UPDATE ON academic_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
