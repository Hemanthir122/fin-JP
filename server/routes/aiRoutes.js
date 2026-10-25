const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const externalDbService = require('../services/externalDbService');
const axios = require('axios');

// ── OpenRouter config ──────────────────────────────────────────────
const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'openai/gpt-4o-mini'; // fast, cheap, capable

/**
 * Call the OpenRouter chat completions API (OpenAI-compatible).
 * @param {Array}  messages     — [{role, content}, ...]
 * @param {object} opts         — optional overrides
 * @returns {Promise<string>}   — assistant reply text
 */
async function callOpenRouter(messages, { model = DEFAULT_MODEL, responseJson = false } = {}) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set in environment variables');

    const body = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 8192,
    };

    if (responseJson) {
        body.response_format = { type: 'json_object' };
    }

    const response = await axios.post(OPENROUTER_ENDPOINT, body, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.CLIENT_URL || 'https://fin-jp.vercel.app',
            'X-Title': 'JobsConnect Admin',
        },
        timeout: 120000,
    });

    const text = response.data?.choices?.[0]?.message?.content;
    if (!text) throw new Error('OpenRouter returned an empty response');
    return text;
}

/**
 * Fetch a job posting page and extract readable text.
 * Strips scripts, styles, nav, footer, and all HTML tags.
 */
async function fetchPageContent(pageUrl) {
    const response = await axios.get(pageUrl, {
        timeout: 30000,
        maxRedirects: 5,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
        },
        responseType: 'text',
    });

    const html = typeof response.data === 'string' ? response.data : String(response.data);

    let text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, ' ')
        .replace(/<!--[\s\S]*?-->/g, ' ')
        .replace(/<\/?(p|div|br|li|h[1-6]|tr|td|th)[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'").replace(/&ensp;|&emsp;/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    // ~12k tokens max
    if (text.length > 50000) text = text.substring(0, 50000);
    return text;
}

/**
 * Parse an AI JSON response, tolerating markdown code fences.
 */
function parseAIJson(raw) {
    try { return JSON.parse(raw); } catch (_) {}

    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
        try { return JSON.parse(fenced[1].trim()); } catch (_) {}
    }

    const block = raw.match(/\{[\s\S]*\}/);
    if (block) return JSON.parse(block[0]);

    throw new Error('Could not parse AI response as JSON');
}

// ── Helper: parse natural language query into DB filters ───────────
function parseJobQuery(message) {
    const msg = message.toLowerCase()
        .replace(/\bu\b/g, 'you')
        .replace(/\bplz\b|\bpls\b/g, 'please')
        .replace(/\bwanna\b/g, 'want to')
        .replace(/\bgimme\b/g, 'give me')
        .replace(/\bshw\b/g, 'show');

    const filters = {};

    if (/\bremote\b/.test(msg)) filters.remote = true;
    if (/\bhybrid\b/.test(msg)) filters.jobType = 'hybrid';
    if (/\bonsite\b|\bon.?site\b/.test(msg)) filters.jobType = 'onsite';
    if (/\binternship\b/.test(msg)) filters.type = 'internship';
    if (/\bwalk.?in\b/.test(msg)) filters.type = 'walkin';
    if (/\bexternal\b/.test(msg)) filters.source = 'external';
    if (/\binternal\b/.test(msg)) filters.source = 'internal';
    if (/\bpending\b/.test(msg)) filters.externalStatus = 'pending';
    if (/\bdraft\b/.test(msg)) filters.status = 'draft';
    if (/\bscheduled\b/.test(msg)) filters.status = 'scheduled';
    if (/\bpublished\b/.test(msg)) filters.status = 'published';
    if (/\ball\b/.test(msg) && !filters.status && !filters.externalStatus) filters.showAll = true;

    const cityPatterns = [
        'bangalore', 'bengaluru', 'mumbai', 'delhi', 'hyderabad', 'chennai',
        'pune', 'kolkata', 'noida', 'gurgaon', 'gurugram', 'ahmedabad',
        'jaipur', 'kochi', 'coimbatore', 'indore', 'bhopal', 'nagpur',
        'vizag', 'visakhapatnam', 'surat', 'vadodara', 'lucknow', 'chandigarh',
        'riyadh', 'dubai', 'singapore', 'london', 'new york', 'berlin',
        'cairo', 'amman', 'kuwait', 'amsterdam', 'toronto', 'sydney',
    ];
    for (const city of cityPatterns) {
        if (msg.includes(city)) { filters.location = city; break; }
    }
    if (!filters.location) {
        const locMatch = msg.match(/(?:from|in|at|location[:\s]+)\s+([a-z][a-z\s]{1,20}?)(?:\s+(?:jobs?|roles?|listings?|positions?)|[,.]|$)/);
        if (locMatch) filters.location = locMatch[1].trim();
    }

    const expMatch = msg.match(/(\d+)\s*(?:\+\s*)?(?:years?|yrs?)/);
    if (expMatch) filters.experience = expMatch[1];

    const techKeywords = [
        'react', 'node', 'python', 'java', 'javascript', 'typescript', 'angular',
        'vue', 'django', 'flask', 'spring', 'aws', 'azure', 'gcp', 'devops',
        'docker', 'kubernetes', 'sql', 'mongodb', 'data science', 'machine learning',
        'ml', 'flutter', 'android', 'ios', 'php', 'ruby', 'golang', 'rust',
        'c++', 'c#', '.net', 'salesforce', 'sap', 'tableau', 'power bi',
        'data analyst', 'data engineer', 'backend', 'frontend', 'fullstack', 'full stack',
    ];
    for (const kw of techKeywords) {
        if (msg.includes(kw)) { filters.skill = kw; break; }
    }

    const roleMatch = msg.match(/(?:for|role[:\s]+|title[:\s]+|position[:\s]+)\s+([a-z][a-z\s]{1,30}?)(?:\s+(?:jobs?|roles?|in|from|at)|[,.]|$)/);
    if (roleMatch) filters.role = roleMatch[1].trim();

    const limitMatch = msg.match(/(?:top|first|show|list)\s+(\d+)/);
    filters.limit = limitMatch ? Math.min(parseInt(limitMatch[1]), 100) : 50;

    return filters;
}

