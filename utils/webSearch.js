import axios from 'axios';

export async function webSearch(query) {
  const { data } = await axios.post('https://api.tavily.com/search', {
    api_key: process.env.TAVILY_API_KEY,
    query,
    max_results: 8
  });
  // Flatten results into a text context for the LLM
  return data.results
    .map((r) => `${r.title}: ${r.snippet} (${r.url})`)
    .join('\n');
} 