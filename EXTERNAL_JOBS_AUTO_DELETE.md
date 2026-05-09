# External Jobs Auto-Delete Feature

## ✅ Implementation Complete

External jobs that are approved from the external database are now automatically deleted after 7 days.

## 🔧 How It Works

### 1. **When External Job is Approved:**
- Job is saved to main Job collection
- `externalJobApprovedAt` field is set to current date/time
- `autoDeleteAt` field is set to 7 days from approval date
- `isExternalJob` flag is set to `true`

### 2. **Auto-Delete Scheduler:**
- Runs every hour (3600000 ms)
- Checks for external jobs where `autoDeleteAt` <= current time
- Marks expired jobs as inactive (`isActive: false`)
- Sets status to `'expired'`
- Logs deleted jobs to console

### 3. **View Deleted Jobs:**
- API endpoint: `GET /api/external-jobs/deleted`
- Returns list of auto-deleted external jobs
- Shows: title, company, location, approval date, delete date
- Sorted by most recently deleted first
- Limited to 100 most recent deletions

## 📁 Files Modified/Created

### Created:
1. `server/services/autoDeleteService.js` - Auto-delete service with scheduler

### Modified:
1. `server/models/Job.js` - Added fields:
   - `externalJobApprovedAt` (Date) - When job was approved
   - `autoDeleteAt` (Date) - When job should be auto-deleted

2. `server/routes/externalJobRoutes.js` - Added:
   - `GET /deleted` endpoint to view deleted jobs
   - Set auto-delete dates when approving external jobs

3. `server/server.js` - Added:
   - Auto-delete scheduler startup

## 🚀 API Endpoints

### Get Deleted External Jobs
```
GET /api/external-jobs/deleted
```

**Response:**
```json
{
  "total": 5,
  "jobs": [
    {
      "_id": "123abc",
      "title": "Software Engineer",
      "company": "Google",
      "location": "Bangalore, India",
      "externalJobApprovedAt": "2024-01-01T00:00:00.000Z",
      "autoDeleteAt": "2024-01-08T00:00:00.000Z",
      "updatedAt": "2024-01-08T00:00:00.000Z"
    }
  ]
}
```

## 📊 Scheduler Behavior

### Startup:
```
🗑️  Auto-delete scheduler started for external jobs (7-day expiry)
[Auto-Delete] Found 3 expired external jobs
[Auto-Delete] Marked 3 external jobs as inactive
```

### Hourly Check:
```
[Auto-Delete] No expired external jobs to delete
```
or
```
[Auto-Delete] Found 2 expired external jobs
[Auto-Delete] Marked 2 external jobs as inactive
```

## 🎯 Features

1. **Automatic Deletion**: Jobs are automatically marked as inactive after 7 days
2. **Soft Delete**: Jobs are not permanently deleted, just marked as inactive
3. **Audit Trail**: Deleted jobs can be viewed via API
4. **Hourly Checks**: Scheduler runs every hour to check for expired jobs
5. **Immediate Startup**: Runs once on server startup to catch any missed deletions

## 🔍 Viewing Deleted Jobs in Portal

To view deleted jobs in the admin portal, you can:

1. **Create a new page** at `client/src/pages/admin/DeletedExternalJobs.jsx`
2. **Fetch data** from `/api/external-jobs/deleted`
3. **Display** in a table or card format
4. **Show details**: Title, Company, Approved Date, Deleted Date

### Example Component Structure:
```jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';

function DeletedExternalJobs() {
    const [deletedJobs, setDeletedJobs] = useState([]);
    
    useEffect(() => {
        fetchDeletedJobs();
    }, []);
    
    const fetchDeletedJobs = async () => {
        try {
            const res = await api.get('/external-jobs/deleted');
            setDeletedJobs(res.data.jobs);
        } catch (e) {
            console.error(e);
        }
    };
    
    return (
        <div>
            <h1>Auto-Deleted External Jobs</h1>
            <p>Jobs that were automatically deleted after 7 days</p>
            {/* Display jobs in table/cards */}
        </div>
    );
}
```

## ⚙️ Configuration

### Change Auto-Delete Duration:
Edit `server/routes/externalJobRoutes.js`:
```javascript
// Change from 7 days to 14 days:
autoDeleteAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
```

### Change Scheduler Frequency:
Edit `server/services/autoDeleteService.js`:
```javascript
// Change from 1 hour to 6 hours:
setInterval(autoDeleteExpiredExternalJobs, 21600000); // 6 hours
```

## 🧪 Testing

### Test Auto-Delete Manually:
```javascript
const { autoDeleteExpiredExternalJobs } = require('./services/autoDeleteService');

// Run manually
autoDeleteExpiredExternalJobs().then(result => {
    console.log('Deleted:', result.deleted);
    console.log('Jobs:', result.jobs);
});
```

### Test with Short Duration:
For testing, temporarily change the auto-delete duration to 1 minute:
```javascript
autoDeleteAt: new Date(Date.now() + 60 * 1000) // 1 minute
```

## ✅ Status
- Auto-delete feature: ✅ Implemented
- Scheduler: ✅ Running
- API endpoint: ✅ Available
- Audit trail: ✅ Maintained
- Portal view: ⏳ To be implemented (optional)

## 📝 Notes

- Jobs are soft-deleted (marked as inactive) not hard-deleted
- Original external job data remains in external database
- Deleted jobs can be restored by setting `isActive: true`
- Scheduler runs every hour to minimize resource usage
- All deletions are logged to console for monitoring
