const mongoose = require('mongoose');

class ExternalDbService {
    constructor() {
        this.connection = null;
        this.db = null;
        this.connectionString = process.env.EXTERNAL_DB_URI || 'mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0';
    }

    async connect() {
        if (!this.connection || this.connection.readyState !== 1) {
            try {
                console.log('🔄 Connecting to external jobs database...');
                this.connection = await mongoose.createConnection(this.connectionString, {
                    dbName: 'jobs_db',
                    serverSelectionTimeoutMS: 30000,
                    socketTimeoutMS: 45000,
                    retryWrites: true,
                    maxPoolSize: 10,
                }).asPromise();
                
                console.log('✅ Connected to external jobs database');
            } catch (error) {
                console.error('❌ Error connecting to external database:', error.message);
                console.error('❌ Connection string:', this.connectionString.substring(0, 50) + '...');
                console.error('❌ Full error:', error);
                this.connection = null;
                this.db = null;
                throw new Error(`Failed to connect to external database: ${error.message}. Please check: 1) IP whitelist in MongoDB Atlas, 2) Database credentials, 3) Network connectivity`);
            }
        }
        
        // Get db from connection
        this.db = this.connection.db;
        
        if (!this.db) {
            throw new Error('Database connection is null. Please check MongoDB Atlas IP whitelist and credentials.');
        }
        
        return this.db;
    }

    async getJobsCollection() {
        const db = await this.connect();
        return db.collection('jobs');
    }

    async getJobsFromExternal(filters = {}, page = 1, limit = 20) {
        try {
            const collection = await this.getJobsCollection();
            let query = {};

            // Handle status filter
            if (filters.status) {
                // If status is explicitly provided, filter by that status only
                query.status = filters.status;
                console.log(`[getJobsFromExternal] Filtering by status: ${filters.status}`);
            } else {
                // Default: show jobs that are NOT approved or rejected (i.e., pending or no status)
                query.$and = [
                    { status: { $ne: 'approved' } },
                    { status: { $ne: 'rejected' } }
                ];
                console.log(`[getJobsFromExternal] Using default filter: exclude approved and rejected jobs`);
            }

            if (filters.company?.trim()) {
                if (query.$and) {
                    query.$and.push({ company: filters.company.trim() });
                } else {
                    query.company = filters.company.trim();
                }
            }
            
            if (filters.department?.trim()) {
                const deptQuery = { department: { $regex: filters.department.trim(), $options: 'i' } };
                if (query.$and) {
                    query.$and.push(deptQuery);
                } else {
                    Object.assign(query, deptQuery);
                }
            }
            
            if (filters.jobType?.trim()) {
                const typeQuery = { job_type: { $regex: filters.jobType.trim(), $options: 'i' } };
                if (query.$and) {
                    query.$and.push(typeQuery);
                } else {
                    Object.assign(query, typeQuery);
                }
            }
            
            if (filters.experience?.trim()) {
                const expQuery = { experience: { $regex: filters.experience.trim(), $options: 'i' } };
                if (query.$and) {
                    query.$and.push(expQuery);
                } else {
                    Object.assign(query, expQuery);
                }
            }

            if (filters.location?.trim()) {
                const loc = filters.location.trim();
                const locQuery = { $or: [{ location: loc }, { country: loc }] };
                if (query.$and) {
                    query.$and.push(locQuery);
                } else {
                    Object.assign(query, locQuery);
                }
            }

            if (filters.search?.trim()) {
                const s = filters.search.trim();
                const searchQuery = {
                    $or: [
                        { role: { $regex: s, $options: 'i' } },
                        { company: { $regex: s, $options: 'i' } },
                        { department: { $regex: s, $options: 'i' } },
                        { description: { $regex: s, $options: 'i' } }
                    ]
                };
                if (query.$and) {
                    query.$and.push(searchQuery);
                } else {
                    Object.assign(query, searchQuery);
                }
            }

            const skip = (page - 1) * limit;
            const [jobs, total] = await Promise.all([
                collection.find(query).sort({ scraped_at: -1 }).skip(skip).limit(limit).toArray(),
                collection.countDocuments(query)
            ]);

            console.log(`[getJobsFromExternal] Query:`, JSON.stringify(query), `Found: ${total} jobs`);

            return { jobs, total, totalPages: Math.ceil(total / limit), currentPage: page };
        } catch (error) {
            console.error('Error fetching jobs from external database:', error);
            throw error;
        }
    }

