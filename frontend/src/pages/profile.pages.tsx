import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Form, type FormField, type FormButton } from '../components/form.component'
import { AppLayout } from '../components/app-layout.component'
import { useAuth } from '../hooks/useAuth'
import api from '../api/api'
import { toast } from 'sonner'
import Avatar from 'react-avatar'
import { z } from 'zod'

const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  interests: z.array(z.string()).optional(),
  address: z.string().optional(),
})

type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>

interface UserProfile {
  _id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  address?: string
  dob?: string
  interests?: string[]
}

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
  const { user, organizations, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateUserProfileInput) => {
      const validated = updateUserProfileSchema.parse(data)
      const res = await api.patch<{ user: UserProfile }>('/auth/profile', validated)
      return res.data.user
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })

  const handleSubmit = (data: Record<string, unknown>) => {
    updateMutation.mutate(data as UpdateUserProfileInput)
  }

  if (authLoading) {
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted animate-pulse">Loading profile...</div>
        </div>
      </AppLayout>
    )
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="p-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-muted">Please log in to view your profile</div>
        </div>
      </AppLayout>
    )
  }

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username

  return (
    <AppLayout>
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
              <p className="text-sm text-muted">Manage your account settings</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted/10 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="bg-card border rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={displayName} size="64" round className="flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
                <p className="text-sm text-muted">{user.email}</p>
                <p className="text-xs text-muted">@{user.username}</p>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="bg-card border rounded-lg p-6">
              <Form
                title=""
                description=""
                fields={profileFields}
                buttons={profileButtons}
                onSubmit={handleSubmit}
                initialValues={{
                  username: user.username || '',
                  email: user.email || '',
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  phone: user.phone || '',
                  address: user.address || '',
                }}
                layout="vertical"
              />
            </div>
          )}

          {!isEditing && (user.phone || user.address || organizations.length > 0) && (
            <div className="bg-card border rounded-lg p-6">
              <h3 className="text-sm font-medium text-foreground mb-4">Additional Information</h3>
              {user.phone && (
                <div className="mb-3">
                  <p className="text-xs text-muted">Phone</p>
                  <p className="text-sm text-foreground">{user.phone}</p>
                </div>
              )}
              {user.address && (
                <div className="mb-3">
                  <p className="text-xs text-muted">Address</p>
                  <p className="text-sm text-foreground">{user.address}</p>
                </div>
              )}
              {organizations.length > 0 && (
                <div>
                  <p className="text-xs text-muted">Organizations</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {organizations.map((org) => (
                      <span
                        key={org._id}
                        className="px-2 py-1 bg-primary/10 text-primary text-sm rounded"
                      >
                        {org.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}

export default ProfilePage