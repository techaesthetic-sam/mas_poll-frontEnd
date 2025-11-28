import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollService, optionService } from '../services/apiService';
import { CreatePollData, CreateOptionData } from '../types';

export default function CreatePoll() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePollData>({
    title: '',
    description: '',
  });
  const [options, setOptions] = useState<string[]>(['', '']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Poll title is required');
      return;
    }

    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return;
    }

    try {
      setLoading(true);

      // Create poll
      const poll = await pollService.createPoll(formData);

      // Add options (if option-service is available)
      // Note: This will fail gracefully if option-service is not yet implemented
      try {
        for (const optionText of validOptions) {
          await optionService.addOption(poll.id, { text: optionText.trim() });
        }
      } catch (optionError: any) {
        // Option service not available yet - poll is still created successfully
        console.warn('Option service not available:', optionError);
        // Continue to navigate - poll was created successfully
      }

      // Navigate to poll detail page (poll was created successfully)
      navigate(`/polls/${poll.id}`);
    } catch (err: any) {
      // Only show error if poll creation itself failed
      setError(err.message || 'Failed to create poll. Please try again.');
      console.error('Error creating poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Create New Poll</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            Poll Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter poll title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
            Description (optional)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Enter poll description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Options * (at least 2)
          </label>
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 text-sm text-primary hover:underline"
          >
            + Add Option
          </button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-border rounded-md hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

