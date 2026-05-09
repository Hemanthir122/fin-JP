/**
 * City data structured by country.
 * aliases: alternate spellings/names that map to the canonical city name.
 * The backend searches the location field using regex, so aliases are used
 * to build the search term.
 */

export const CITY_DATA = {
    India: {
        iso2: 'in',
        cities: [
            { name: 'Bangalore',       aliases: ['Bengaluru', 'Bangalore', 'Bengaluru'] },
            { name: 'Mumbai',          aliases: ['Mumbai', 'Bombay'] },
            { name: 'Delhi',           aliases: ['Delhi', 'New Delhi', 'NCR'] },
            { name: 'Noida',           aliases: ['Noida'] },
            { name: 'Gurgaon',         aliases: ['Gurgaon', 'Gurugram'] },
            { name: 'Hyderabad',       aliases: ['Hyderabad', 'Secunderabad'] },
            { name: 'Chennai',         aliases: ['Chennai', 'Madras'] },
            { name: 'Pune',            aliases: ['Pune', 'Poona'] },
            { name: 'Kolkata',         aliases: ['Kolkata', 'Calcutta'] },
            { name: 'Ahmedabad',       aliases: ['Ahmedabad'] },
            { name: 'Surat',           aliases: ['Surat'] },
            { name: 'Jaipur',          aliases: ['Jaipur'] },
            { name: 'Chandigarh',      aliases: ['Chandigarh'] },
            { name: 'Kochi',           aliases: ['Kochi', 'Cochin'] },
            { name: 'Indore',          aliases: ['Indore'] },
            { name: 'Nagpur',          aliases: ['Nagpur'] },
            { name: 'Coimbatore',      aliases: ['Coimbatore'] },
            { name: 'Bhubaneswar',     aliases: ['Bhubaneswar', 'Bhubaneshwar'] },
            { name: 'Lucknow',         aliases: ['Lucknow'] },
            { name: 'Vadodara',        aliases: ['Vadodara', 'Baroda'] },
            { name: 'Nashik',          aliases: ['Nashik', 'Nasik'] },
            { name: 'Vizag',           aliases: ['Vizag', 'Visakhapatnam', 'Vishakhapatnam'] },
            { name: 'Trivandrum',      aliases: ['Trivandrum', 'Thiruvananthapuram'] },
        ],
    },
    Singapore: {
        iso2: 'sg',
        cities: [
            { name: 'Singapore', aliases: ['Singapore'] },
        ],
    },
    Japan: {
        iso2: 'jp',
        cities: [
            { name: 'Tokyo',    aliases: ['Tokyo'] },
            { name: 'Osaka',    aliases: ['Osaka'] },
            { name: 'Kyoto',    aliases: ['Kyoto'] },
            { name: 'Yokohama', aliases: ['Yokohama'] },
            { name: 'Fukuoka',  aliases: ['Fukuoka'] },
            { name: 'Nagoya',   aliases: ['Nagoya'] },
            { name: 'Sapporo',  aliases: ['Sapporo'] },
        ],
    },
    'South Korea': {
        iso2: 'kr',
        cities: [
            { name: 'Seoul',    aliases: ['Seoul'] },
            { name: 'Busan',    aliases: ['Busan', 'Pusan'] },
            { name: 'Incheon',  aliases: ['Incheon', 'Inchon'] },
            { name: 'Daegu',    aliases: ['Daegu'] },
            { name: 'Daejeon',  aliases: ['Daejeon'] },
        ],
    },
    UAE: {
        iso2: 'ae',
        cities: [
            { name: 'Dubai',     aliases: ['Dubai'] },
            { name: 'Abu Dhabi', aliases: ['Abu Dhabi'] },
            { name: 'Sharjah',   aliases: ['Sharjah'] },
            { name: 'Ajman',     aliases: ['Ajman'] },
        ],
    },
    'Saudi Arabia': {
        iso2: 'sa',
        cities: [
            { name: 'Riyadh',  aliases: ['Riyadh'] },
            { name: 'Jeddah',  aliases: ['Jeddah', 'Jidda'] },
            { name: 'Dammam',  aliases: ['Dammam'] },
            { name: 'Mecca',   aliases: ['Mecca', 'Makkah'] },
            { name: 'Medina',  aliases: ['Medina', 'Madinah'] },
        ],
    },
    Israel: {
        iso2: 'il',
        cities: [
            { name: 'Tel Aviv',   aliases: ['Tel Aviv', 'Tel-Aviv'] },
            { name: 'Jerusalem',  aliases: ['Jerusalem'] },
            { name: 'Haifa',      aliases: ['Haifa'] },
        ],
    },
    'United States': {
        iso2: 'us',
        cities: [
            { name: 'New York',       aliases: ['New York', 'NYC', 'New York City'] },
            { name: 'San Francisco',  aliases: ['San Francisco', 'SF', 'Bay Area'] },
            { name: 'San Jose',       aliases: ['San Jose'] },
            { name: 'Los Angeles',    aliases: ['Los Angeles', 'LA'] },
            { name: 'Seattle',        aliases: ['Seattle'] },
            { name: 'Austin',         aliases: ['Austin'] },
            { name: 'Chicago',        aliases: ['Chicago'] },
            { name: 'Boston',         aliases: ['Boston'] },
            { name: 'Dallas',         aliases: ['Dallas'] },
            { name: 'Houston',        aliases: ['Houston'] },
            { name: 'Atlanta',        aliases: ['Atlanta'] },
            { name: 'Denver',         aliases: ['Denver'] },
            { name: 'Washington DC',  aliases: ['Washington DC', 'Washington D.C.', 'DC'] },
            { name: 'San Diego',      aliases: ['San Diego'] },
            { name: 'Phoenix',        aliases: ['Phoenix'] },
            { name: 'Miami',          aliases: ['Miami'] },
            { name: 'Philadelphia',   aliases: ['Philadelphia', 'Philly'] },
        ],
    },
    Canada: {
        iso2: 'ca',
        cities: [
            { name: 'Toronto',   aliases: ['Toronto'] },
            { name: 'Vancouver', aliases: ['Vancouver'] },
            { name: 'Montreal',  aliases: ['Montreal', 'Montréal'] },
            { name: 'Calgary',   aliases: ['Calgary'] },
            { name: 'Ottawa',    aliases: ['Ottawa'] },
            { name: 'Edmonton',  aliases: ['Edmonton'] },
        ],
    },
    Brazil: {
        iso2: 'br',
        cities: [
            { name: 'São Paulo',      aliases: ['São Paulo', 'Sao Paulo'] },
            { name: 'Rio de Janeiro', aliases: ['Rio de Janeiro', 'Rio'] },
            { name: 'Brasília',       aliases: ['Brasília', 'Brasilia'] },
            { name: 'Curitiba',       aliases: ['Curitiba'] },
            { name: 'Porto Alegre',   aliases: ['Porto Alegre'] },
        ],
    },
    Mexico: {
        iso2: 'mx',
        cities: [
            { name: 'Mexico City',  aliases: ['Mexico City', 'Ciudad de México', 'CDMX'] },
            { name: 'Monterrey',    aliases: ['Monterrey'] },
            { name: 'Guadalajara',  aliases: ['Guadalajara'] },
        ],
    },
    Australia: {
        iso2: 'au',
        cities: [
            { name: 'Sydney',    aliases: ['Sydney'] },
            { name: 'Melbourne', aliases: ['Melbourne'] },
            { name: 'Brisbane',  aliases: ['Brisbane'] },
            { name: 'Perth',     aliases: ['Perth'] },
            { name: 'Adelaide',  aliases: ['Adelaide'] },
        ],
    },
    'New Zealand': {
        iso2: 'nz',
        cities: [
            { name: 'Auckland',      aliases: ['Auckland'] },
            { name: 'Wellington',    aliases: ['Wellington'] },
            { name: 'Christchurch',  aliases: ['Christchurch'] },
        ],
    },
    'United Kingdom': {
        iso2: 'gb',
        cities: [
            { name: 'London',     aliases: ['London'] },
            { name: 'Manchester', aliases: ['Manchester'] },
            { name: 'Birmingham', aliases: ['Birmingham'] },
            { name: 'Edinburgh',  aliases: ['Edinburgh'] },
            { name: 'Glasgow',    aliases: ['Glasgow'] },
            { name: 'Leeds',      aliases: ['Leeds'] },
            { name: 'Bristol',    aliases: ['Bristol'] },
        ],
    },
    Germany: {
        iso2: 'de',
        cities: [
            { name: 'Berlin',    aliases: ['Berlin'] },
            { name: 'Munich',    aliases: ['Munich', 'München'] },
            { name: 'Frankfurt', aliases: ['Frankfurt'] },
            { name: 'Hamburg',   aliases: ['Hamburg'] },
            { name: 'Stuttgart', aliases: ['Stuttgart'] },
            { name: 'Cologne',   aliases: ['Cologne', 'Köln'] },
        ],
    },
    France: {
        iso2: 'fr',
        cities: [
            { name: 'Paris',     aliases: ['Paris'] },
            { name: 'Lyon',      aliases: ['Lyon'] },
            { name: 'Marseille', aliases: ['Marseille'] },
            { name: 'Toulouse',  aliases: ['Toulouse'] },
            { name: 'Nice',      aliases: ['Nice'] },
        ],
    },
    Netherlands: {
        iso2: 'nl',
        cities: [
            { name: 'Amsterdam',  aliases: ['Amsterdam'] },
            { name: 'Rotterdam',  aliases: ['Rotterdam'] },
            { name: 'The Hague',  aliases: ['The Hague', 'Den Haag'] },
            { name: 'Utrecht',    aliases: ['Utrecht'] },
        ],
    },
    Switzerland: {
        iso2: 'ch',
        cities: [
            { name: 'Zurich', aliases: ['Zurich', 'Zürich'] },
            { name: 'Geneva', aliases: ['Geneva', 'Genève'] },
            { name: 'Basel',  aliases: ['Basel'] },
        ],
    },
    Sweden: {
        iso2: 'se',
        cities: [
            { name: 'Stockholm',  aliases: ['Stockholm'] },
            { name: 'Gothenburg', aliases: ['Gothenburg', 'Göteborg'] },
            { name: 'Malmö',      aliases: ['Malmö', 'Malmo'] },
        ],
    },
    Norway: {
        iso2: 'no',
        cities: [
            { name: 'Oslo',   aliases: ['Oslo'] },
            { name: 'Bergen', aliases: ['Bergen'] },
        ],
    },
    Denmark: {
        iso2: 'dk',
        cities: [
            { name: 'Copenhagen', aliases: ['Copenhagen', 'København'] },
            { name: 'Aarhus',     aliases: ['Aarhus', 'Århus'] },
        ],
    },
    Finland: {
        iso2: 'fi',
        cities: [
            { name: 'Helsinki', aliases: ['Helsinki'] },
            { name: 'Espoo',    aliases: ['Espoo'] },
        ],
    },
    Ireland: {
        iso2: 'ie',
        cities: [
            { name: 'Dublin', aliases: ['Dublin'] },
            { name: 'Cork',   aliases: ['Cork'] },
        ],
    },
    Belgium: {
        iso2: 'be',
        cities: [
            { name: 'Brussels', aliases: ['Brussels', 'Bruxelles'] },
            { name: 'Antwerp',  aliases: ['Antwerp', 'Antwerpen'] },
        ],
    },
    Austria: {
        iso2: 'at',
        cities: [
            { name: 'Vienna', aliases: ['Vienna', 'Wien'] },
            { name: 'Graz',   aliases: ['Graz'] },
        ],
    },
    Spain: {
        iso2: 'es',
        cities: [
            { name: 'Madrid',    aliases: ['Madrid'] },
            { name: 'Barcelona', aliases: ['Barcelona'] },
            { name: 'Valencia',  aliases: ['Valencia'] },
            { name: 'Seville',   aliases: ['Seville', 'Sevilla'] },
        ],
    },
    Portugal: {
        iso2: 'pt',
        cities: [
            { name: 'Lisbon', aliases: ['Lisbon', 'Lisboa'] },
            { name: 'Porto',  aliases: ['Porto', 'Oporto'] },
        ],
    },
    Italy: {
        iso2: 'it',
        cities: [
            { name: 'Milan',   aliases: ['Milan', 'Milano'] },
            { name: 'Rome',    aliases: ['Rome', 'Roma'] },
            { name: 'Turin',   aliases: ['Turin', 'Torino'] },
            { name: 'Bologna', aliases: ['Bologna'] },
        ],
    },
    Luxembourg: {
        iso2: 'lu',
        cities: [
            { name: 'Luxembourg City', aliases: ['Luxembourg', 'Luxembourg City'] },
        ],
    },
    Poland: {
        iso2: 'pl',
        cities: [
            { name: 'Warsaw',  aliases: ['Warsaw', 'Warszawa'] },
            { name: 'Krakow',  aliases: ['Krakow', 'Kraków', 'Cracow'] },
            { name: 'Wroclaw', aliases: ['Wroclaw', 'Wrocław'] },
            { name: 'Gdansk',  aliases: ['Gdansk', 'Gdańsk'] },
        ],
    },
    'Czech Republic': {
        iso2: 'cz',
        cities: [
            { name: 'Prague', aliases: ['Prague', 'Praha'] },
            { name: 'Brno',   aliases: ['Brno'] },
        ],
    },
    Romania: {
        iso2: 'ro',
        cities: [
            { name: 'Bucharest',   aliases: ['Bucharest', 'București'] },
            { name: 'Cluj-Napoca', aliases: ['Cluj-Napoca', 'Cluj'] },
        ],
    },
    Hungary: {
        iso2: 'hu',
        cities: [
            { name: 'Budapest', aliases: ['Budapest'] },
        ],
    },
    Ukraine: {
        iso2: 'ua',
        cities: [
            { name: 'Kyiv', aliases: ['Kyiv', 'Kiev'] },
            { name: 'Lviv', aliases: ['Lviv', 'Lvov'] },
        ],
    },
    Slovakia: {
        iso2: 'sk',
        cities: [
            { name: 'Bratislava', aliases: ['Bratislava'] },
        ],
    },
    Bulgaria: {
        iso2: 'bg',
        cities: [
            { name: 'Sofia', aliases: ['Sofia'] },
        ],
    },
    Croatia: {
        iso2: 'hr',
        cities: [
            { name: 'Zagreb', aliases: ['Zagreb'] },
        ],
    },
    Serbia: {
        iso2: 'rs',
        cities: [
            { name: 'Belgrade', aliases: ['Belgrade', 'Beograd'] },
        ],
    },
    Greece: {
        iso2: 'gr',
        cities: [
            { name: 'Athens',       aliases: ['Athens', 'Athina'] },
            { name: 'Thessaloniki', aliases: ['Thessaloniki'] },
        ],
    },
    Estonia: {
        iso2: 'ee',
        cities: [
            { name: 'Tallinn', aliases: ['Tallinn'] },
        ],
    },
    Latvia: {
        iso2: 'lv',
        cities: [
            { name: 'Riga', aliases: ['Riga'] },
        ],
    },
    Lithuania: {
        iso2: 'lt',
        cities: [
            { name: 'Vilnius', aliases: ['Vilnius'] },
        ],
    },
    Remote: {
        iso2: null,
        cities: [
            { name: 'Remote',        aliases: ['Remote', 'Work From Home', 'WFH'] },
            { name: 'Work From Home',aliases: ['Work From Home', 'WFH', 'Remote'] },
            { name: 'Hybrid',        aliases: ['Hybrid'] },
        ],
    },
};

