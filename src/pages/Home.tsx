import { useEffect, useState } from 'react';
import { pollService } from '../services/apiService';
import { Poll } from '../types';
import PollCard from '../components/PollCard';

export default function Home() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pollService.getAllPolls();
      setPolls(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load polls. Please try again.');
      console.error('Error loading polls:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading polls...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-destructive">{error}</div>
        <button
          onClick={loadPolls}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">All Polls</h1>
        <p className="text-muted-foreground">
          {polls.length === 0
            ? 'No polls yet. Create your first poll!'
            : `${polls.length} poll${polls.length === 1 ? '' : 's'} available`}
        </p>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <p className="text-muted-foreground mb-4">No polls found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))}
        </div>
      )}
    </div>
  );
}

