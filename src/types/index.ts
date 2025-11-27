export interface Poll {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  closed: boolean;
}

export interface Option {
  id: string;
  poll_id: string;
  text: string;
  created_at: string;
}

export interface Vote {
  id?: string;
  poll_id: string;
  option_id: string;
  created_at?: string;
}

export interface PollResult {
  poll_id: string;
  option_id: string;
  option_text: string;
  vote_count: number;
}

export interface PollWithOptions extends Poll {
  options?: Option[];
  results?: PollResult[];
}

export interface CreatePollData {
  title: string;
  description?: string;
}

export interface CreateOptionData {
  text: string;
}

