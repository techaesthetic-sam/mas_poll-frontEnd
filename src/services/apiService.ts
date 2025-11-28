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
    // Use full URL to route to poll-service (port 8001)
    const url = `${config.pollServiceUrl}${config.api.polls}`;
    const response = await apiRequest<{ polls: any[] }>(url);
    // Backend returns { polls: [...] }, extract and transform
    return (response.polls || []).map((poll: any) => ({
      id: poll.poll_id || poll.id,
      title: poll.title,
      description: poll.description,
      created_at: poll.created_at,
      closed: poll.is_closed ?? poll.closed ?? false,
    }));
  },

  // Get a specific poll by ID
  getPollById: async (pollId: string) => {
    // Use full URL to route to poll-service (port 8001)
    const url = `${config.pollServiceUrl}${config.api.pollById(pollId)}`;
    const poll = await apiRequest<any>(url);
    // Transform to match frontend type
    return {
      id: poll.poll_id || poll.id,
      title: poll.title,
      description: poll.description,
      created_at: poll.created_at,
      closed: poll.is_closed ?? poll.closed ?? false,
    };
  },

  // Create a new poll
  createPoll: async (pollData: any) => {
    // Use full URL to route to poll-service (port 8001)
    const url = `${config.pollServiceUrl}${config.api.polls}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  },

  // Close a poll
  closePoll: async (pollId: string) => {
    // Use full URL to route to poll-service (port 8001)
    const url = `${config.pollServiceUrl}${config.api.closePoll(pollId)}`;
    return apiRequest(url, {
      method: 'PATCH',
    });
  },

  // Delete a poll
  deletePoll: async (pollId: string) => {
    // Use full URL to route to poll-service (port 8001)
    const url = `${config.pollServiceUrl}${config.api.pollById(pollId)}`;
    return apiRequest(url, {
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
    const url = `${config.optionServiceUrl}${config.api.pollOptions(pollId)}`;
    const response = await apiRequest<{ options: any[] }>(url);
    // Backend returns { options: [...] }, extract and transform
    return (response?.options || []).map((option: any) => ({
      id: option.option_id || option.id,
      poll_id: option.poll_id,
      text: option.text,
      created_at: option.created_at,
    }));
  },

  // Add an option to a poll
  addOption: async (pollId: string, optionData: any) => {
    // Use full URL to route to option-service (port 8002)
    const url = `${config.optionServiceUrl}${config.api.pollOptions(pollId)}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(optionData),
    });
  },

  // Delete an option
  deleteOption: async (optionId: string) => {
    // Use full URL to route to option-service (port 8002)
    const url = `${config.optionServiceUrl}${config.api.optionById(optionId)}`;
    return apiRequest(url, {
      method: 'DELETE',
    });
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
    const url = `${config.voteServiceUrl}${config.api.vote}`;
    return apiRequest(url, {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  },

  // Get results for a poll
  getPollResults: async (pollId: string) => {
    // Use full URL to route to vote-service (port 8003)
    const url = `${config.voteServiceUrl}${config.api.pollResults(pollId)}`;
    const response = await apiRequest<{ poll_id: string; results: Array<{ option_id: string; text: string; votes: number }> }>(url);
    // Transform to match frontend type
    return (response?.results || []).map((result) => ({
      poll_id: response.poll_id,
      option_id: result.option_id,
      option_text: result.text,
      vote_count: result.votes,
    }));
  },

  // Get today's vote count
  getTodayAnalytics: async () => {
    // Use full URL to route to vote-service (port 8003)
    const url = `${config.voteServiceUrl}${config.api.analyticsToday}`;
    return apiRequest(url);
  },

  // Get most voted poll
  getTopPoll: async () => {
    // Use full URL to route to vote-service (port 8003)
    const url = `${config.voteServiceUrl}${config.api.analyticsTop}`;
    return apiRequest(url);
  },

  // Check if user has voted on a poll
  getUserVoteStatus: async (pollId: string, userId: string) => {
    const url = `${config.voteServiceUrl}${config.api.userVoteStatus(pollId, userId)}`;
    return apiRequest<{ has_voted: boolean; option_id: string | null }>(url);
  },
};

/**
 * Auth Service API (Port 8003 - same as vote-service)
 */
export const authService = {
  // Register a new user
  register: async (credentials: { username: string; password: string }) => {
    const url = `${config.voteServiceUrl}${config.api.register}`;
    return apiRequest<{ user_id: string; username: string; created_at: string }>(url, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Login user
  login: async (credentials: { username: string; password: string }) => {
    const url = `${config.voteServiceUrl}${config.api.login}`;
    return apiRequest<{ user_id: string; username: string; created_at: string }>(url, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

export default {
  pollService,
  optionService,
  voteService,
  authService,
};