// ── GET /api/ai/status — check if AI is available ──────────────────
router.get('/status', (req, res) => {
    const hasKey = !!process.env.OPENROUTER_API_KEY;
    res.json({ online: hasKey, provider: 'OpenRouter', model: DEFAULT_MODEL });
});

// ── POST /api/ai/search-jobs ───────────────────────────────────────
router.post('/search-jobs', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const filters = parseJobQuery(message);
        const results = { internal: [], external: [], filters };

        // Internal jobs
        if (filters.source !== 'external') {
            const q = {};
            if (filters.status) {
                q.status = filters.status;
            } else {
                q.status = { $in: ['draft', 'published', 'scheduled'] };
            }
            if (filters.type) q.type = filters.type;
            if (filters.remote) {
                q.jobType = { $regex: 'remote', $options: 'i' };
            } else if (filters.jobType) {
                q.jobType = { $regex: filters.jobType, $options: 'i' };
            }
            if (filters.location) q.location = { $regex: filters.location, $options: 'i' };
            if (filters.skill) q.skills = { $regex: filters.skill, $options: 'i' };
            if (filters.role) {
                q.$or = [
                    { title: { $regex: filters.role, $options: 'i' } },
                    { company: { $regex: filters.role, $options: 'i' } },
                ];
            }
            results.internal = await Job.find(q)
                .select('_id title company location type jobType experience package status publishedAt scheduledPublishAt skills')
                .sort({ createdAt: -1 })
                .limit(filters.limit)
                .lean();
        }

        // External jobs
        if (filters.source !== 'internal') {
            try {
                const collection = await externalDbService.getJobsCollection();
                const andClauses = [];

                if (filters.externalStatus === 'pending' || (!filters.status && !filters.showAll)) {
                    andClauses.push({ $and: [{ status: { $ne: 'approved' } }, { status: { $ne: 'rejected' } }] });
                } else if (filters.status === 'approved') {
                    andClauses.push({ status: 'approved' });
                } else if (filters.status === 'rejected') {
                    andClauses.push({ status: 'rejected' });
                }

                if (filters.remote) {
                    andClauses.push({ $or: [{ location: { $regex: 'remote', $options: 'i' } }, { job_type: { $regex: 'remote', $options: 'i' } }] });
                } else if (filters.jobType) {
                    andClauses.push({ job_type: { $regex: filters.jobType, $options: 'i' } });
                }
                if (filters.location && !filters.remote) {
                    andClauses.push({ $or: [{ location: { $regex: filters.location, $options: 'i' } }, { country: { $regex: filters.location, $options: 'i' } }] });
                }
                if (filters.skill) andClauses.push({ skills: { $regex: filters.skill, $options: 'i' } });
                if (filters.role) andClauses.push({ role: { $regex: filters.role, $options: 'i' } });
                if (filters.experience) andClauses.push({ experience: { $regex: filters.experience, $options: 'i' } });

                const externalQuery = andClauses.length > 0 ? { $and: andClauses } : {};
                results.external = await collection.find(externalQuery).sort({ scraped_at: -1 }).limit(filters.limit).toArray();
            } catch (extErr) {
                console.error('[AI search-jobs] External DB error:', extErr.message);
                results.externalError = 'Could not reach external jobs database';
            }
        }

        res.json(results);
    } catch (e) {
        console.error('[AI search-jobs]', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ── POST /api/ai/bulk-action ───────────────────────────────────────
router.post('/bulk-action', async (req, res) => {
    try {
        const { jobIds = [], externalJobIds = [], action, scheduledAt } = req.body;
        const results = { success: [], failed: [] };

        for (const id of jobIds) {
            try {
                const update = {};
                if (action === 'publish') {
                    update.status = 'published'; update.publishedAt = new Date(); update.isActive = true;
                } else if (action === 'schedule') {
                    if (!scheduledAt) throw new Error('scheduledAt required');
                    update.status = 'scheduled'; update.scheduledPublishAt = new Date(scheduledAt); update.isActive = false;
                } else {
                    update.status = 'draft'; update.isActive = false;
                }
                const updated = await Job.findByIdAndUpdate(id, { $set: update }, { new: true });
                if (!updated) throw new Error('Job not found');
                results.success.push(id);
            } catch (e) {
                results.failed.push({ id, error: e.message });
            }
        }

        if (externalJobIds.length > 0) {
            const collection = await externalDbService.getJobsCollection();
            const { ObjectId } = require('mongodb');

            for (const id of externalJobIds) {
                try {
                    let extJob;
                    try { extJob = await collection.findOne({ _id: new ObjectId(id) }); } catch (_) { extJob = null; }
                    if (!extJob) throw new Error('External job not found');

                    if (extJob.internalJobId) {
                        try {
                            const existing = await Job.findById(extJob.internalJobId);
                            if (existing) {
                                const update = {};
                                if (action === 'publish') {
                                    update.status = 'published'; update.publishedAt = new Date(); update.isActive = true;
                                } else if (action === 'schedule') {
                                    if (!scheduledAt) throw new Error('scheduledAt required');
                                    update.status = 'scheduled'; update.scheduledPublishAt = new Date(scheduledAt); update.isActive = false;
                                } else {
                                    update.status = 'draft'; update.isActive = false;
                                }
                                await Job.findByIdAndUpdate(extJob.internalJobId, { $set: update });
                                await collection.updateOne({ _id: new ObjectId(id) }, { $set: { status: action === 'publish' ? 'approved' : action } });
                                results.success.push(id);
                                continue;
                            }
                        } catch (_) { /* fall through to create */ }
                    }

                    const companyLogo = await externalDbService.getCompanyLogo(extJob.company) || '';
                    const jobData = {
                        title: extJob.role,
                        company: extJob.company,
                        companyLogo,
                        location: Array.isArray(extJob.location) ? extJob.location.join(', ') : (extJob.location || ''),
                        country: Array.isArray(extJob.country) ? extJob.country.join(', ') : (extJob.country || ''),
                        package: extJob.salary || 'Not disclosed',
                        experience: extJob.experience || 'Not specified',
                        description: extJob.description || `${extJob.role} at ${extJob.company}`,
                        skills: extJob.skills || [],
                        applyLink: extJob.apply_link || '',
                        jobType: extJob.job_type || '',
                        type: 'job',
                        isExternalJob: true,
                        externalJobApprovedAt: new Date(),
                    };

                    if (action === 'publish') {
                        jobData.status = 'published'; jobData.publishedAt = new Date(); jobData.isActive = true;
                    } else if (action === 'schedule') {
                        if (!scheduledAt) throw new Error('scheduledAt required');
                        jobData.status = 'scheduled'; jobData.scheduledPublishAt = new Date(scheduledAt); jobData.isActive = false;
                    } else {
                        jobData.status = 'draft'; jobData.isActive = false;
                    }

                    const saved = await new Job(jobData).save();
                    await collection.updateOne({ _id: new ObjectId(id) }, {
                        $set: { status: action === 'publish' ? 'approved' : action, internalJobId: saved._id.toString(), approvedAt: new Date() }
                    });
                    results.success.push(id);
                } catch (e) {
                    results.failed.push({ id, error: e.message });
                }
            }
        }

        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ── POST /api/ai/chat ──────────────────────────────────────────────
router.post('/chat', async (req, res) => {
    try {
        const { message, history = [], includeJobs = true } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        let systemContent = `You are an AI assistant for JobConnects admin panel. You help manage and analyze job listings.
You have access to the job database and can answer questions about jobs, companies, trends, and provide recommendations.
Be concise, helpful, and data-driven in your responses.`;

        if (includeJobs) {
            const jobs = await Job.find({ isActive: true, status: 'published' })
                .select('title company location type experience package skills publishedAt')
                .sort({ publishedAt: -1 })
                .limit(50)
                .lean();

            const jobsSummary = jobs.map(j =>
                `- ${j.title} at ${j.company} | ${j.location || 'N/A'} | ${j.type || 'job'} | ${j.experience || 'N/A'} | ${j.package || 'N/A'}`
            ).join('\n');

            const stats = {
                total: jobs.length,
                byType: jobs.reduce((acc, j) => { acc[j.type || 'job'] = (acc[j.type || 'job'] || 0) + 1; return acc; }, {}),
                companies: [...new Set(jobs.map(j => j.company))].length,
                locations: [...new Set(jobs.map(j => j.location).filter(Boolean))].slice(0, 10),
            };

            systemContent += `\n\nCURRENT JOB DATABASE SUMMARY:
Total active jobs: ${stats.total}
By type: ${JSON.stringify(stats.byType)}
Unique companies: ${stats.companies}
Top locations: ${stats.locations.join(', ')}

RECENT JOB LISTINGS (last 50):
${jobsSummary}`;
        }

        const messages = [
            { role: 'system', content: systemContent },
            ...history.slice(-10).map(m => ({ role: m.role, content: m.content || '' })),
            { role: 'user', content: message },
        ];

        const reply = await callOpenRouter(messages);
        res.json({ reply, provider: 'openrouter' });
    } catch (e) {
        console.error('[AI chat]', e.message);
        res.status(500).json({ error: e.response?.data?.error?.message || e.message || 'AI request failed' });
    }
});

// ── POST /api/ai/analyze ───────────────────────────────────────────
router.post('/analyze', async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true, status: 'published' })
            .select('title company location type experience package skills publishedAt')
            .lean();

        const byType = jobs.reduce((acc, j) => { acc[j.type || 'job'] = (acc[j.type || 'job'] || 0) + 1; return acc; }, {});
        const byCompany = jobs.reduce((acc, j) => { acc[j.company] = (acc[j.company] || 0) + 1; return acc; }, {});
        const topCompanies = Object.entries(byCompany).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const allSkills = jobs.flatMap(j => j.skills || []);
        const skillCount = allSkills.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
        const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 15);

        const prompt = `Analyze this job portal data and provide actionable insights for the admin:

Total jobs: ${jobs.length}
Job types: ${JSON.stringify(byType)}
Top 10 companies: ${topCompanies.map(([c, n]) => `${c}(${n})`).join(', ')}
Top 15 skills: ${topSkills.map(([s, n]) => `${s}(${n})`).join(', ')}

Provide:
1. Key trends you notice
2. Which job categories are growing
3. Most in-demand skills
4. Recommendations to improve the job portal
5. Gaps or opportunities

Keep it concise and actionable.`;

        const reply = await callOpenRouter([
            { role: 'system', content: 'You are a data analyst for a job portal. Provide clear, actionable insights.' },
            { role: 'user', content: prompt },
        ]);

        res.json({ reply, stats: { total: jobs.length, byType, topCompanies, topSkills } });
    } catch (e) {
        console.error('[AI analyze]', e.message);
        res.status(500).json({ error: e.response?.data?.error?.message || e.message });
    }
});

