# Job Scraper Database Access Guide

This guide explains how to access and query the MongoDB database containing all scraped job data from various companies.

## Database Overview

**Database Name:** `jobs_db`  

**Collection Name:** `jobs`  

**MongoDB URI:** `mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0`

## Database Schema

Each job document contains the following fields:

```json

{

  "_id": "ObjectId",

  "company": "String - Company name",

  "job_id": "String - Unique job identifier",

  "role": "String - Job title/position",

  "location": "String/Array - Job location(s)",

  "country": "String/Array - Country/region",

  "department": "String - Department/team",

  "experience": "String - Experience level (Senior, Lead, Manager, etc.)",

  "job_type": "String - Employment type (Full-time, Part-time, etc.)",

  "salary": "String - Salary range",

  "skills": "Array - Technical skills required",

  "description": "String - Job description (may be empty)",

  "apply_link": "String - Direct application URL",

  "scraped_at": "String - ISO timestamp when scraped",

  "created_at": "String - ISO timestamp when first added to DB"

}

```

## Access Methods

### 1. MongoDB Compass (GUI)

**Download:** https://www.mongodb.com/products/compass

**Connection String:**

```

mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0

```

**Steps:**

1. Install MongoDB Compass

2. Open Compass and click "New Connection"

3. Paste the connection string above

4. Click "Connect"

5. Navigate to `jobs_db` → `jobs` collection

### 2. MongoDB Shell (mongosh)

**Installation:** https://www.mongodb.com/docs/mongodb-shell/install/

**Connect:**

```bash

mongosh "mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0"

```

**Basic Commands:**

```javascript

// Switch to jobs database

use jobs_db

// Count total jobs

db.jobs.countDocuments()

// View first 5 jobs

db.jobs.find().limit(5)

// Find jobs by company

db.jobs.find({"company": "Google"})

// Find engineering jobs

db.jobs.find({"department": "Engineering"})

```

### 3. Python Access

**Install Dependencies:**

```bash

pip install pymongo python-dotenv

```

**Python Code:**

```python

from pymongo import MongoClient

import json

# Connection

client = MongoClient("mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0")

db = client.jobs_db

collection = db.jobs

# Basic queries

total_jobs = collection.count_documents({})

print(f"Total jobs: {total_jobs}")

# Find jobs by company

google_jobs = list(collection.find({"company": "Google"}))

print(f"Google jobs: {len(google_jobs)}")

# Find remote jobs

remote_jobs = list(collection.find({"location": {"$regex": "Remote", "$options": "i"}}))

# Find senior engineering roles

senior_eng = list(collection.find({

    "experience": "Senior",

    "department": {"$regex": "Engineering", "$options": "i"}

}))

# Close connection

client.close()

```

### 4. Node.js Access

**Install Dependencies:**

```bash

npm install mongodb

```

**Node.js Code:**

```javascript

const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri);

async function main() {

    try {

        await client.connect();

        const db = client.db('jobs_db');

        const collection = db.collection('jobs');

        

        // Count documents

        const count = await collection.countDocuments();

        console.log(`Total jobs: ${count}`);

        

        // Find jobs by company

        const googleJobs = await collection.find({ company: "Google" }).toArray();

        console.log(`Google jobs: ${googleJobs.length}`);

        

    } finally {

        await client.close();

    }

}

main().catch(console.error);

```

## Common Queries

### 1. Company Statistics

```javascript

// MongoDB Shell

db.jobs.aggregate([

    { $group: { _id: "$company", count: { $sum: 1 } } },

    { $sort: { count: -1 } }

])

```

```python

# Python

pipeline = [

    {"$group": {"_id": "$company", "count": {"$sum": 1}}},

    {"$sort": {"count": -1}}

]

company_stats = list(collection.aggregate(pipeline))

```

### 2. Jobs by Location

```javascript

// MongoDB Shell

db.jobs.aggregate([

    { $group: { _id: "$country", count: { $sum: 1 } } },

    { $sort: { count: -1 } }

])

```

### 3. Skills Analysis

```javascript

// MongoDB Shell - Most common skills

db.jobs.aggregate([

    { $unwind: "$skills" },

    { $group: { _id: "$skills", count: { $sum: 1 } } },

    { $sort: { count: -1 } },

    { $limit: 20 }

])

```

### 4. Recent Jobs (Last 7 days)

```javascript

// MongoDB Shell

db.jobs.find({

    "scraped_at": {

        $gte: new Date(Date.now() - 7*24*60*60*1000).toISOString()

    }

})

```

```python

# Python

from datetime import datetime, timedelta

seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()

recent_jobs = list(collection.find({

    "scraped_at": {"$gte": seven_days_ago}

}))

```

### 5. Filter by Experience Level

```javascript

// Senior roles only

db.jobs.find({"experience": "Senior"})

// Management roles

db.jobs.find({"experience": {"$in": ["Manager", "Director", "Lead"]}})

```

### 6. Search by Skills

