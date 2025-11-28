import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollService, optionService, voteService } from '../services/apiService';
import { Poll, Option, PollResult } from '../types';

export default function PollDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPollData();
    }
  }, [id]);

  const loadPollData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      setOptionsError(null); // Clear options error

      // Load poll
      const pollData = await pollService.getPollById(id) as Poll;
      setPoll(pollData);

      // Load options (if option-service is available)
      try {
        const optionsData = await optionService.getPollOptions(id);
        setOptions(Array.isArray(optionsData) ? optionsData : []);
        setOptionsError(null); // Clear error on success
      } catch (optionErr: any) {
        // Option service not available yet - show empty options
        // Don't show error to user, just log it
        console.warn('Option service not available (this is expected until service is implemented):', optionErr.message);
        setOptions([]);
        // Don't set error state - this is expected behavior
      }

      // Load results (if vote-service is available)
      try {
        const resultsData = await voteService.getPollResults(id);
        setResults(Array.isArray(resultsData) ? resultsData : []);
        setHasVoted(results.length > 0);
      } catch (err) {
        // Results might not be available yet - this is expected
        console.log('Results not available yet (vote-service not implemented)');
        setResults([]);
      }
    } catch (err: any) {
      // Only show error if poll itself failed to load
      setError(err.message || 'Failed to load poll. Please try again.');
      console.error('Error loading poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !id) return;

    try {
      setVoting(true);
      setError(null);

      await voteService.submitVote({
        poll_id: id,
        option_id: selectedOption,
      });

      // Reload results
      const resultsData = await voteService.getPollResults(id);
      setResults(Array.isArray(resultsData) ? resultsData : []);
      setHasVoted(true);
      setSelectedOption('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote. Please try again.');
      console.error('Error voting:', err);
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!id) return;

    try {
      await pollService.closePoll(id);
      if (poll) {
        setPoll({ ...poll, closed: true });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to close poll.');
      console.error('Error closing poll:', err);
    }
  };

  const handleDeletePoll = async () => {
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    try {
      await pollService.deletePoll(id);
      // Navigate back to home after successful deletion
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete poll.');
      console.error('Error deleting poll:', err);
    }
  };

  const totalVotes = results.reduce((sum, r) => sum + r.vote_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading poll...</div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-destructive">{error}</div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Back to Polls
        </button>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-muted-foreground hover:text-foreground"
      >
        ← Back to Polls
      </button>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{poll.title}</h1>
            {poll.description && (
              <p className="text-muted-foreground">{poll.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {poll.closed ? (
              <span className="px-3 py-1 text-sm font-medium bg-muted text-muted-foreground rounded">
                Closed
              </span>
            ) : (
              <button
                onClick={handleClosePoll}
                className="px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10 rounded"
              >
                Close Poll
              </button>
            )}
            <button
              onClick={handleDeletePoll}
              className="px-3 py-1 text-sm font-medium text-destructive hover:bg-destructive/10 rounded border border-destructive"
            >
              Delete Poll
            </button>
          </div>
        </div>

        {/* Only show error if poll loading failed, not for missing services */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
            {error}
          </div>
        )}

        {!poll.closed && !hasVoted && (
          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold text-foreground">Cast Your Vote</h2>
            {options.length > 0 ? (
              <>
                <div className="space-y-2">
                  {options.map((option) => (
                    <label
                      key={option.id}
                      className={`flex items-center p-4 border-2 rounded-md cursor-pointer transition-colors ${
                        selectedOption === option.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="option"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="mr-3"
                      />
                      <span className="text-foreground">{option.text}</span>
                    </label>
                  ))}
                </div>
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
                >
                  {voting ? 'Submitting...' : 'Submit Vote'}
                </button>
              </>
            ) : (
              <div className="p-4 bg-muted rounded-md text-sm text-muted-foreground">
                No options available yet. Options will appear here once the option-service is implemented.
              </div>
            )}
          </div>
        )}

        {(hasVoted || poll.closed) && results.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Results ({totalVotes} {totalVotes === 1 ? 'vote' : 'votes'})
            </h2>
            <div className="space-y-3">
              {results
                .sort((a, b) => b.vote_count - a.vote_count)
                .map((result) => {
                  const percentage =
                    totalVotes > 0 ? (result.vote_count / totalVotes) * 100 : 0;
                  return (
                    <div key={result.option_id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground">{result.option_text}</span>
                        <span className="text-muted-foreground">
                          {result.vote_count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {hasVoted && !poll.closed && (
          <div className="mt-4 p-4 bg-muted rounded-md text-sm text-muted-foreground">
            You have already voted on this poll.
          </div>
        )}
      </div>
    </div>
  );
}