/**
 * Given a city name, find which country it belongs to.
 * Checks both canonical name and aliases.
 */
export function getCountryForCity(cityName) {
    const lower = cityName.toLowerCase();
    for (const [country, data] of Object.entries(CITY_DATA)) {
        for (const city of data.cities) {
            if (
                city.name.toLowerCase() === lower ||
                city.aliases.some(a => a.toLowerCase() === lower)
            ) {
                return country;
            }
        }
    }
    return null;
}

/**
 * Given a city name, return all its aliases joined as a regex-friendly string
 * for backend location search.
 */
export function getCitySearchTerm(cityName) {
    for (const data of Object.values(CITY_DATA)) {
        for (const city of data.cities) {
            if (
                city.name.toLowerCase() === cityName.toLowerCase() ||
                city.aliases.some(a => a.toLowerCase() === cityName.toLowerCase())
            ) {
                // Return the canonical name (backend does regex match)
                return city.name;
            }
        }
    }
    return cityName;
}

/**
 * Build a flat list of all cities for global search/autocomplete.
 */
export function getAllCities() {
    const result = [];
    for (const [country, data] of Object.entries(CITY_DATA)) {
        for (const city of data.cities) {
            result.push({ city: city.name, country, iso2: data.iso2, aliases: city.aliases });
        }
    }
    return result;
}
