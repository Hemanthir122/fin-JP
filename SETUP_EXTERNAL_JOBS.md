# External Jobs Database Setup Guide

This guide will help you set up and configure the External Jobs Database feature in your job portal.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** connection to your main database
3. **Access** to the external jobs database
4. **Admin credentials** for your job portal

## Installation Steps

### 1. Backend Setup

#### Install Dependencies
The required dependencies should already be installed, but verify you have:
```bash
cd server
npm install mongoose express cors dotenv
```

#### Environment Configuration
Ensure your `.env` file in the server directory contains:
```env
MONGODB_URI=your_main_database_connection_string
PORT=5000
# Add any other existing environment variables
```

#### Database Setup
Run the migration script to set up indexes and prepare the ExternalJob collection:
```bash
cd server
npm run setup-external-jobs
```

This will create:
- Unique index on `job_id`
- Indexes on `company`, `status`, `scraped_at`, `country`, `department`, `experience`
- Text search index for full-text search
- Compound indexes for optimized filtering

#### Test External Database Connection
Verify the external database connection works:
```bash
cd server
npm run test-external-db
```

This test will:
- Connect to the external database
- Retrieve filter options
- Get database statistics
- Sync a small sample of jobs
- Test search functionality

### 2. Frontend Setup

#### Install Dependencies
The required dependencies should already be installed:
```bash
cd client
npm install react-router-dom lucide-react
```

#### Verify Routes
Ensure the external jobs route is properly configured in `client/src/App.jsx`. The route should be:
```jsx
<Route path="/admin/external-jobs" element={
  <ProtectedRoute>
    <ExternalJobs />
  </ProtectedRoute>
} />
```

### 3. Start the Application

#### Start Backend Server
```bash
cd server
npm run dev
```

#### Start Frontend Development Server
```bash
cd client
npm run dev
```

## Configuration

### External Database Connection

The external database connection is configured in `server/services/externalDbService.js`:

```javascript
this.connectionString = 'mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/jobs_db?appName=Cluster0';
```

**Security Note**: In production, move this to environment variables:
```env
EXTERNAL_DB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobs_db
```

### Admin Access

To access the External Jobs Database:
1. Log in to the admin panel (`/admin/login`)
2. Navigate to "External Jobs Database" in the sidebar
3. Start syncing and managing external jobs

## Usage Guide

### 1. Initial Job Sync

1. **Access the External Jobs page**: `/admin/external-jobs`
2. **Click "Sync New Jobs"** to import jobs from the external database
3. **Configure sync parameters** (optional):
   - Limit: Number of jobs to sync (default: 100)
   - Company filter: Sync jobs from specific companies
   - Department filter: Sync jobs from specific departments
   - Country filter: Sync jobs from specific countries

### 2. Job Review and Approval

1. **Filter jobs** by status (default shows "Pending" jobs)
2. **Review job details**:
   - Job title and company
   - Location and department
   - Skills and requirements
   - Salary information
   - Job description
3. **Take action**:
   - **Approve**: Mark job as approved for conversion
   - **Reject**: Mark job as rejected with optional notes
   - **Update Logo**: Add or update company logo

### 3. Bulk Operations

1. **Select multiple jobs** using checkboxes
2. **Choose bulk action**:
   - Bulk Approve
   - Bulk Reject  
   - Bulk Publish
3. **Add admin notes** (optional)
4. **Apply action** to all selected jobs

### 4. Job Conversion

1. **Filter for "Approved" jobs**
2. **Click "Convert to Internal Job"** for desired jobs
3. **Jobs automatically appear** in your main job listings
4. **External job status** changes to "Published"

### 5. Company Logo Management

1. **Click "Update Logo"** on any job card
2. **Enter logo URL** in the modal
3. **Preview logo** before saving
4. **Logo automatically applies** to all jobs from that company

## Advanced Features

### Filtering Options

**Basic Filters:**
- Status (Pending, Approved, Rejected, Published, All)
- Search (job titles, companies, departments, descriptions)
- Company dropdown

**Advanced Filters:**
- Department selection
- Country/location selection
- Experience level selection
- Skills filtering (comma-separated)
- Job type selection

### Search Functionality

The system supports:
- **Full-text search** across job titles, companies, departments, and descriptions
- **Skills-based filtering** with comma-separated values
- **Combined filters** for precise job discovery

### Statistics Dashboard

Monitor key metrics:
- Total jobs in external database
- Pending jobs awaiting approval
- Approved jobs ready for conversion
- Published jobs (converted to internal)
- Company and department breakdowns

