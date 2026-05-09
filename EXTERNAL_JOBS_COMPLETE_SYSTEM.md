# External Jobs Complete System - Approve, Display, Filter & Delete

## Overview
Complete system for managing external jobs with:
- ✅ Approve → Save to main Job DB
- ✅ Display on portal as regular jobs
- ✅ Separate "External Jobs" section with filters
- ✅ Multi-select & bulk delete
- ✅ Schedule deletion for later

## How It Works

### 1. Approve External Job
When you click "Approve" on an external job:

```
External Job (ExternalJob collection)
    ↓ (click Approve)
Create new Job in main Job collection
    ↓
Mark ExternalJob as approved + linked
    ↓
Job appears on public portal immediately
```

**What happens:**
- Creates a new Job with `source: 'external'`
- Sets status to `'published'`
- Links ExternalJob to internal Job via `internalJobId`
- Job appears on public Jobs page

### 2. Display on Portal
Approved external jobs appear on the public Jobs page mixed with internal jobs.

**API:** `GET /api/jobs`
- Returns both internal jobs and approved external jobs
- Sorted by date (newest first)
- Supports all filters (search, location, company)

### 3. External Jobs Section
New section showing all external jobs with time-based filters.

**API:** `GET /api/external-jobs/list/by-time?timeRange=1day&status=pending`

**Time ranges:**
- `1day` - Jobs posted in last 24 hours
- `1week` - Jobs posted in last 7 days
- `1month` - Jobs posted in last 30 days
- `all` - All jobs

**Status filters:**
- `pending` - Waiting for approval
- `approved` - Approved and published
- `rejected` - Rejected jobs
- `scheduled_delete` - Scheduled for deletion

### 4. Multi-Select & Bulk Actions
Select multiple jobs and perform bulk actions.

**Bulk Actions:**
- **Approve** - Approve multiple jobs at once
- **Reject** - Reject multiple jobs
- **Delete** - Delete immediately or schedule for later

**API:** `POST /api/external-jobs/bulk-action`

```javascript
{
    action: 'approve',  // or 'reject', 'delete'
    jobIds: ['id1', 'id2', 'id3'],
    adminNotes: 'Bulk approved',
    scheduleDeleteAt: '2024-04-25T10:00:00Z'  // Optional, for delete action
}
```

### 5. Schedule Deletion
Delete jobs at a specific time instead of immediately.

**Example:**
```javascript
{
    action: 'delete',
    jobIds: ['id1', 'id2'],
    scheduleDeleteAt: '2024-04-25T10:00:00Z'
}
```

**What happens:**
- Job status changes to `'scheduled_delete'`
- `scheduleDeleteAt` timestamp is set
- Job is deleted at the scheduled time (requires a scheduler job)
- Can be cancelled before the scheduled time

## Database Schema

### ExternalJob Model
```javascript
{
    _id: ObjectId,
    job_id: String,              // External DB ID
    company: String,
    role: String,
    location: Mixed,
    status: String,              // 'pending', 'approved', 'rejected', 'scheduled_delete'
    approvedAt: Date,
    approvedBy: String,
    scheduleDeleteAt: Date,      // NEW: When to delete
    mappedToInternalJob: Boolean,
    internalJobId: ObjectId,     // Link to Job collection
    // ... other fields
}
```

### Job Model (Main)
```javascript
{
    _id: ObjectId,
    title: String,
    company: String,
    status: 'published',
    source: 'external',          // NEW: Marks as from external
    externalJobId: ObjectId,     // Link back to ExternalJob
    // ... other fields
}
```

## API Endpoints

### Get External Jobs by Time
```
GET /api/external-jobs/list/by-time?timeRange=1day&status=pending
```

**Response:**
```json
{
    "timeRange": "1day",
    "status": "pending",
    "total": 15,
    "grouped": {
        "4/20/2024": [job1, job2, ...],
        "4/19/2024": [job3, job4, ...]
    },
    "jobs": [...]
}
```

### Bulk Actions
```
POST /api/external-jobs/bulk-action
```

**Request:**
```json
{
    "action": "approve",
    "jobIds": ["id1", "id2", "id3"],
    "adminNotes": "Approved in bulk"
}
```

