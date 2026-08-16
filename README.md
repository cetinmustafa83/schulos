# Schulos - Competence & Grading Platform

**Free & open-source competence & grading platform for schools**  
*Kompetenzorientierte Beurteilung für alle*

## Overview

Schulos is a comprehensive educational platform designed for schools to manage competence-based assessment, grading, and academic progress tracking. The system supports modern educational workflows with features for teachers, students, and administrators.

## Key Features

### 🎓 **Competence-Based Assessment**
- Skill-oriented evaluation framework
- Mastery matrix for tracking progress
- Competency templates and standards
- Progressive assessment stages

### 👥 **Multi-Role Access**
- **Super Admin**: Full system administration
- **School Admin**: School-level management
- **Teacher**: Class and student management
- **Student**: Progress tracking and self-assessment
- **Parent**: Child progress visibility
- **DPO**: Data protection and compliance

### 📊 **Comprehensive Analytics**
- Individual student progress tracking
- Class and school-wide performance metrics
- Trend analysis and reporting
- Export capabilities (PDF, CSV, Excel)

### 🛡️ **Security & Compliance**
- Role-based access control (RBAC)
- GDPR compliance features
- Data protection officer (DPO) controls
- Audit logging
- Two-factor authentication (2FA)

### 🔄 **Workflow Management**
- Lesson planning and delivery
- Assessment creation and grading
- Homework and assignments
- Attendance tracking
- Behavior incident management

## Technical Architecture

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Backend**: Node.js, PostgreSQL/SQLite
- **Authentication**: NextAuth.js with session management
- **Security**: Argon2 password hashing, TOTP 2FA
- **Database**: Prisma ORM with PostgreSQL/SQLite support
- **Real-time**: WebSocket connections
- **Caching**: Redis and memory caching
- **Deployment**: Docker, Kubernetes support

### Data Model
- **Students**: Academic profiles, goals, progress
- **Teachers**: Class assignments, grading, lesson plans
- **Schools**: Districts, buildings, departments
- **Competencies**: Skills, standards, assessment criteria
- **Assessments**: Tests, quizzes, projects, rubrics

## Quick Start

### Prerequisites
```bash
# Clone repository
https://github.com/cetinmustafa83/schulos

# Install dependencies
npm install  # or pnpm install

# Environment variables
# Copy .env.example to .env and configure:
# - Database connection
# - Email settings (if needed)
# - Security configuration
```

### Development Setup
```bash
# Start development server
npm run dev

# Database setup
npm run db:generate          # Generate Prisma client
npm run db:migrate           # Create migrations
npm run db:seed              # Load demo data

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm run start

# Database setup (production)
npm run db:push          # Push schema to database
npm run db:setup-demo   # Set up demo environment

# Docker deployment (recommended)
docker-compose up -d
```

## API Documentation

### Authentication
- **POST /api/auth** - Login, register, request password reset, reset password
- **GET /api/auth** - Get current session user
- **POST /api/auth/logout** - Logout user

### Key Endpoints
- **GET /api/dashboard** - User dashboard data
- **GET /api/students** - List students
- **GET /api/classes** - List classes
- **GET /api/assignments** - List assignments
- **POST /api/grading** - Submit grades

### API Authentication
All endpoints require authentication via session cookie. Role-based access control enforced.

## Security Features

### Authentication
- **Session Management**: Secure HTTP-only cookies with expiration
- **Password Security**: Argon2id with high memory cost, automatic migration from bcrypt
- **Two-Factor Authentication**: TOTP with recovery codes
- **Rate Limiting**: Prevents brute force attacks
- **Secure Cookies**: HTTP-only, secure flag based on environment

### Access Control
- **Role-Based Access Control**: SUPER_ADMIN, SCHOOL_ADMIN, TEACHER, STUDENT, PARENT, DPO
- **Data Isolation**: Users can only access their own school's data
- **Compliance Controls**: DPO can access all data for compliance purposes
- **Audit Logging**: All data access logged for compliance

### Compliance
- **GDPR Support**: Data export, erasure requests
- **Data Protection Officer**: Dedicated compliance role
- **Audit Logs**: Complete audit trail of data access
- **Privacy Controls**: Fine-grained data access permissions

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL=file:./db/schulos.db

