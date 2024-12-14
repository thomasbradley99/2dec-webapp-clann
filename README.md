# Football Analysis Platform by Clann


[Logo placement]


## Overview
A web application enabling football teams to receive professional analysis of their games. Teams can upload game footage, receive expert analysis, and manage their team members through a simple, secure platform.


See [DB-SCHEMA.md](./DB-SCHEMA.md) for database structure.


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




Adding Data
1. User Registration
Creates new user account
Automatically adds them to St Mary's team as regular member
2. Team Creation
Creates new team
Makes creator an admin of that team
Join Team
Adds existing user to a team using team code
Joins as regular member, not admin
Has member limit checks
Removing Data
Leave Team (voluntary)
User chooses to leave
Can't leave if they're the last admin
Just removes their team membership
Remove Member (admin action)
Admin kicks out another member
Can't remove last admin
Only removes team membership
Delete Team (admin action)
Removes all team sessions
Removes all team memberships
Deletes the team itself
Must be an admin to do this
Delete Account (user action)
Removes all their sessions
Removes all their team memberships
Deletes their user account completely
Admin Controls
Toggle Admin Status
Admins can promote/demote other members
Can't demote last admin
Premium Status Management
Can change team subscription level
Affects team features/limits
All these actions have proper checks and balances to prevent unauthorized changes or data inconsistencies.


