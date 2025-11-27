import config from '../config/environment';

/**
 * Generic API request helper
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
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
    return apiRequest(config.api.pollOptions(pollId));
  },

  // Add an option to a poll
  addOption: async (pollId: string, optionData: any) => {
    return apiRequest(config.api.pollOptions(pollId), {
      method: 'POST',
      body: JSON.stringify(optionData),
    });
  },

  // Delete an option
  deleteOption: async (optionId: string) => {
    return apiRequest(config.api.optionById(optionId), {
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
    return apiRequest(config.api.vote, {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  },

  // Get results for a poll
  getPollResults: async (pollId: string) => {
    return apiRequest(config.api.pollResults(pollId));
  },

  // Get today's vote count
  getTodayAnalytics: async () => {
    return apiRequest(config.api.analyticsToday);
  },

  // Get most voted poll
  getTopPoll: async () => {
    return apiRequest(config.api.analyticsTop);
  },
};

export default {
  pollService,
  optionService,
  voteService,
};
