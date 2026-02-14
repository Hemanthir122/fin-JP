const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = '-1003239074361';

// Validate token exists
if (!TELEGRAM_TOKEN) {
    console.error('⚠️ WARNING: TELEGRAM_TOKEN is not set in environment variables!');
    console.error('⚠️ Telegram notifications will not work until you set TELEGRAM_TOKEN');
}

const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

/**
 * Send a message to Telegram channel
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - Success status
 */
async function sendTelegramMessage(message) {
    if (!TELEGRAM_TOKEN) {
        console.error('❌ TELEGRAM_TOKEN is not set in environment variables');
        console.error('💡 Add TELEGRAM_TOKEN to your .env file or Vercel environment variables');
        return false;
    }

    try {
        console.log('📤 Sending message to Telegram...');
        console.log('🔑 Using bot token:', TELEGRAM_TOKEN ? `${TELEGRAM_TOKEN.substring(0, 10)}...` : 'NOT SET');
        console.log('📱 Chat ID:', TELEGRAM_CHAT_ID);
        
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: false
        });

        if (response.data.ok) {
            console.log('✅ Telegram message sent successfully');
            return true;
        } else {
            console.error('❌ Telegram API returned error:', response.data);
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to send Telegram message:', error.message);
        if (error.response) {
            console.error('📋 Response status:', error.response.status);
            console.error('📋 Response data:', error.response.data);
            
            if (error.response.status === 404) {
                console.error('💡 404 Error - This usually means:');
                console.error('   1. The bot token is incorrect');
                console.error('   2. The bot doesn\'t exist');
                console.error('   3. Check your TELEGRAM_TOKEN in .env file');
            } else if (error.response.status === 401) {
                console.error('💡 401 Error - Bot token is invalid or unauthorized');
            } else if (error.response.status === 400) {
                console.error('💡 400 Error - Bad request. Check chat_id or message format');
            }
        }
        return false;
    }
}

/**
 * Format and send new job notification to Telegram
 * @param {Object} job - Job object with details
 * @returns {Promise<boolean>} - Success status
 */
async function sendNewJobNotification(job) {
    const jobUrl = `https://www.jobconnects.online/job/${job._id}`;
    
    // Determine if it's an internship or full-time job
    const isInternship = job.type === 'internship';
    
    // Format package/stipend with appropriate label
    let packageInfo = job.package || 'Not disclosed';
    if (packageInfo !== 'Not disclosed') {
        // Add LPA or Stipend label if not already present
        if (isInternship) {
            // For internships, show as Stipend
            if (!packageInfo.toLowerCase().includes('stipend') && 
                !packageInfo.toLowerCase().includes('/month') &&
                !packageInfo.toLowerCase().includes('per month')) {
                packageInfo = `${packageInfo} /month`;
            }
        } else {
            // For full-time jobs, add LPA if not present
            if (!packageInfo.toLowerCase().includes('lpa') && 
                !packageInfo.toLowerCase().includes('lakh') &&
                !packageInfo.toLowerCase().includes('ctc')) {
                packageInfo = `${packageInfo} LPA`;
            }
        }
    }
    
    const message = `🔥 <b>New ${isInternship ? 'Internship' : 'Job'} Posted!</b>

🏢 <b>Company:</b> ${job.company}
💼 <b>Role:</b> ${job.title}
📍 <b>Location:</b> ${job.location}
🎓 <b>Experience:</b> ${job.experience || 'Not specified'}
💰 <b>${isInternship ? 'Stipend' : 'Package'}:</b> ${packageInfo}

🔗 <b>Apply Now:</b>
${jobUrl}

✨ Apply before it's too late!`;

    console.log('📋 Job notification prepared:', {
        company: job.company,
        title: job.title,
        type: job.type,
        isInternship: isInternship,
        id: job._id
    });

    return await sendTelegramMessage(message);
}

/**
 * Format and send new walkin notification to Telegram
 * @param {Object} walkin - Walkin object with details
 * @returns {Promise<boolean>} - Success status
 */
async function sendNewWalkinNotification(walkin) {
    const walkinUrl = `https://www.jobconnects.online/walkin/${walkin._id}`;
    
    // Clean and format the description
    let description = walkin.description || 'No description available';
    
    // Remove excessive line breaks and clean up
    description = description
        .replace(/\n{3,}/g, '\n\n')  // Replace 3+ line breaks with 2
        .replace(/\r\n/g, '\n')      // Normalize line breaks
        .trim();
    
    // Truncate if too long (Telegram has 4096 char limit, keep it under 1000 for readability)
    const maxLength = 1000;
    if (description.length > maxLength) {
        description = description.substring(0, maxLength) + '...';
    }
    
    const message = `🚶 <b>New Walk-in Drive Posted!</b>

🏢 <b>Company:</b> ${walkin.company}

📋 <b>Details:</b>
${description}

🔗 <b>View Full Details & Apply:</b>
${walkinUrl}

💼 Don't miss this opportunity!`;

    console.log('📋 Walkin notification prepared:', {
        company: walkin.company,
        id: walkin._id,
        descriptionLength: description.length
    });

    return await sendTelegramMessage(message);
}

module.exports = {
    sendTelegramMessage,
    sendNewJobNotification,
    sendNewWalkinNotification
};
