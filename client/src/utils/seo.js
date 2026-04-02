// SEO Utility Functions for JobConnects

/**
 * Generate JobPosting structured data for Google Jobs
 * @param {Object} job - Job object
 * @returns {Object} - Structured data object
 */
export const generateJobPostingSchema = (job) => {
    const schema = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.description || `${job.title} position at ${job.company}`,
        "datePosted": job.publishedAt || job.createdAt,
        "validThrough": job.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        "employmentType": getEmploymentType(job.type),
        "hiringOrganization": {
            "@type": "Organization",
            "name": job.company,
            "sameAs": job.companyWebsite || `https://jobconnects.online/company/${encodeURIComponent(job.company)}`,
            "logo": job.companyLogo || "https://jobconnects.online/logo.png"
        },
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": job.location,
                "addressCountry": getCountryCode(job.location)
            }
        }
    };

    // Add salary if available
    if (job.package) {
        schema.baseSalary = {
            "@type": "MonetaryAmount",
            "currency": getCurrency(job.location),
            "value": {
                "@type": "QuantitativeValue",
                "value": parseSalary(job.package),
                "unitText": job.type === 'internship' ? "MONTH" : "YEAR"
            }
        };
    }

    // Add remote work info
    if (job.workMode === 'remote' || job.location?.toLowerCase().includes('remote')) {
        schema.jobLocationType = "TELECOMMUTE";
        schema.applicantLocationRequirements = {
            "@type": "Country",
            "name": getCountryFromLocation(job.location)
        };
    }

    return schema;
};

/**
 * Get employment type for schema
 */
const getEmploymentType = (type) => {
    const typeMap = {
        'internship': 'INTERN',
        'walkin': 'FULL_TIME',
        'full-time': 'FULL_TIME',
        'part-time': 'PART_TIME',
        'contract': 'CONTRACTOR'
    };
    return typeMap[type] || 'FULL_TIME';
};

/**
 * Get country code from location
 */
const getCountryCode = (location) => {
    const countryMap = {
        'usa': 'US', 'united states': 'US', 'america': 'US',
        'uk': 'GB', 'united kingdom': 'GB', 'england': 'GB',
        'canada': 'CA',
        'australia': 'AU',
        'germany': 'DE', 'deutschland': 'DE',
        'france': 'FR',
        'netherlands': 'NL', 'holland': 'NL',
        'sweden': 'SE',
        'switzerland': 'CH',
        'uae': 'AE', 'dubai': 'AE', 'abu dhabi': 'AE',
        'saudi arabia': 'SA', 'riyadh': 'SA',
        'qatar': 'QA', 'doha': 'QA',
        'singapore': 'SG',
        'japan': 'JP', 'tokyo': 'JP',
        'china': 'CN', 'beijing': 'CN', 'shanghai': 'CN',
        'india': 'IN', 'bangalore': 'IN', 'mumbai': 'IN', 'delhi': 'IN',
        'south africa': 'ZA',
        'brazil': 'BR'
    };

    const locationLower = location?.toLowerCase() || '';
    for (const [key, code] of Object.entries(countryMap)) {
        if (locationLower.includes(key)) {
            return code;
        }
    }
    return 'US'; // Default
};

/**
 * Get currency based on location
 */
const getCurrency = (location) => {
    const currencyMap = {
        'usa': 'USD', 'united states': 'USD', 'america': 'USD',
        'uk': 'GBP', 'united kingdom': 'GBP', 'england': 'GBP',
        'canada': 'CAD',
        'australia': 'AUD',
        'germany': 'EUR', 'france': 'EUR', 'netherlands': 'EUR', 'spain': 'EUR',
        'switzerland': 'CHF',
        'uae': 'AED', 'dubai': 'AED',
        'saudi arabia': 'SAR',
        'qatar': 'QAR',
        'singapore': 'SGD',
        'japan': 'JPY',
        'china': 'CNY',
        'india': 'INR',
        'south africa': 'ZAR',
        'brazil': 'BRL'
    };

    const locationLower = location?.toLowerCase() || '';
    for (const [key, currency] of Object.entries(currencyMap)) {
        if (locationLower.includes(key)) {
            return currency;
        }
    }
    return 'USD'; // Default
};

/**
 * Parse salary string to number
 */
const parseSalary = (salaryStr) => {
    if (!salaryStr) return null;
    const numbers = salaryStr.match(/\d+/g);
    if (!numbers) return null;
    return parseInt(numbers[0]) * (salaryStr.includes('k') || salaryStr.includes('K') ? 1000 : 1);
};

/**
 * Get country name from location
 */
const getCountryFromLocation = (location) => {
    const countryNames = {
        'usa': 'USA', 'united states': 'USA',
        'uk': 'United Kingdom', 'united kingdom': 'United Kingdom',
        'canada': 'Canada',
        'australia': 'Australia',
        'germany': 'Germany',
        'france': 'France',
        'netherlands': 'Netherlands',
        'sweden': 'Sweden',
        'switzerland': 'Switzerland',
        'uae': 'United Arab Emirates', 'dubai': 'United Arab Emirates',
        'saudi arabia': 'Saudi Arabia',
        'qatar': 'Qatar',
        'singapore': 'Singapore',
        'japan': 'Japan',
        'china': 'China',
        'india': 'India',
        'south africa': 'South Africa',
        'brazil': 'Brazil'
    };

    const locationLower = location?.toLowerCase() || '';
    for (const [key, name] of Object.entries(countryNames)) {
        if (locationLower.includes(key)) {
            return name;
        }
    }
    return 'Worldwide';
};