**Response:**
```json
{
    "message": "Bulk approve completed: 3 jobs published",
    "approvedCount": 3
}
```

### Delete with Schedule
```
POST /api/external-jobs/bulk-action
```

**Request:**
```json
{
    "action": "delete",
    "jobIds": ["id1", "id2"],
    "scheduleDeleteAt": "2024-04-25T10:00:00Z"
}
```

**Response:**
```json
{
    "message": "2 jobs scheduled for deletion on 2024-04-25T10:00:00Z",
    "modifiedCount": 2
}
```

## Frontend Implementation

### Multi-Select Checkboxes
```jsx
const [selectedJobs, setSelectedJobs] = useState([]);

const toggleSelect = (jobId) => {
    setSelectedJobs(prev => 
        prev.includes(jobId) 
            ? prev.filter(id => id !== jobId)
            : [...prev, jobId]
    );
};

const handleBulkApprove = async () => {
    await api.post('/external-jobs/bulk-action', {
        action: 'approve',
        jobIds: selectedJobs
    });
    setSelectedJobs([]);
};
```

### Time Filter
```jsx
const [timeRange, setTimeRange] = useState('all');

const fetchJobsByTime = async () => {
    const res = await api.get(`/external-jobs/list/by-time?timeRange=${timeRange}&status=pending`);
    setJobs(res.data.jobs);
};
```

### Schedule Deletion
```jsx
const [deleteDate, setDeleteDate] = useState(null);

const handleScheduleDelete = async () => {
    await api.post('/external-jobs/bulk-action', {
        action: 'delete',
        jobIds: selectedJobs,
        scheduleDeleteAt: deleteDate
    });
};
```

## Workflow Example

### Step 1: View External Jobs
1. Go to External Jobs page
2. See all pending jobs
3. Filter by time (1 day, 1 week, etc.)

### Step 2: Select & Approve
1. Check boxes to select jobs
2. Click "Approve Selected"
3. Jobs are created in main Job DB
4. Jobs appear on public portal

### Step 3: Monitor Approved
1. View approved jobs in separate section
2. See which jobs are published
3. Track approval history

### Step 4: Delete Old Jobs
1. Select jobs to delete
2. Choose "Delete Now" or "Schedule Delete"
3. If scheduled, set date/time
4. Jobs are deleted at scheduled time

## Benefits

✅ **Approved jobs appear immediately** on public portal
✅ **Separate management section** for external jobs
✅ **Time-based filtering** (1 day, 1 week, 1 month)
✅ **Bulk operations** for efficiency
✅ **Schedule deletion** for planned cleanup
✅ **Full audit trail** (approvedBy, approvedAt, etc.)
✅ **Link tracking** between external and internal jobs

## Testing Checklist

- [ ] Approve single job → appears on portal
- [ ] Approve multiple jobs → all appear on portal
- [ ] Filter by 1 day → shows only recent jobs
- [ ] Filter by 1 week → shows week's jobs
- [ ] Select multiple jobs → bulk approve works
- [ ] Schedule delete → job marked for deletion
- [ ] Delete immediately → job removed from DB
- [ ] Reload page → approved jobs persist
- [ ] Search filters work with external jobs
- [ ] Location filters work with external jobs

## Troubleshooting

### Approved jobs not showing
- Check if job was created in main Job collection
- Verify `status: 'published'` in Job
- Check `source: 'external'` field

### Bulk actions not working
- Verify jobIds are valid MongoDB ObjectIds
- Check action is one of: approve, reject, delete
- Ensure all jobs exist in database

### Scheduled deletion not working
- Requires a scheduler job to run periodically
- Check `scheduleDeleteAt` timestamp
- Verify job status is `'scheduled_delete'`

## Next Steps

1. **Implement scheduler** - Run periodic job to delete scheduled jobs
2. **Add UI for bulk actions** - Multi-select checkboxes and action buttons
3. **Add time filter UI** - Dropdown for 1 day, 1 week, 1 month
4. **Add schedule UI** - Date/time picker for scheduled deletion
5. **Add notifications** - Alert when jobs are approved/deleted
