# Football Analysis Platform by Clann

[Logo placement]

## Overview
A web application enabling football teams to receive professional analysis of their games. Teams can upload game footage, receive expert analysis, and manage their team members through a simple, secure platform.

### Database Schema
-- Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('COMPANY_MEMBER', 'USER')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams Table
CREATE TABLE Teams (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    team_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TeamMembers Table
CREATE TABLE TeamMembers (
    team_id UUID REFERENCES Teams(id),
    user_id UUID REFERENCES Users(id),
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (team_id, user_id)
);

-- Sessions Table
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

-- Analysis Table
CREATE TABLE Analysis (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES Sessions(id),
    analyst_id UUID REFERENCES Users(id),
    description TEXT,
    image_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

### API Endpoints Required
1. Authentication
   - POST /auth/login
   - POST /auth/register
   - POST /auth/verify

2. Teams
   - POST /teams/create
   - GET /teams/:id
   - PUT /teams/:id/members
   - GET /teams/code/:code

3. Sessions
   - POST /sessions/create
   - GET /sessions/:teamId
   - PUT /sessions/:id/analysis
   - GET /sessions/pending

### Component Hierarchy
1. Layout Components
   - AuthLayout
   - DashboardLayout
   - AdminLayout

2. Feature Components
   - SessionUploader
   - AnalysisViewer
   - TeamManager
   - MemberList

3. Shared Components
   - StatusBadge
   - DatePicker
   - ImageUploader
   - UrlInput

### Design System

#### Brand Colors (from Clann logo)
- Primary: #1A5F7A (Deep Teal)
- Secondary: #86C6E3 (Light Blue)
- Accent: #FF6B35 (Coral Orange)
- Background: #F9F9F9 (Off White)
- Text: #2D3748 (Dark Gray)

#### Color Application
- Primary: Headers, navigation, buttons
- Secondary: Highlights, cards, borders
- Accent: CTAs, status indicators, important actions
- Background: Page backgrounds, content areas
- Text: Body text, labels

#### Component Theming
- All components will use this consistent color palette
- AWS Amplify UI components will be themed to match
- Custom components will follow the same scheme
- Mobile components will maintain consistency

### Environment Variables
AWS_REGION=
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
API_URL=
S3_BUCKET=
RDS_CONNECTION=

See also:
- [TECH-STACK.md](./TECH-STACK.md) - Technical architecture & development guide
- [USER-FLOW.md](./USER-FLOW.md) - User journeys