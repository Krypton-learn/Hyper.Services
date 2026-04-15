import { Form, type FormField, type FormButton } from '../../components/form.component';
import { useLogin } from '../../hooks/useLogin';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

const loginFields: FormField[] = [
  {
    name: 'identifier',
    label: 'Username or Email',
    type: 'text',
    placeholder: 'Enter your username or email',
    required: true,
    validation: {
      minLength: 3,
    },
    helperText: 'Enter your registered username or email address',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    required: true,
    helperText: 'Your password is case-sensitive',
  },
];

export const LoginPage = () => {
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleLogin = async (data: Record<string, unknown>) => {
    const identifier = data.identifier as string;
    const password = data.password as string;

    try {
      await loginMutation.mutateAsync({ identifier, password });
      toast.success('Login successful!');
      navigate({ to: '/dashboard' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      toast.error(message);
    }
  };

  const buttons: FormButton[] = [
    {
      type: 'submit',
      label: loginMutation.isPending ? 'Signing in...' : 'Sign In',
      variant: 'primary',
      size: 'md',
      disabled: loginMutation.isPending,
    },
    {
      type: 'reset',
      label: 'Clear',
      variant: 'outline',
      size: 'md',
      disabled: loginMutation.isPending,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <img src="/arcademia.svg" alt="Arcademia" className="w-20 h-20" />
          </div>
          <p className="text-xs text-muted mt-1">Arcademia Services</p>
          <h2 className="text-xl font-medium text-foreground mt-4">Welcome Back</h2>
          <p className="text-sm text-muted mt-1">Sign in to your account</p>
        </div>
        <Form
          title=""
          description=""
          fields={loginFields}
          buttons={buttons}
          onSubmit={handleLogin}
        />
        <div className="mt-4 text-center">
          <p className="text-sm text-muted">
            Don't have an account?{' '}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
