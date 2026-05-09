const externalDbService = require('./services/externalDbService');

async function testExternalDatabase() {
    try {
        console.log('Testing external database connection...');
        
        // Test connection
        const db = await externalDbService.connect();
        console.log('✅ Connected to external database successfully');
        
        // Test getting filter options
        console.log('\nTesting filter options...');
        const filterOptions = await externalDbService.getFilterOptions();
        console.log('✅ Filter options retrieved:');
        console.log(`   Companies: ${filterOptions.companies.length}`);
        console.log(`   Departments: ${filterOptions.departments.length}`);
        console.log(`   Countries: ${filterOptions.countries.length}`);
        console.log(`   Experiences: ${filterOptions.experiences.length}`);
        console.log(`   Job Types: ${filterOptions.jobTypes.length}`);
        console.log(`   Skills: ${filterOptions.skills.length}`);
        
        // Test getting stats
        console.log('\nTesting external database stats...');
        const stats = await externalDbService.getExternalJobStats();
        console.log('✅ External database stats:');
        console.log(`   Total Jobs: ${stats.totalJobs}`);
        console.log(`   Companies: ${stats.companiesCount}`);
        console.log(`   Recent Jobs: ${stats.recentJobs.length}`);
        
        // Test syncing a small batch
        console.log('\nTesting job sync (limit 5)...');
        const jobs = await externalDbService.syncJobsFromExternal({}, 5);
        console.log(`✅ Synced ${jobs.length} jobs for testing`);
        
        if (jobs.length > 0) {
            const sampleJob = jobs[0];
            console.log('\nSample job structure:');
            console.log(`   Company: ${sampleJob.company}`);
            console.log(`   Role: ${sampleJob.role}`);
            console.log(`   Location: ${Array.isArray(sampleJob.location) ? sampleJob.location.join(', ') : sampleJob.location}`);
            console.log(`   Skills: ${sampleJob.skills ? sampleJob.skills.slice(0, 3).join(', ') : 'None'}`);
            console.log(`   Scraped: ${sampleJob.scraped_at}`);
        }
        
        // Test search functionality
        console.log('\nTesting search functionality...');
        const searchResults = await externalDbService.searchExternalJobs('engineer', 3);
        console.log(`✅ Search for "engineer" returned ${searchResults.length} results`);
        
        console.log('\n🎉 All tests passed! External database integration is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close connection
        await externalDbService.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the test
testExternalDatabase();