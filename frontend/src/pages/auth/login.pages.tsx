import { Form } from '../../components/form.component';
import FormButton from '../../components/form.component';
import FormField from '../../components/form.component';

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

const loginButtons: FormButton[] = [
  {
    type: 'submit',
    label: 'Sign In',
    variant: 'primary',
    size: 'md',
  },
  {
    type: 'reset',
    label: 'Clear',
    variant: 'outline',
    size: 'md',
  },
];

export const LoginPage = () => {
  const handleLogin = (data: Record<string, unknown>) => {
    console.log('Login data:', data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold text-primary">Arcademia</h1>
          <h2 className="text-xl font-medium text-foreground mt-4">Welcome Back</h2>
          <p className="text-sm text-muted mt-1">Sign in to your account</p>
        </div>
        <Form
          title=""
          description=""
          fields={loginFields}
          buttons={loginButtons}
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
