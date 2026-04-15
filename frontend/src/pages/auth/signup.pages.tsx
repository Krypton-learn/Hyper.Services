import { useNavigate } from '@tanstack/react-router';
import { Form, type FormField, type FormButton } from '../../components/form.component';
import type { RegisterInput } from '../../lib/types';

const signupFields: FormField[] = [
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter your first name',
    required: true,
    validation: {
      minLength: 2,
    },
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter your last name',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email address',
    required: true,
    helperText: 'We will never share your email',
  },
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Choose a username',
    required: true,
    validation: {
      minLength: 3,
    },
    helperText: 'This will be your unique identifier',
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Create a password',
    required: true,
    validation: {
      minLength: 8,
    },
    helperText: 'At least 8 characters',
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm your password',
    required: true,
    helperText: 'Must match your password',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: 'Enter your phone number',
  },
  {
    name: 'dob',
    label: 'Date of Birth',
    type: 'date',
    placeholder: 'Select your date of birth',
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    placeholder: 'Enter your address',
  },
];

const signupButtons: FormButton[] = [
  {
    type: 'submit',
    label: 'Next',
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

export const SignUpPage = () => {
  const navigate = useNavigate();

  const handleSignUp = (data: Record<string, unknown>) => {
    const signupData: RegisterInput = {
      firstName: data.firstName as string,
      lastName: data.lastName as string,
      email: data.email as string,
      username: data.username as string,
      password: data.password as string,
      phone: data.phone as string | undefined,
      dob: data.dob as string | undefined,
      address: data.address as string | undefined,
    };
    
    navigate({ to: '/interests', state: { signupData } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <img src="/arcademia.svg" alt="Arcademia" className="w-20 h-20" />
          </div>
          <p className="text-xs text-muted mt-1">Arcademia Services</p>
          <h2 className="text-xl font-medium text-foreground mt-4">Create Account</h2>
          <p className="text-sm text-muted mt-1">Join us today</p>
        </div>
        <Form
          title=""
          description=""
          fields={signupFields}
          buttons={signupButtons}
          onSubmit={handleSignUp}
        />
        <div className="mt-4 text-center">
          <p className="text-sm text-muted">
            Already have an account?{' '}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
