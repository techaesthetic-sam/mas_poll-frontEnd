import config from '../config/environment';

/**
 * Generic API request helper
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  baseUrl?: string
): Promise<T> => {
  try {
    // Use full URL if baseUrl provided, otherwise use relative (for proxy)
    const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content (DELETE requests) - no response body
    if (response.status === 204) {
      return null as T;
    }

    // Check if response has content to parse
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      // Return null if empty body, otherwise parse JSON
      return text ? JSON.parse(text) : null as T;
    }

    // For non-JSON responses, return null
    return null as T;
  } catch (error: any) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Poll Service API (Port 8001)
 * - POST /polls - Create poll
 * - GET /polls - List polls
 * - GET /polls/{id} - Get poll
 * - PATCH /polls/{id}/close - Close poll
 */
export const pollService = {
  // Get all polls
  getAllPolls: async () => {
    return apiRequest(config.api.polls);
  },

  // Get a specific poll by ID
  getPollById: async (pollId: string) => {
    return apiRequest(config.api.pollById(pollId));
  },

  // Create a new poll
  createPoll: async (pollData: any) => {
    return apiRequest(config.api.polls, {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  },

  // Close a poll
  closePoll: async (pollId: string) => {
    return apiRequest(config.api.closePoll(pollId), {
      method: 'PATCH',
    });
  },

  // Delete a poll
  deletePoll: async (pollId: string) => {
    return apiRequest(config.api.pollById(pollId), {
      method: 'DELETE',
    });
  },
};

/**
 * Option Service API (Port 8002)
 * - POST /polls/{poll_id}/options - Add option
 * - GET /polls/{poll_id}/options - List options
 * - DELETE /options/{option_id} - Delete option
 */
export const optionService = {
  // Get all options for a poll
  getPollOptions: async (pollId: string) => {
    // Use full URL to route to option-service (port 8002)
    return apiRequest(config.api.pollOptions(pollId), {}, config.optionServiceUrl);
  },

  // Add an option to a poll
  addOption: async (pollId: string, optionData: any) => {
    // Use full URL to route to option-service (port 8002)
    return apiRequest(config.api.pollOptions(pollId), {
      method: 'POST',
      body: JSON.stringify(optionData),
    }, config.optionServiceUrl);
  },

  // Delete an option
  deleteOption: async (optionId: string) => {
    // Use full URL to route to option-service (port 8002)
    return apiRequest(config.api.optionById(optionId), {
      method: 'DELETE',
    }, config.optionServiceUrl);
  },
};

/**
 * Vote Service API (Port 8003)
 * - POST /vote - Submit vote
 * - GET /polls/{poll_id}/results - Get results
 * - GET /analytics/today - Today's vote count
 * - GET /analytics/top - Most voted poll
 */
export const voteService = {
  // Submit a vote
  submitVote: async (voteData: any) => {
    // Use full URL to route to vote-service (port 8003)
    return apiRequest(config.api.vote, {
      method: 'POST',
      body: JSON.stringify(voteData),
    }, config.voteServiceUrl);
  },

  // Get results for a poll
  getPollResults: async (pollId: string) => {
    // Use full URL to route to vote-service (port 8003)
    return apiRequest(config.api.pollResults(pollId), {}, config.voteServiceUrl);
  },

  // Get today's vote count
  getTodayAnalytics: async () => {
    // Use full URL to route to vote-service (port 8003)
    return apiRequest(config.api.analyticsToday, {}, config.voteServiceUrl);
  },

  // Get most voted poll
  getTopPoll: async () => {
    // Use full URL to route to vote-service (port 8003)
    return apiRequest(config.api.analyticsTop, {}, config.voteServiceUrl);
  },
};

export default {
  pollService,
  optionService,
  voteService,
};