/**
 * Generate hreflang tags for multi-country targeting
 */
export const generateHreflangTags = (currentPath) => {
    const baseUrl = 'https://jobconnects.online';
    
    const hreflangs = [
        { lang: 'en', href: `${baseUrl}${currentPath}` },
        { lang: 'en-us', href: `${baseUrl}/jobs/usa` },
        { lang: 'en-gb', href: `${baseUrl}/jobs/uk` },
        { lang: 'en-ca', href: `${baseUrl}/jobs/canada` },
        { lang: 'en-au', href: `${baseUrl}/jobs/australia` },
        { lang: 'de-de', href: `${baseUrl}/de/jobs/germany` },
        { lang: 'fr-fr', href: `${baseUrl}/fr/jobs/france` },
        { lang: 'ar-ae', href: `${baseUrl}/ar/jobs/uae` },
        { lang: 'x-default', href: `${baseUrl}${currentPath}` }
    ];

    return hreflangs;
};

/**
 * Generate meta tags for country-specific pages
 */
export const generateCountryMetaTags = (country) => {
    const metaData = {
        'usa': {
            title: 'Software Engineer Jobs in USA | Remote & Onsite - JobConnects',
            description: 'Find 10,000+ software engineer, developer & IT jobs in USA. Remote, hybrid & onsite positions in California, New York, Texas. Apply now!',
            keywords: 'software engineer jobs usa, remote jobs usa, it jobs america, tech jobs usa'
        },
        'uk': {
            title: 'Software Engineer Jobs in UK | London, Manchester - JobConnects',
            description: 'Discover tech jobs in United Kingdom. Software engineer, developer & IT positions in London, Manchester, Birmingham. Visa sponsorship available.',
            keywords: 'software engineer jobs uk, it jobs london, tech jobs uk, visa sponsorship jobs uk'
        },
        'canada': {
            title: 'Software Engineer Jobs in Canada | Toronto, Vancouver - JobConnects',
            description: 'Browse IT jobs in Canada. Software developer positions in Toronto, Vancouver, Montreal. Work permit sponsorship available.',
            keywords: 'software engineer jobs canada, it jobs toronto, tech jobs vancouver'
        },
        'australia': {
            title: 'Software Engineer Jobs in Australia | Sydney, Melbourne - JobConnects',
            description: 'Find tech jobs in Australia. Software engineer & IT positions in Sydney, Melbourne, Brisbane. Visa sponsorship available.',
            keywords: 'software engineer jobs australia, it jobs sydney, tech jobs melbourne'
        },
        'germany': {
            title: 'Software Engineer Jobs in Germany | Berlin, Munich - JobConnects',
            description: 'English-speaking tech jobs in Germany. Software developer positions in Berlin, Munich, Frankfurt. Blue Card sponsorship.',
            keywords: 'software engineer jobs germany, it jobs berlin, english speaking jobs germany'
        },
        'uae': {
            title: 'High Salary IT Jobs in UAE | Dubai, Abu Dhabi - JobConnects',
            description: 'Find high-paying tech jobs in UAE. Software engineer positions in Dubai, Abu Dhabi. Visa sponsorship available.',
            keywords: 'it jobs uae, software engineer jobs dubai, high salary jobs uae'
        },
        'singapore': {
            title: 'Software Engineer Jobs in Singapore | Tech Jobs SG - JobConnects',
            description: 'Browse IT jobs in Singapore. Software developer & tech positions. Competitive salaries and benefits.',
            keywords: 'software engineer jobs singapore, it jobs singapore, tech jobs sg'
        },
        'india': {
            title: 'Software Engineer Jobs in India | Bangalore, Mumbai - JobConnects',
            description: 'Find 50,000+ IT jobs in India. Software engineer positions in Bangalore, Mumbai, Pune, Hyderabad. Fresher & experienced.',
            keywords: 'software engineer jobs india, it jobs bangalore, fresher jobs india'
        }
    };

    return metaData[country.toLowerCase()] || metaData['usa'];
};

/**
 * Generate breadcrumb schema
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": `https://jobconnects.online${crumb.path}`
        }))
    };
};

/**
 * Generate Organization schema
 */
export const generateOrganizationSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "JobConnects",
        "url": "https://jobconnects.online",
        "logo": "https://jobconnects.online/logo.png",
        "description": "Find jobs worldwide - Remote, hybrid & onsite opportunities across USA, UK, Canada, UAE, Germany and more.",
        "sameAs": [
            "https://www.linkedin.com/company/jobconnects",
            "https://twitter.com/jobconnects",
            "https://www.facebook.com/jobconnects"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "email": "support@jobconnects.online"
        }
    };
};
