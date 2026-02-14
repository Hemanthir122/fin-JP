# Telegram Automation Setup Guide

## ✅ Implementation Complete

Telegram notifications have been successfully integrated into your job posting system.

## 📁 File Structure

```
fin-JP/server/
├── services/
│   └── telegram.js          # ✅ NEW - Telegram service (reusable)
├── routes/
│   ├── jobRoutes.js         # ✅ UPDATED - Added notifications
│   └── walkinRoutes.js      # ✅ UPDATED - Added notifications
└── package.json             # ✅ UPDATED - Added axios dependency
```

## 🔧 Setup Steps

### 1. Install Dependencies

Run this command in the `server` directory:

```bash
cd fin-JP/server
npm install
```

This will install `axios` which is required for Telegram API calls.

### 2. Environment Variables

Make sure you have `TELEGRAM_TOKEN` set in your Vercel environment variables:

**Vercel Dashboard:**
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add: `TELEGRAM_TOKEN` = `your_bot_token_here`
4. Save and redeploy

**Local Development (.env file):**
```env
TELEGRAM_TOKEN=your_bot_token_here
```

### 3. Telegram Channel Setup

- Channel ID: `-1003239074361` (already configured)
- Make sure your bot is added as an administrator to this channel

## 🚀 How It Works

### When Jobs Are Created/Published

**Scenario 1: Direct Publish**
- Admin creates a new job with status = "published"
- Job is saved to database
- Telegram notification is sent automatically ✅

**Scenario 2: Publish Draft**
- Admin creates a draft job (status = "draft")
- Later, admin updates the job to status = "published"
- Telegram notification is sent when status changes ✅

### Message Format

```
🔥 New Job Posted!

Company: TCS
Role: Software Engineer
Location: Bangalore, India
Experience: 2-5 years
Package: 8-12 LPA

Apply Now: https://www.jobconnects.online/job/123abc
```

### For Walk-ins

```
🚶 New Walk-in Drive Posted!

Company: Infosys
Role: Java Developer
Location: Mumbai, India
Experience: 0-3 years
Package: 6-10 LPA

Apply Now: https://www.jobconnects.online/walkin/456def
```

## 📝 Code Overview

### services/telegram.js

Three main functions:

1. **sendTelegramMessage(message)** - Low-level function to send any message
2. **sendNewJobNotification(job)** - Formats and sends job notifications
3. **sendNewWalkinNotification(walkin)** - Formats and sends walkin notifications

### Integration Points

**jobRoutes.js:**
- `POST /` - Sends notification when creating published job
- `PUT /:id` - Sends notification when publishing a draft

**walkinRoutes.js:**
- `POST /` - Sends notification when creating published walkin
- `PUT /:id` - Sends notification when publishing a draft

## 🔍 Debugging

Check your server logs for these messages:

```
✅ Success:
📤 Sending message to Telegram...
✅ Telegram message sent successfully

❌ Errors:
❌ TELEGRAM_TOKEN is not set in environment variables
❌ Failed to send Telegram message: [error details]
⚠️ Telegram notification failed (non-blocking): [error]
```

## ⚠️ Important Notes

1. **Non-Blocking**: Telegram notifications run asynchronously and won't block job creation if they fail
2. **Error Handling**: All errors are logged but don't affect the main job posting flow
3. **Production Ready**: Works in Vercel serverless environment
4. **No Cron Jobs**: Notifications are triggered immediately when jobs are published
5. **HTML Formatting**: Messages use HTML parse mode for better formatting

## 🧪 Testing

### Test Locally

1. Set `TELEGRAM_TOKEN` in your `.env` file
2. Start the server: `npm run dev`
3. Create a test job via your admin panel
4. Check your Telegram channel for the notification
5. Check server console for logs

### Test on Vercel

1. Deploy your changes
2. Ensure `TELEGRAM_TOKEN` is set in Vercel environment variables
3. Create a job via your production admin panel
4. Check Telegram channel
5. Check Vercel function logs

## 🔗 Useful Links

- Telegram Bot API: https://core.telegram.org/bots/api
- Your Channel ID: `-1003239074361`
- Job Portal: https://www.jobconnects.online

## 📞 Support

If notifications aren't working:

1. Check Vercel logs for errors
2. Verify `TELEGRAM_TOKEN` is set correctly
3. Ensure bot is admin in the channel
4. Check channel ID is correct
5. Test with a simple message first

---

**Status**: ✅ Ready for Production
**Last Updated**: 2024
