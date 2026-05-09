const mongoose = require('mongoose');
require('dotenv').config();

const ExternalJob = require('../models/ExternalJob');

async function setupExternalJobsCollection() {
    try {
        // Connect to main database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobsconnect');
        console.log('Connected to main database');

        // Create indexes for ExternalJob collection
        console.log('Creating indexes for ExternalJob collection...');
        
        await ExternalJob.collection.createIndex({ job_id: 1 }, { unique: true });
        console.log('✅ Created unique index on job_id');
        
        await ExternalJob.collection.createIndex({ company: 1 });
        console.log('✅ Created index on company');
        
        await ExternalJob.collection.createIndex({ status: 1 });
        console.log('✅ Created index on status');
        
        await ExternalJob.collection.createIndex({ scraped_at: -1 });
        console.log('✅ Created index on scraped_at (descending)');
        
        await ExternalJob.collection.createIndex({ country: 1 });
        console.log('✅ Created index on country');
        
        await ExternalJob.collection.createIndex({ department: 1 });
        console.log('✅ Created index on department');
        
        await ExternalJob.collection.createIndex({ experience: 1 });
        console.log('✅ Created index on experience');
        
        await ExternalJob.collection.createIndex({ 
            role: 'text', 
            company: 'text', 
            department: 'text',
            description: 'text'
        });
        console.log('✅ Created text index for search functionality');
        
        // Compound indexes for common filter combinations
        await ExternalJob.collection.createIndex({ status: 1, company: 1 });
        console.log('✅ Created compound index on status + company');
        
        await ExternalJob.collection.createIndex({ status: 1, scraped_at: -1 });
        console.log('✅ Created compound index on status + scraped_at');
        
        await ExternalJob.collection.createIndex({ company: 1, department: 1 });
        console.log('✅ Created compound index on company + department');

        // Check current collection stats
        const stats = await ExternalJob.collection.stats();
        console.log('\nCollection Statistics:');
        console.log(`Documents: ${stats.count || 0}`);
        console.log(`Storage Size: ${Math.round((stats.storageSize || 0) / 1024)} KB`);
        console.log(`Index Count: ${stats.nindexes || 0}`);
        console.log(`Total Index Size: ${Math.round((stats.totalIndexSize || 0) / 1024)} KB`);

        // List all indexes
        const indexes = await ExternalJob.collection.listIndexes().toArray();
        console.log('\nCreated Indexes:');
        indexes.forEach((index, i) => {
            console.log(`${i + 1}. ${index.name}: ${JSON.stringify(index.key)}`);
        });

        console.log('\n🎉 External Jobs collection setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the setup
setupExternalJobsCollection();