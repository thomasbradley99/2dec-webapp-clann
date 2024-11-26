-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS Analysis;
DROP TABLE IF EXISTS Sessions;
DROP TABLE IF EXISTS TeamMembers;
DROP TABLE IF EXISTS Teams;
DROP TABLE IF EXISTS Users;

-- Create tables
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cognito_id VARCHAR(255) UNIQUE,
    role VARCHAR(20) CHECK (role IN ('COMPANY_MEMBER', 'USER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    team_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TeamMembers (
    team_id UUID REFERENCES Teams(id),
    user_id UUID REFERENCES Users(id),
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

CREATE TABLE Sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES Teams(id),
    uploaded_by UUID REFERENCES Users(id),
    reviewed_by UUID REFERENCES Users(id),
    footage_url TEXT NOT NULL,
    game_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'REVIEWED')),
    -- Analysis fields
    analysis_image1_url TEXT,
    analysis_image2_url TEXT,
    analysis_image3_url TEXT,
    distance_covered NUMERIC(10,2),  -- In meters, with 2 decimal places
    analysis_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