```javascript

// Jobs requiring Python

db.jobs.find({"skills": "Python"})

// Jobs requiring multiple skills

db.jobs.find({"skills": {"$all": ["Python", "JavaScript"]}})

// Jobs requiring any of these skills

db.jobs.find({"skills": {"$in": ["React", "Angular", "Vue"]}})

```

### 7. Full-text Search

```javascript

// Search in job titles

db.jobs.find({"role": {"$regex": "Software Engineer", "$options": "i"}})

// Search in multiple fields

db.jobs.find({

    "$or": [

        {"role": {"$regex": "Data Scientist", "$options": "i"}},

        {"department": {"$regex": "Data", "$options": "i"}}

    ]

})

```

## Available Companies

Current companies in the database include:

- Andela

- Canonical

- Airbnb

- ABB

- Accenture

- Amdocs

- Allegro

- 247.ai

- PagerDuty

- Zoom

- Coinbase

- Aspora

- Aptiv

- Bosch

- Siemens

- And many more...

## Data Export

### Export to JSON

```python

# Python - Export all jobs to JSON

import json

from pymongo import MongoClient

client = MongoClient("mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0")

db = client.jobs_db

collection = db.jobs

# Export all jobs

all_jobs = list(collection.find({}, {"_id": 0}))  # Exclude MongoDB _id field

with open('all_jobs_export.json', 'w', encoding='utf-8') as f:

    json.dump(all_jobs, f, indent=2, ensure_ascii=False)

print(f"Exported {len(all_jobs)} jobs to all_jobs_export.json")

client.close()

```

### Export to CSV

```python

# Python - Export to CSV

import csv

from pymongo import MongoClient

client = MongoClient("mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0")

db = client.jobs_db

collection = db.jobs

jobs = list(collection.find({}, {"_id": 0}))

if jobs:

    with open('jobs_export.csv', 'w', newline='', encoding='utf-8') as csvfile:

        fieldnames = jobs[0].keys()

        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        

        writer.writeheader()

        for job in jobs:

            # Convert arrays to strings for CSV

            job_copy = job.copy()

            if isinstance(job_copy.get('skills'), list):

                job_copy['skills'] = ', '.join(job_copy['skills'])

            if isinstance(job_copy.get('location'), list):

                job_copy['location'] = ', '.join(job_copy['location'])

            writer.writerow(job_copy)

print(f"Exported {len(jobs)} jobs to jobs_export.csv")

client.close()

```

## API Integration

### Simple REST API (Python Flask)

```python

from flask import Flask, jsonify, request

from pymongo import MongoClient

import json

app = Flask(__name__)

# MongoDB connection

client = MongoClient("mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0")

db = client.jobs_db

collection = db.jobs

@app.route('/api/jobs', methods=['GET'])

def get_jobs():

    # Query parameters

    company = request.args.get('company')

    department = request.args.get('department')

    experience = request.args.get('experience')

    limit = int(request.args.get('limit', 100))

    

    # Build query

    query = {}

    if company:

        query['company'] = company

    if department:

        query['department'] = {"$regex": department, "$options": "i"}

    if experience:

        query['experience'] = experience

    

    # Execute query

    jobs = list(collection.find(query, {"_id": 0}).limit(limit))

    

    return jsonify({

        'count': len(jobs),

        'jobs': jobs

    })

@app.route('/api/companies', methods=['GET'])

def get_companies():

    pipeline = [

        {"$group": {"_id": "$company", "count": {"$sum": 1}}},

        {"$sort": {"count": -1}}

    ]

    companies = list(collection.aggregate(pipeline))

    return jsonify(companies)

if __name__ == '__main__':

    app.run(debug=True)

```

## Security Notes

- The provided credentials are read-only access

- Do not share the connection string publicly

- For production use, create separate user accounts with appropriate permissions

- Consider using environment variables for connection strings

## Troubleshooting

### Connection Issues

1. **Network connectivity:** Ensure internet connection is stable

2. **Firewall:** MongoDB Atlas requires internet access on port 27017

3. **IP Whitelist:** Current setup allows all IPs (0.0.0.0/0)

### Query Performance

1. **Indexes:** The database has indexes on common fields (company, country, scraped_at)

2. **Limit results:** Use `.limit()` for large result sets

3. **Projection:** Use projection to fetch only needed fields

### Data Freshness

- Jobs are updated when scrapers run (typically daily)

- Check `scraped_at` field for last update time

- Some companies may have more frequent updates than others

## Support

For database access issues or questions:

1. Check connection string format

2. Verify network connectivity

3. Review query syntax

4. Check field names and data types

## Example Use Cases

1. **Job Market Analysis:** Analyze trends by company, location, skills

2. **Skill Demand:** Track most requested technical skills

3. **Salary Research:** Compare compensation across companies/roles

4. **Location Insights:** Remote vs office-based opportunities

5. **Career Planning:** Identify growth paths and required skills                                                                                             see this a an additional db write additional section backedn dont effect existing logic make a new section in ui to access and this should not publish to user until admin approve and make lot of filter for this please  and also i want to update logo for company and save in exisitng db if already exisit use that logo only or else i will give u this should not effect other and  this is mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0

     new db to access jobs