    async syncJobsFromExternal(filters = {}, limit = 100) {
        try {
            const collection = await this.getJobsCollection();
            
            // Build query for external DB
            let query = {};
            if (filters.company) query.company = { $regex: filters.company, $options: 'i' };
            if (filters.department) query.department = { $regex: filters.department, $options: 'i' };
            if (filters.country) query.country = { $regex: filters.country, $options: 'i' };
            if (filters.experience) query.experience = { $regex: filters.experience, $options: 'i' };
            if (filters.skills) {
                const skillsArray = filters.skills.split(',').map(s => s.trim());
                query.skills = { $in: skillsArray.map(skill => new RegExp(skill, 'i')) };
            }
            
            // Fetch jobs from external DB
            const externalJobs = await collection
                .find(query)
                .sort({ scraped_at: -1 })
                .limit(parseInt(limit))
                .toArray();
            
            return externalJobs;
        } catch (error) {
            console.error('Error syncing from external database:', error);
            throw error;
        }
    }

    async getExternalJobStats() {
        try {
            const collection = await this.getJobsCollection();
            
            const [
                totalJobs,
                companiesCount,
                recentJobs,
                jobsByCountry,
                jobsByDepartment
            ] = await Promise.all([
                collection.countDocuments(),
                collection.distinct('company').then(companies => companies.length),
                collection.find().sort({ scraped_at: -1 }).limit(5).toArray(),
                collection.aggregate([
                    { $group: { _id: '$country', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray(),
                collection.aggregate([
                    { $group: { _id: '$department', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 }
                ]).toArray()
            ]);
            
            return {
                totalJobs,
                companiesCount,
                recentJobs,
                jobsByCountry,
                jobsByDepartment
            };
        } catch (error) {
            console.error('Error getting external database stats:', error);
            throw error;
        }
    }

    async searchExternalJobs(searchTerm, limit = 50) {
        try {
            const collection = await this.getJobsCollection();
            
            const query = {
                $or: [
                    { role: { $regex: searchTerm, $options: 'i' } },
                    { company: { $regex: searchTerm, $options: 'i' } },
                    { department: { $regex: searchTerm, $options: 'i' } },
                    { description: { $regex: searchTerm, $options: 'i' } },
                    { skills: { $in: [new RegExp(searchTerm, 'i')] } }
                ]
            };
            
            const jobs = await collection
                .find(query)
                .sort({ scraped_at: -1 })
                .limit(parseInt(limit))
                .toArray();
            
            return jobs;
        } catch (error) {
            console.error('Error searching external database:', error);
            throw error;
        }
    }

    async getFilterOptions() {
        try {
            const collection = await this.getJobsCollection();
            
            const [companies, departments, countries, experiences, jobTypes, skills] = await Promise.all([
                collection.distinct('company'),
                collection.distinct('department'),
                collection.distinct('country'),
                collection.distinct('experience'),
                collection.distinct('job_type'),
                collection.aggregate([
                    { $unwind: '$skills' },
                    { $group: { _id: '$skills', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 100 },
                    { $project: { _id: 1 } }
                ]).toArray()
            ]);
            
            return {
                companies: companies.filter(Boolean).sort(),
                departments: departments.filter(Boolean).sort(),
                countries: countries.filter(Boolean).sort(),
                experiences: experiences.filter(Boolean).sort(),
                jobTypes: jobTypes.filter(Boolean).sort(),
                skills: skills.map(s => s._id).filter(Boolean)
            };
        } catch (error) {
            console.error('Error getting filter options:', error);
            throw error;
        }
    }

    async getCompanyLogosCollection() {
        const db = await this.connect();
        return db.collection('company_logos');
    }

    async getCompanyLogo(companyName) {
        try {
            const collection = await this.getCompanyLogosCollection();
            const logo = await collection.findOne({ company: companyName });
            return logo ? logo.logo : null;
        } catch (error) {
            console.error('Error getting company logo:', error);
            return null;
        }
    }

    async saveCompanyLogo(companyName, logoUrl) {
        try {
            const collection = await this.getCompanyLogosCollection();
            const result = await collection.updateOne(
                { company: companyName },
                { $set: { company: companyName, logo: logoUrl, updatedAt: new Date() } },
                { upsert: true }
            );
            console.log(`[saveCompanyLogo] Saved logo for ${companyName}`);
            return result;
        } catch (error) {
            console.error('Error saving company logo:', error);
            throw error;
        }
    }

    async getAllCompanyLogos() {
        try {
            const collection = await this.getCompanyLogosCollection();
            const logos = await collection.find({}).toArray();
            const logoMap = {};
            logos.forEach(item => {
                logoMap[item.company] = item.logo;
            });
            return logoMap;
        } catch (error) {
            console.error('Error getting all company logos:', error);
            return {};
        }
    }

    async close() {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
            this.db = null;
            console.log('Closed external database connection');
        }
    }
}

// Export singleton instance
module.exports = new ExternalDbService();