// ── POST /api/ai/analyze-job-url ──────────────────────────────────
router.post('/analyze-job-url', async (req, res) => {
    try {
        const { url: pageUrl } = req.body;
        if (!pageUrl || typeof pageUrl !== 'string') {
            return res.status(400).json({ error: 'A valid "url" is required' });
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(pageUrl);
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('bad protocol');
        } catch (_) {
            return res.status(400).json({ error: 'Invalid URL — please provide a full http(s) URL.' });
        }

        let pageContent;
        try {
            pageContent = await fetchPageContent(pageUrl);
        } catch (fetchErr) {
            const msg = fetchErr.code === 'ECONNABORTED'
                ? 'Timed out fetching the page (the site may be slow or blocking bots)'
                : `Failed to fetch page: ${fetchErr.message}`;
            return res.status(502).json({ error: msg });
        }

        if (!pageContent || pageContent.length < 100) {
            return res.status(400).json({ error: 'Not enough readable content found. The site may require JavaScript to render.' });
        }

        const systemContent = [
            'You are an expert job-posting writer and HR content specialist.',
            'Analyze a job posting page and produce a comprehensive, detailed job listing.',
            'Write rich, detailed descriptions — never one-liners.',
            'If specific details are missing, generate plausible professional content based on the role and company.',
            'Always respond with a single valid JSON object — no markdown, no code fences, no commentary.',
        ].join(' ');

        const userContent = `Analyze the following job posting and return a JSON object.

SOURCE URL: ${pageUrl}

PAGE CONTENT:
${pageContent}

Return ONLY a JSON object with these exact fields:
{
  "title": "Job title",
  "company": "Company name",
  "companyLogo": "Direct logo image URL if found, otherwise empty string",
  "aboutCompany": "3-5 detailed paragraphs: mission, vision, products/services, market position, work culture, benefits, growth opportunities",
  "location": "Primary job location (City, Country)",
  "package": "Salary/package if mentioned, otherwise 'Not disclosed'",
  "experience": "EXACTLY one of: 'Fresher', '0-1 years', '0-2 years', '1 year', 'More than 2 years', 'Above 3 years'",
  "batch": "Graduating year batch if mentioned, otherwise empty string",
  "type": "'job' for full-time, 'internship' for internships, 'walkin' for walk-in/email",
  "description": "4-6 comprehensive paragraphs: role overview, day-to-day activities, team structure, tools/tech, challenges, career growth",
  "skills": ["8-20 relevant technical and soft skills"],
  "responsibilities": ["8-12 detailed responsibility bullet points, each a complete sentence"],
  "qualifications": ["6-10 detailed qualification bullet points, each a complete sentence"],
  "applyLink": "Application URL if found, otherwise the source URL"
}`;

        const raw = await callOpenRouter([
            { role: 'system', content: systemContent },
            { role: 'user', content: userContent },
        ], { responseJson: true });

        const jobData = parseAIJson(raw);

        // Normalize experience
        const expOptions = ['Fresher', '0-1 years', '0-2 years', '1 year', 'More than 2 years', 'Above 3 years'];
        if (jobData.experience && !expOptions.includes(jobData.experience)) {
            const lower = (jobData.experience || '').toLowerCase();
            if (lower.includes('fresher') || lower.includes('fresh')) jobData.experience = 'Fresher';
            else if (lower.match(/0[-\s]*1/)) jobData.experience = '0-1 years';
            else if (lower.match(/0[-\s]*2/)) jobData.experience = '0-2 years';
            else if (lower.match(/1\s*year/)) jobData.experience = '1 year';
            else if (lower.match(/[3-9]/) || lower.includes('senior')) jobData.experience = 'Above 3 years';
            else if (lower.includes('more than 2')) jobData.experience = 'More than 2 years';
            else jobData.experience = 'Fresher';
        }

        // Normalize type
        if (!['job', 'internship', 'walkin'].includes(jobData.type)) {
            const t = (jobData.type || '').toLowerCase();
            if (t.includes('intern')) jobData.type = 'internship';
            else if (t.includes('walk') || t.includes('email')) jobData.type = 'walkin';
            else jobData.type = 'job';
        }

        // Ensure arrays
        jobData.skills = Array.isArray(jobData.skills) ? jobData.skills.filter(s => String(s).trim()) : [];
        jobData.responsibilities = Array.isArray(jobData.responsibilities) ? jobData.responsibilities.filter(r => String(r).trim()) : [];
        jobData.qualifications = Array.isArray(jobData.qualifications) ? jobData.qualifications.filter(q => String(q).trim()) : [];

        if (!jobData.applyLink) jobData.applyLink = pageUrl;

        res.json(jobData);
    } catch (e) {
        console.error('[AI analyze-job-url]', e.message);
        const status = e.response?.status || 500;
        const detail = e.response?.data?.error?.message || e.message;
        res.status(status).json({ error: detail });
    }
});

module.exports = router;
