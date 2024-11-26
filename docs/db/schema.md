# Database Schema

## Tables

### Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    cognito_id VARCHAR(255) UNIQUE,
    role VARCHAR(20) CHECK (role IN ('COMPANY_MEMBER', 'USER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Teams Table
CREATE TABLE Teams (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### TeamMembers Table
CREATE TABLE TeamMembers (
    team_id UUID REFERENCES Teams(id),
    user_id UUID REFERENCES Users(id),
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

### Sessions Table
CREATE TABLE Sessions (
    id UUID PRIMARY KEY,
    team_id UUID REFERENCES Teams(id),
    uploaded_by UUID REFERENCES Users(id),
    footage_url TEXT NOT NULL,
    game_date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'REVIEWED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### Analysis Table
CREATE TABLE Analysis (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES Sessions(id),
    analyst_id UUID REFERENCES Users(id),
    description TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
