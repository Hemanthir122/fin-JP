const axios = require('axios');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = '-1003239074361';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

/**
 * Send a message to Telegram channel
 * @param {string} message - The message to send
 * @returns {Promise<boolean>} - Success status
 */
async function sendTelegramMessage(message) {
    if (!TELEGRAM_TOKEN) {
        console.error('❌ TELEGRAM_TOKEN is not set in environment variables');
        return false;
    }

    try {
        console.log('📤 Sending message to Telegram...');
        
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
            console.error('Response data:', error.response.data);
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
    
    const message = `🔥 <b>New Job Posted!</b>

<b>Company:</b> ${job.company}
<b>Role:</b> ${job.title}
<b>Location:</b> ${job.location}
<b>Experience:</b> ${job.experience || 'Not specified'}
<b>Package:</b> ${job.package || 'Not disclosed'}

<b>Apply Now:</b> ${jobUrl}`;

    console.log('📋 Job notification prepared:', {
        company: job.company,
        title: job.title,
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
    
    const message = `🚶 <b>New Walk-in Drive Posted!</b>

<b>Company:</b> ${walkin.company}
<b>Role:</b> ${walkin.title}
<b>Location:</b> ${walkin.location}
<b>Experience:</b> ${walkin.experience || 'Not specified'}
<b>Package:</b> ${walkin.package || 'Not disclosed'}

<b>Apply Now:</b> ${walkinUrl}`;

    console.log('📋 Walkin notification prepared:', {
        company: walkin.company,
        title: walkin.title,
        id: walkin._id
    });

    return await sendTelegramMessage(message);
}

module.exports = {
    sendTelegramMessage,
    sendNewJobNotification,
    sendNewWalkinNotification
};
