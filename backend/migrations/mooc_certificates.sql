-- Create sequence for mooc_certificates
CREATE SEQUENCE IF NOT EXISTS mooc_certificates_certificate_id_seq
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

-- Create mooc_certificates table
CREATE TABLE IF NOT EXISTS public.mooc_certificates
(
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
        REFERENCES public.student_profiles (profile_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- Create index on student_profile_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_mooc_certificates_student_profile_id
    ON public.mooc_certificates(student_profile_id);

-- Add comment to the table
COMMENT ON TABLE public.mooc_certificates
    IS 'Stores MOOC certificates information for students';

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_mooc_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_mooc_certificates_updated_at
    BEFORE UPDATE ON public.mooc_certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_mooc_certificates_updated_at();