## API Endpoints

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/external-jobs` | Get filtered external jobs |
| POST | `/api/external-jobs/sync` | Sync jobs from external DB |
| PATCH | `/api/external-jobs/:id/status` | Update job status |
| PATCH | `/api/external-jobs/:id/logo` | Update company logo |
| POST | `/api/external-jobs/:id/convert` | Convert to internal job |
| GET | `/api/external-jobs/filters/options` | Get filter options |
| GET | `/api/external-jobs/stats` | Get job statistics |
| POST | `/api/external-jobs/bulk-action` | Bulk operations |
| GET | `/api/external-jobs/search-external` | Search external DB |
| GET | `/api/external-jobs/external-stats` | External DB stats |

### Example API Calls

#### Sync Jobs with Filters
```bash
curl -X POST http://localhost:5000/api/external-jobs/sync \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 50,
    "company": "Google",
    "department": "Engineering"
  }'
```

#### Get Filtered Jobs
```bash
curl "http://localhost:5000/api/external-jobs?status=pending&company=Microsoft&page=1&limit=20"
```

#### Approve Job
```bash
curl -X PATCH http://localhost:5000/api/external-jobs/JOB_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "adminNotes": "Good opportunity",
    "approvedBy": "admin@example.com"
  }'
```

## Troubleshooting

### Common Issues

#### 1. External Database Connection Failed
**Symptoms**: Cannot sync jobs, connection errors
**Solutions**:
- Verify external database credentials
- Check network connectivity
- Confirm IP whitelist settings
- Run `npm run test-external-db` to diagnose

#### 2. Jobs Not Syncing
**Symptoms**: Sync operation completes but no new jobs
**Solutions**:
- Check if jobs already exist (duplicate prevention)
- Verify external database has new jobs
- Review sync filters (may be too restrictive)
- Check server logs for errors

#### 3. Slow Performance
**Symptoms**: Long loading times, timeouts
**Solutions**:
- Reduce page size (limit parameter)
- Use more specific filters
- Check database indexes with `npm run setup-external-jobs`
- Monitor server resources

#### 4. Logo Updates Not Working
**Symptoms**: Logo URLs not saving or displaying
**Solutions**:
- Verify logo URL is accessible
- Check image format (PNG, JPG, SVG supported)
- Ensure URL is direct link to image
- Check browser console for CORS errors

#### 5. Conversion Errors
**Symptoms**: Cannot convert approved jobs to internal jobs
**Solutions**:
- Verify job is in "approved" status
- Check for required field mappings
- Review server logs for validation errors
- Ensure internal Job model is properly configured

### Debug Mode

Enable debug logging by setting environment variable:
```env
DEBUG=external-jobs
```

### Log Files

Check application logs for detailed error information:
- Server logs: Console output when running `npm run dev`
- Database logs: MongoDB logs for connection issues
- Browser logs: Developer console for frontend errors

## Security Considerations

### Database Access
- External database has read-only access
- Credentials should be stored in environment variables
- Connection pooling prevents resource exhaustion

### Admin Authentication
- All external job routes require admin authentication
- Admin actions are logged with timestamps
- Bulk operations require confirmation

### Data Validation
- All input is sanitized before database queries
- Logo URLs are validated for format and accessibility
- Duplicate job prevention based on unique job_id

## Performance Optimization

### Database Indexes
The setup script creates optimized indexes for:
- Unique lookups (job_id)
- Status filtering (status)
- Company filtering (company)
- Date sorting (scraped_at)
- Full-text search (role, company, department, description)
- Compound queries (status + company, status + date)

### Frontend Optimization
- Pagination limits data transfer
- Debounced search inputs reduce API calls
- Lazy loading for large job lists
- Cached filter options

### Caching Strategy
- Filter options cached for 5 minutes
- Statistics cached for 1 minute
- Logo URLs cached in browser
- Database connections pooled and reused

## Monitoring

### Key Metrics to Monitor
- Jobs synced per day
- Approval/rejection rates
- Conversion success rates
- API response times
- Database connection health
- Error rates and types

### Recommended Monitoring Tools
- Application logs for error tracking
- Database monitoring for performance
- API monitoring for response times
- User activity tracking for admin actions

## Backup and Recovery

### Data Backup
- External database is read-only (no backup needed)
- Internal ExternalJob collection should be included in regular backups
- Company logos should be backed up if stored locally

### Recovery Procedures
- Re-sync jobs from external database if data is lost
- Company logos can be re-added through admin interface
- Admin approval history is preserved in ExternalJob documents

## Support

### Getting Help
1. **Check this documentation** for common issues
2. **Review server logs** for error details
3. **Run diagnostic scripts** (`npm run test-external-db`)
4. **Check database connectivity** and credentials
5. **Contact system administrator** for infrastructure issues

### Reporting Issues
When reporting issues, include:
- Error messages from server logs
- Steps to reproduce the problem
- Browser console errors (for frontend issues)
- Database connection status
- System environment details

## Conclusion

The External Jobs Database feature provides a powerful way to manage external job data with proper admin oversight. Follow this setup guide carefully, and refer to the troubleshooting section if you encounter any issues. The system is designed to be robust and scalable while maintaining data integrity and security.