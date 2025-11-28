import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pollService, optionService, voteService } from '../services/apiService';
import { Poll, Option, PollResult } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';

export default function PollDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [results, setResults] = useState<PollResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedOptionId, setUserVotedOptionId] = useState<string | null>(null);
  
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVoteSuccessModal, setShowVoteSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

      // Load poll
      const pollData = await pollService.getPollById(id) as Poll;
      setPoll(pollData);

      // Load options
      try {
        const optionsData = await optionService.getPollOptions(id);
        setOptions(Array.isArray(optionsData) ? optionsData : []);
      } catch (optionErr: any) {
        console.warn('Option service not available:', optionErr.message);
        setOptions([]);
      }

      // Load results
      try {
        const resultsData = await voteService.getPollResults(id);
        setResults(Array.isArray(resultsData) ? resultsData : []);
      } catch (err) {
        console.log('Results not available yet');
        setResults([]);
      }

      // Check vote status
      if (isAuthenticated && user) {
        try {
          const voteStatus = await voteService.getUserVoteStatus(id, user.user_id);
          setHasVoted(voteStatus.has_voted);
          setUserVotedOptionId(voteStatus.option_id || null);
        } catch (err) {
          console.log('Could not check vote status');
        }
      }
    } catch (err: any) {
      setError('Failed to load poll. Please try again later.');
      console.error('Error loading poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !id) return;

    if (!isAuthenticated || !user) {
      setShowLoginModal(true);
      return;
    }

    if (hasVoted) {
      return;
    }

    try {
      setVoting(true);
      setError(null);

      await voteService.submitVote({
        poll_id: id,
        option_id: selectedOption,
        user_id: user.user_id,
      });

      // Reload results and vote status
      const resultsData = await voteService.getPollResults(id);
      setResults(Array.isArray(resultsData) ? resultsData : []);
      
      const voteStatus = await voteService.getUserVoteStatus(id, user.user_id);
      setHasVoted(voteStatus.has_voted);
      setUserVotedOptionId(voteStatus.option_id || null);
      setSelectedOption('');
      
      setShowVoteSuccessModal(true);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit vote.';
      if (errorMessage.includes('already voted')) {
        // Refresh state
        loadPollData();
      } else {
        setError('Failed to submit vote. Please try again.');
      }
      console.error('Error voting:', err);
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!id) return;

    try {
      setIsProcessing(true);
      await pollService.closePoll(id);
      if (poll) {
        setPoll({ ...poll, closed: true });
      }
      setShowCloseModal(false);
    } catch (err: any) {
      setError('Failed to close poll.');
      console.error('Error closing poll:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePoll = async () => {
    if (!id) return;

    try {
      setIsProcessing(true);
      await pollService.deletePoll(id);
      navigate('/');
    } catch (err: any) {
      setError('Failed to delete poll.');
      console.error('Error deleting poll:', err);
      setShowDeleteModal(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalVotes = results.reduce((sum, r) => sum + r.vote_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-muted-foreground animate-pulse">Loading poll...</div>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">Something went wrong</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
        >
          Back to Polls
        </button>
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/')}
        className="group flex items-center gap-2 mb-8 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Back to Polls
      </button>

      <div className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">{poll.title}</h1>
            {poll.description && (
              <p className="text-lg text-muted-foreground leading-relaxed">{poll.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {poll.closed ? (
              <span className="px-4 py-1.5 text-sm font-medium bg-muted text-muted-foreground rounded-full">
                Closed
              </span>
            ) : (
              <button
                onClick={() => setShowCloseModal(true)}
                className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors"
              >
                Close Poll
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-1.5 text-sm font-medium text-muted-foreground border border-border hover:text-red-600 hover:bg-red-50 hover:border-red-600 dark:hover:bg-red-950/20 rounded-full transition-colors"
            >
              Delete Poll
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {!poll.closed && !hasVoted && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Cast Your Vote</h2>
              {!isAuthenticated && (
                <span className="text-sm text-muted-foreground font-medium">Login required</span>
              )}
            </div>
            
            {options.length > 0 ? (
              <div className="grid gap-3">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedOption === option.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/50 hover:border-primary/50 hover:bg-muted/50'
                    } ${!isAuthenticated ? 'opacity-75' : ''}`}
                  >
                    <input
                      type="radio"
                      name="option"
                      value={option.id}
                      checked={selectedOption === option.id}
                      onChange={(e) => {
                        if (isAuthenticated) {
                          setSelectedOption(e.target.value);
                        } else {
                          setShowLoginModal(true);
                        }
                      }}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-colors ${
                      selectedOption === option.id ? 'border-primary' : 'border-muted-foreground'
                    }`}>
                      {selectedOption === option.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-foreground font-medium">{option.text}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                <p className="text-muted-foreground">No options available for this poll yet.</p>
              </div>
            )}

            <button
              onClick={handleVote}
              disabled={!selectedOption || voting || (!isAuthenticated && options.length > 0)}
              className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/20"
            >
              {voting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Vote'
              )}
            </button>
          </div>
        )}

        {(hasVoted || poll.closed) && options.length > 0 && (
          <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Results</h2>
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
              </span>
            </div>

            <div className="space-y-4">
              {options
                .map((option) => {
                  // Find the result for this option, or default to 0 votes
                  const result = results.find(r => r.option_id === option.id);
                  const voteCount = result?.vote_count || 0;
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                  const isUserVote = option.id === userVotedOptionId;
                  
                  return {
                    option_id: option.id,
                    option_text: option.text,
                    vote_count: voteCount,
                    percentage,
                    isUserVote
                  };
                })
                .sort((a, b) => b.vote_count - a.vote_count)
                .map((item) => {
                  return (
                    <div key={item.option_id} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="flex items-center gap-2 text-foreground">
                          {item.option_text}
                          {item.isUserVote && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                              You
                            </span>
                          )}
                        </span>
                        <span className="text-muted-foreground">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${
                            item.isUserVote ? 'bg-primary' : 'bg-primary/60'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {hasVoted && !poll.closed && (
          <div className="mt-8 p-4 rounded-xl flex items-center gap-3 text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p className="font-medium">You have already voted on this poll.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Poll"
        type="danger"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePoll}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this poll? This action cannot be undone.</p>
      </Modal>

      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Close Poll"
        footer={
          <>
            <button
              onClick={() => setShowCloseModal(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClosePoll}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Closing...' : 'Close Poll'}
            </button>
          </>
        }
      >
        <p>Are you sure you want to close this poll? Users will no longer be able to vote.</p>
      </Modal>

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Login Required"
        footer={
          <>
            <button
              onClick={() => setShowLoginModal(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
            >
              Login
            </button>
          </>
        }
      >
        <p>You need to be logged in to vote on polls.</p>
      </Modal>

      <Modal
        isOpen={showVoteSuccessModal}
        onClose={() => setShowVoteSuccessModal(false)}
        title="Vote Submitted"
        footer={
          <button
            onClick={() => setShowVoteSuccessModal(false)}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p>Your vote has been successfully recorded!</p>
        </div>
      </Modal>
    </div>
  );
}

