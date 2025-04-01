-- Create sequences
CREATE SEQUENCE IF NOT EXISTS students_student_id_seq;
CREATE SEQUENCE IF NOT EXISTS student_profiles_profile_id_seq;
CREATE SEQUENCE IF NOT EXISTS academic_records_record_id_seq;
CREATE SEQUENCE IF NOT EXISTS addresses_address_id_seq;
CREATE SEQUENCE IF NOT EXISTS hobbies_hobby_id_seq;
CREATE SEQUENCE IF NOT EXISTS mooc_certificates_certificate_id_seq;
CREATE SEQUENCE IF NOT EXISTS parent_info_parent_id_seq;
CREATE SEQUENCE IF NOT EXISTS sibling_info_sibling_id_seq;

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    student_id integer NOT NULL DEFAULT nextval('students_student_id_seq'::regclass),
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    is_first_login boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT students_pkey PRIMARY KEY (student_id)
);

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
    profile_id integer NOT NULL DEFAULT nextval('student_profiles_profile_id_seq'::regclass),
    student_id integer,
    first_name character varying,
    last_name character varying,
    usn character varying,
    dob date,
    phone character varying,
    profile_completed boolean DEFAULT false,
    profile_picture_url text,
    CONSTRAINT student_profiles_pkey PRIMARY KEY (profile_id),
    CONSTRAINT fk_student FOREIGN KEY (student_id)
        REFERENCES students(student_id)
);

-- Create academic_records table
CREATE TABLE IF NOT EXISTS academic_records (
    record_id integer NOT NULL DEFAULT nextval('academic_records_record_id_seq'::regclass),
    student_profile_id integer,
    degree character varying NOT NULL,
    institution character varying NOT NULL,
    year integer NOT NULL,
    grade character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT academic_records_pkey PRIMARY KEY (record_id),
    CONSTRAINT fk_student_profile FOREIGN KEY (student_profile_id)
        REFERENCES student_profiles(profile_id)
);

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
    address_id integer NOT NULL DEFAULT nextval('addresses_address_id_seq'::regclass),
    student_profile_id integer,
    address_type character varying,
    street character varying,
    city character varying,
    state character varying,
    zip_code character varying,
    country character varying,
    CONSTRAINT addresses_pkey PRIMARY KEY (address_id),
    CONSTRAINT fk_student_profile FOREIGN KEY (student_profile_id)
        REFERENCES student_profiles(profile_id)
);

-- Create hobbies table
CREATE TABLE IF NOT EXISTS hobbies (
    hobby_id integer NOT NULL DEFAULT nextval('hobbies_hobby_id_seq'::regclass),
    student_profile_id integer,
    hobby_name character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT hobbies_pkey PRIMARY KEY (hobby_id),
    CONSTRAINT fk_student_profile FOREIGN KEY (student_profile_id)
        REFERENCES student_profiles(profile_id)
);

-- Create mooc_certificates table
CREATE TABLE IF NOT EXISTS mooc_certificates (
    certificate_id integer NOT NULL DEFAULT nextval('mooc_certificates_certificate_id_seq'::regclass),
    student_profile_id integer,
    semester character varying NOT NULL,
    platform character varying NOT NULL,
    title character varying NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    hours_per_week integer NOT NULL,
    certificate_url text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT mooc_certificates_pkey PRIMARY KEY (certificate_id),
    CONSTRAINT fk_student_profile FOREIGN KEY (student_profile_id)
        REFERENCES student_profiles(profile_id)
);

-- Create parent_info table
CREATE TABLE IF NOT EXISTS parent_info (
    parent_id integer NOT NULL DEFAULT nextval('parent_info_parent_id_seq'::regclass),
    student_profile_id integer,
    father_name character varying,
    mother_name character varying,
    contact character varying,
    email character varying,
    CONSTRAINT parent_info_pkey PRIMARY KEY (parent_id),
    CONSTRAINT parent_info_student_profile_id_key UNIQUE (student_profile_id), -- Add UNIQUE constraint
    CONSTRAINT fk_student_profile FOREIGN KEY (student_profile_id)
        REFERENCES student_profiles(profile_id)
);

-- Create sibling_info table
CREATE TABLE IF NOT EXISTS sibling_info (
    sibling_id integer NOT NULL DEFAULT nextval('sibling_info_sibling_id_seq'::regclass),
    student_profile_id integer,
    sibling_name character varying,
    relationship character varying,
    CONSTRAINT sibling_info_pkey PRIMARY KEY (sibling_id),
    CONSTRAINT fk_student_profile FOREIGN KEY (student_profile_id)
        REFERENCES student_profiles(profile_id)
);

-- Create triggers for timestamp updates
CREATE TRIGGER update_academic_records_timestamp
    BEFORE UPDATE ON academic_records
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_mooc_certificates_timestamp
    BEFORE UPDATE ON mooc_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Add indexes for foreign keys to improve query performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_records_student_profile_id ON academic_records(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_addresses_student_profile_id ON addresses(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_hobbies_student_profile_id ON hobbies(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_mooc_certificates_student_profile_id ON mooc_certificates(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_parent_info_student_profile_id ON parent_info(student_profile_id);
CREATE INDEX IF NOT EXISTS idx_sibling_info_student_profile_id ON sibling_info(student_profile_id);
