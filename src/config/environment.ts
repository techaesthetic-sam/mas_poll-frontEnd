/**
 * Environment configuration for backend microservices endpoints
 * 
 * Architecture:
 * - Poll Service: Port 8001 - Poll CRUD operations
 * - Option Service: Port 8002 - Poll options management
 * - Vote Service: Port 8003 - Voting & analytics
 */

export const config = {
  // Poll Service (Port 8001)
  pollServiceUrl: (() => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POLL_SERVICE_URL) {
      return import.meta.env.VITE_POLL_SERVICE_URL;
    }
    return 'http://localhost:8001';
  })(),

  // Option Service (Port 8002)
  optionServiceUrl: (() => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPTION_SERVICE_URL) {
      return import.meta.env.VITE_OPTION_SERVICE_URL;
    }
    return 'http://localhost:8002';
  })(),

  // Vote Service (Port 8003)
  voteServiceUrl: (() => {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VOTE_SERVICE_URL) {
      return import.meta.env.VITE_VOTE_SERVICE_URL;
    }
    return 'http://localhost:8003';
  })(),

  // API endpoints (relative paths - will be proxied by Vite)
  api: {
    // Poll Service endpoints
    polls: '/polls',
    pollById: (id: string) => `/polls/${id}`,
    closePoll: (id: string) => `/polls/${id}/close`,
    
    // Option Service endpoints
    pollOptions: (pollId: string) => `/polls/${pollId}/options`,
    optionById: (optionId: string) => `/options/${optionId}`,
    
    // Vote Service endpoints
    vote: '/vote',
    pollResults: (pollId: string) => `/polls/${pollId}/results`,
    analyticsToday: '/analytics/today',
    analyticsTop: '/analytics/top',
    
    // Auth endpoints
    register: '/auth/register',
    login: '/auth/login',
    userVoteStatus: (pollId: string, userId: string) => `/polls/${pollId}/user/${userId}/status`,
  },
};

export default config;
