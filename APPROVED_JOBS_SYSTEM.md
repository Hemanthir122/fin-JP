# Approved External Jobs System

## How It Works

### 1. **Approval Workflow**
- When you approve a job in the External Jobs admin panel, it sets the job's `status` field to `'approved'` in the database
- The approval is stored permanently in MongoDB with the `approvedAt` timestamp
- Rejected jobs have `status: 'rejected'`
- Pending jobs have `status: 'pending'`

### 2. **Public Display**
- Only jobs with `status: 'approved'` appear on the public Jobs page
- Approved external jobs are mixed with internal jobs and sorted by date
- When you scrape again, unapproved jobs get replaced, but approved ones stay in the database

### 3. **Database Schema**
The ExternalJob model includes:
```javascript
status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'published'],
    default: 'pending'
},
approvedAt: {
    type: Date
},
approvedBy: {
    type: String
}
```

### 4. **API Endpoints**

#### Admin Panel (Internal Use)
- `GET /api/external-jobs` - Fetch all external jobs (pending, approved, rejected) for admin review
- `PATCH /api/external-jobs/:id/status` - Update job status (approve/reject)

#### Public Jobs Page
- `GET /api/jobs` - Fetches both internal jobs AND approved external jobs
- External jobs are automatically included in the results with `source: 'external'`

#### Approved Jobs Only
- `GET /api/external-jobs/approved/list` - Fetch only approved external jobs (if needed separately)

### 5. **Frontend Behavior**

#### Admin Panel (ExternalJobs.jsx)
- Shows all jobs (pending, approved, rejected)
- When you click "Approve", it sends a PATCH request to update status to 'approved'
- The UI immediately reflects the change with green background
- Rejected jobs show with red background

#### Public Jobs Page (Jobs.jsx)
- Automatically includes approved external jobs in the results
- External jobs are formatted to match internal job structure:
  - `role` → `title`
  - `salary` → `package`
  - `source: 'external'` flag for identification

### 6. **Data Persistence**
- Approved jobs are stored in the local MongoDB database
- They persist even after new scrapes
- Unapproved jobs from the external scraper database can be replaced
- Approved jobs are never deleted by scraping

### 7. **Workflow Example**

1. **Scrape**: New jobs are added with `status: 'pending'`
2. **Review**: Admin reviews jobs in External Jobs panel
3. **Approve**: Click "Approve" → `status` changes to `'approved'` → `approvedAt` timestamp is set
4. **Display**: Job automatically appears on public Jobs page
5. **Scrape Again**: New pending jobs are added, but approved jobs remain unchanged
6. **Reject**: Rejected jobs have `status: 'rejected'` and don't appear on public page

### 8. **Benefits**
✅ Approved jobs persist across scrapes
✅ No data loss when scraping again
✅ Clean separation between pending and approved jobs
✅ Automatic inclusion in public jobs list
✅ Admin has full control over what appears publicly
✅ Boolean-like status field makes filtering simple
