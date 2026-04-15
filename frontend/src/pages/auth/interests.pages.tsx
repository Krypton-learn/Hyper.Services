import { useState } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useRegister } from '../../hooks/useRegister';
import type { RegisterInput } from '../../lib/types';

const interestCategories = [
  {
    name: 'academics',
    label: 'Academics',
    options: [
      { value: 'math', label: 'Mathematics' },
      { value: 'science', label: 'Science' },
      { value: 'english', label: 'English' },
      { value: 'history', label: 'History' },
      { value: 'geography', label: 'Geography' },
      { value: 'physics', label: 'Physics' },
      { value: 'chemistry', label: 'Chemistry' },
      { value: 'biology', label: 'Biology' },
    ],
  },
  {
    name: 'skills',
    label: 'Skills',
    options: [
      { value: 'coding', label: 'Coding/Programming' },
      { value: 'writing', label: 'Writing' },
      { value: 'reading', label: 'Reading' },
      { value: 'analysis', label: 'Analytical Thinking' },
      { value: 'communication', label: 'Communication' },
      { value: 'creativity', label: 'Creativity' },
    ],
  },
  {
    name: 'hobbies',
    label: 'Hobbies',
    options: [
      { value: 'music', label: 'Music' },
      { value: 'art', label: 'Art & Drawing' },
      { value: 'sports', label: 'Sports' },
      { value: 'gaming', label: 'Gaming' },
      { value: 'cooking', label: 'Cooking' },
      { value: 'photography', label: 'Photography' },
    ],
  },
];

export const InterestsPage = () => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const registerMutation = useRegister();
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const handleInterestsSubmit = async () => {
    try {
      const signupData = routerState.location.state?.signupData as RegisterInput | undefined;
      
      if (!signupData) {
        toast.error('No signup data found. Please go back.');
        navigate({ to: '/register' });
        return;
      }

      const payload = {
        ...signupData,
        interests: selectedInterests,
      };

      await registerMutation.mutateAsync(payload);
      toast.success('Account created successfully!');
      navigate({ to: '/login' });
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    }
  };

  const handleBack = () => {
    navigate({ to: '/register' });
  };

  const handleCheckboxChange = (category: string, value: string, checked: boolean) => {
    setSelectedInterests((prev) => {
      if (checked) {
        return [...prev, `${category}:${value}`];
      } else {
        return prev.filter((interest) => !interest.startsWith(`${category}:`));
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/5 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <img src="/arcademia.svg" alt="Arcademia" className="w-40 h-28" />
          </div>
          <p className="text-xs text-muted mt-1">Arcademia Services</p>
          <h2 className="text-xl font-medium text-foreground mt-4">Select Your Interests</h2>
          <p className="text-sm text-muted mt-1">Choose topics you'd like to learn about</p>
        </div>

        <div className="bg border border-muted/30 rounded-xl p-10">
          {interestCategories.map((category) => (
            <div key={category.name} className="mb-8 last:mb-0">
              <h3 className="text-lg font-medium text-foreground mb-4">{category.label}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {category.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 cursor-pointer group p-2 rounded-lg hover:bg-muted/10 transition-colors"
                  >
                    <input
                      type="checkbox"
                      name={category.name}
                      value={option.value}
                      onChange={(e) =>
                        handleCheckboxChange(category.name, option.value, e.target.checked)
                      }
                      className="w-4 h-4 rounded border-muted/50 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-5 pt-4 border-t border-muted/20 flex gap-2 w-full">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center font-medium text-base transition-all duration-200 focus:outline-none border border-primary text-primary hover:bg-primary/5 px-4 py-2 flex-1 rounded-lg"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleInterestsSubmit}
              className="inline-flex items-center justify-center font-medium text-base transition-all duration-200 focus:outline-none bg-primary text-white hover:bg-primary/90 px-4 py-2 flex-1 rounded-lg"
            >
              Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsPage;
