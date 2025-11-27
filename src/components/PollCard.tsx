import { Link } from 'react-router-dom';
import { Poll } from '../types';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const date = new Date(poll.created_at).toLocaleDateString();

  return (
    <Link
      to={`/polls/${poll.id}`}
      className="block bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-xl font-semibold text-foreground">{poll.title}</h3>
        {poll.closed && (
          <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
            Closed
          </span>
        )}
      </div>
      {poll.description && (
        <p className="text-muted-foreground mb-4 line-clamp-2">{poll.description}</p>
      )}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Created {date}</span>
        <span className="text-primary">View →</span>
      </div>
    </Link>
  );
}

