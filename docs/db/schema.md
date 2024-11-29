# Database Schema Documentation

## Tables Overview
- Users: Authentication and user management
- Teams: Team information and settings
- TeamMembers: Many-to-many relationship between Users and Teams
- Sessions: Game footage and analysis data

## Relationships
- A User can be part of multiple Teams (via TeamMembers)
- A Team can have multiple Users (via TeamMembers)
- A Session belongs to one Team
- A Session is uploaded by one User
- A Session can be reviewed by one User

## Metrics and Analysis
The Sessions table includes performance metrics stored as JSONB:
- total_distance: Total distance covered in km
- total_sprints: Number of sprints
- sprint_distance: Distance covered in sprints (m)
- high_intensity_sprints: Number of high-intensity sprints
- top_sprint_speed: Maximum sprint speed (m/s)