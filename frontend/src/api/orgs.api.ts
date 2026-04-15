import api from './api'

export interface Employee {
  _id: string
  userId: string
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: string
  department?: string
}

export interface Organization {
  _id: string
  name: string
  founder: string | {
    _id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
  }
  admin: string[] | {
    _id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
  }[]
  employees?: (Employee | string)[]
  departments: string[]
  created_at?: Date
}

export interface CreateOrgInput {
  name: string
  founder?: string
  admin?: string[]
  departments?: string[]
}

export interface UpdateOrgInput {
  name?: string
  founder?: string
  admin?: string[]
  departments?: string[]
}

export const orgsApi = {
  getAll: async (populate?: boolean): Promise<Organization[]> => {
    const searchParams = new URLSearchParams()
    if (populate) searchParams.set('populate', 'true')
    const query = searchParams.toString()
    const url = query ? `/orgs/get/all?${query}` : '/orgs/get/all'
    const response = await api.get<{ orgs: Organization[] }>(url)
    return response.data?.orgs || []
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await api.get<{ organization: Organization }>(`/orgs/get/${id}`)
    return response.data.organization!
  },

  create: async (data: CreateOrgInput): Promise<Organization> => {
    const response = await api.post<{ message: string; organization: Organization }>('/orgs/create', data)
    return response.data.organization
  },

  update: async (id: string, data: UpdateOrgInput): Promise<Organization> => {
    const response = await api.patch<{ message: string; organization: Organization }>(`/orgs/edit/${id}`, data)
    return response.data.organization
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orgs/delete/${id}`)
  },
}