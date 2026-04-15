import { Form, type FormField, type FormButton } from '../components/form.component'
import { toast } from 'sonner'

const profileFields: FormField[] = [
  {
    name: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Enter your username',
    required: true,
    disabled: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    required: true,
    disabled: true,
  },
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter your first name',
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter your last name',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: 'Enter your phone number',
  },
  {
    name: 'address',
    label: 'Address',
    type: 'textarea',
    placeholder: 'Enter your address',
  },
]

const profileButtons: FormButton[] = [
  {
    type: 'submit',
    label: 'Save Changes',
    variant: 'primary',
    size: 'md',
  },
]

export const ProfilePage = () => {
  const handleSubmit = (_data: Record<string, unknown>) => {
    toast.success('Profile updated successfully')
  }

  return (
    <div className="min-h-screen bg-muted/5 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          <p className="text-sm text-muted">Manage your account settings</p>
        </div>
        <div className="bg-card border rounded-lg p-6">
          <Form
            title=""
            description=""
            fields={profileFields}
            buttons={profileButtons}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  )
}

export default ProfilePage