# Security
SESSION_MAX_AGE_SECONDS=604800
PASSWORD_RESET_TTL_SECONDS=3600
AUTH_REQUIRE_EMAIL_VERIFICATION=false
AUTH_TOTP_ENABLED=true

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=production

# Storage
STORAGE_PATH=./data/uploads
EXPORT_PATH=./data/exports
BACKUP_PATH=./data/backups

# Email (optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=

# AI Features (optional)
AI_ENABLED=false
AI_PROVIDER=
AI_API_KEY=
```

### Directory Structure
```
/docs/           - Documentation and guides
/prisma/         - Database schema and migrations
/src/            - Application source code
/public/         - Static assets
/scripts/        - Deployment and utility scripts
/data/           - Generated data and exports
prisma/db/       - Database files
```

## Development

### Code Quality
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js configuration
- **Testing**: Bun test framework, Playwright e2e
- **Code Reviews**: PR reviews with checklists

### Development Workflow
1. **Feature Development**: Create new features with tests
2. **Code Review**: Submit PR for peer review
3. **Testing**: Run unit and integration tests
4. **Quality Assurance**: Check linting and type safety
5. **Deployment**: CI/CD pipeline with automated testing

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Code quality checks
npm run lint
npm run typecheck
```

## Deployment

### Self-Hosting
```bash
# Using Docker Compose
docker-compose up -d

# Manual deployment
npm run build
npm run start
```

### Production Considerations
- **SSL/TLS**: Configure HTTPS for all connections
- **Load Balancing**: Behind nginx or equivalent
- **Backups**: Regular database backups
- **Monitoring**: Application monitoring and logging
- **Scaling**: Horizontal scaling support

## Contributing

### Development Guidelines
- Follow [Module L](docs/CODE_REVIEW_MODULE_L.md) code review standards
- Write comprehensive tests for new features
- Update documentation for API changes
- Maintain backward compatibility

### Project Structure
- **Modules**: Organized by feature and responsibility
- **Access Control**: Centralized security logic
- **Testing**: Comprehensive test coverage
- **Documentation**: Living documentation in `/docs/`

## Support & Community

### Documentation
- Full API documentation: `/docs/API_IMPLEMENTATION_GUIDE.md`
- Architecture: `/docs/ARCHITECTURE.md`
- Self-hosting: `/docs/SELF_HOSTING.md`

### Community
- **GitHub**: https://github.com/cetinmustafa83/schulos
- **Issues**: Report bugs and request features
- **Discussions**: Community forums and support

### License
This project is licensed under the MIT License.

## Contact

### Project Lead
- **Name**: Mustafa Cetin
- **Email**: [Available in repository]
- **GitHub**: https://github.com/cetinmustafa83

### Support
For technical support and community questions:
- File issues on GitHub
- Check documentation in `/docs/`
- Join community discussions

## Acknowledgments

Special thanks to the open-source community and contributors who have made this educational platform possible.

---

*Last Updated: $(date +'%Y-%m-%d')*
*This documentation is maintained as part of the Schulos project.*

## Getting Started Quickly

### 1-Minute Setup
```bash
# Clone and start
https://github.com/cetinmustafa83/schulos

cd schulos
npm run dev
```

### 5-Minute Demo
The system includes demo data for exploration:
- School: "Test Academy"
- Teacher: "Demo Teacher"
- Students: Multiple test students
- Sample assessments and grades

Visit `http://localhost:3000` and use demo credentials:
- **Email**: `demo@schulos.dev`
- **Password**: `demodemo`

### Next Steps
1. **Explore Features**: Try the demo account
2. **Set Up Production**: Configure environment variables
3. **Customize**: Modify for your school needs
4. **Train Users**: Use provided documentation
5. **Contact Support**: Reach out for assistance

---

*This README was generated to provide comprehensive project documentation.*
*For more detailed information, refer to the comprehensive documentation in `/docs/`.*

## Project Status

✅ **Ready for Production**  
📚 **Complete Documentation**  
🔒 **Security Audited**  
⚡ **Performance Optimized**  
🎓 **Educational Focus**  

---

*This platform is continuously evolving. Report issues and suggest features to improve the educational experience.*

---

**Need help?** Check our documentation in `/docs/` or visit our GitHub repository.

**Contribute?** Fork this repository and submit pull requests following our contribution guidelines.
