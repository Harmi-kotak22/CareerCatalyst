const fetchLinkedInProfiles = async (searchQuery) => {
    try {
        const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
        const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;
        
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(`site:linkedin.com/in/ ${searchQuery}`)}&num=5`;

        const response = await fetch(searchUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error('Google CSE Error:', data);
            throw new Error(data.error?.message || 'Failed to fetch LinkedIn profiles');
        }

        // Transform Google search results into profile format
        const profiles = data.items?.map(item => {
            // Extract name from title (usually "Name - Position - Company | LinkedIn")
            const titleParts = item.title.split(' - ');
            const name = titleParts[0];
            
            // Extract current position and company if available
            const position = titleParts[1] || 'Position not specified';
            const company = titleParts[2]?.replace(' | LinkedIn', '') || 'Company not specified';
            
            // Extract snippet and clean it up
            const snippet = item.snippet?.replace(' | LinkedIn', '')
                                      .replace('View profile on LinkedIn.', '')
                                      .trim();

            return {
                name,
                title: position,
                company,
                description: snippet,
                profileUrl: item.link,
                thumbnailUrl: item.pagemap?.cse_thumbnail?.[0]?.src || null
            };
        }) || [];

        return profiles;
    } catch (error) {
        console.error('LinkedIn profile search error:', error);
        throw error;
    }
};

export { fetchLinkedInProfiles };