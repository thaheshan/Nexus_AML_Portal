import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export const apiService = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Announcements', 'User', 'Cases', 'Alerts'],
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<any, any>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getUsers: builder.query<any[], void>({
      query: () => '/users',
    }),
    getCases: builder.query<{ data: any[], meta: any }, { page?: number, limit?: number, status?: string, riskLevel?: string, assigneeId?: string, search?: string }>({
      query: (params) => {
        let url = '/cases?';
        if (params?.page) url += `page=${params.page}&`;
        if (params?.limit) url += `limit=${params.limit}&`;
        if (params?.status) url += `status=${encodeURIComponent(params.status)}&`;
        if (params?.riskLevel) url += `riskLevel=${encodeURIComponent(params.riskLevel)}&`;
        if (params?.assigneeId) url += `assigneeId=${encodeURIComponent(params.assigneeId)}&`;
        if (params?.search) url += `search=${encodeURIComponent(params.search)}`;
        return url;
      },
      providesTags: ['Cases'],
    }),
    getCaseById: builder.query<any, string>({
      query: (id) => `/cases/${id}`,
      providesTags: (result, error, id) => [{ type: 'Cases', id }],
    }),
    createCase: builder.mutation<any, any>({
      query: (caseData) => ({
        url: '/cases',
        method: 'POST',
        body: caseData,
      }),
      invalidatesTags: ['Cases'],
    }),
    updateCase: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/cases/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Cases', id }, 'Cases'],
    }),
    getAlerts: builder.query<{ data: any[], meta: any }, { page?: number, limit?: number, severity?: string, type?: string, status?: string, search?: string, unresolvedOnly?: boolean }>({
      query: (params) => {
        let url = '/alerts?';
        if (params?.page) url += `page=${params.page}&`;
        if (params?.limit) url += `limit=${params.limit}&`;
        if (params?.severity) url += `severity=${encodeURIComponent(params.severity)}&`;
        if (params?.type) url += `type=${encodeURIComponent(params.type)}&`;
        if (params?.status) url += `status=${encodeURIComponent(params.status)}&`;
        if (params?.search) url += `search=${encodeURIComponent(params.search)}&`;
        if (params?.unresolvedOnly) url += `unresolvedOnly=true`;
        return url;
      },
      providesTags: ['Alerts'],
    }),
    getAlertById: builder.query<any, string>({
      query: (id) => `/alerts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Alerts', id }],
    }),
    createAlert: builder.mutation<any, any>({
      query: (data) => ({ url: '/alerts', method: 'POST', body: data }),
      invalidatesTags: ['Alerts'],
    }),
    updateAlertStatus: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({ url: `/alerts/${id}`, method: 'PATCH', body: data }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Alerts', id }, 'Alerts'],
    }),
    getAnnouncements: builder.query<{ data: any[], meta: any }, { page?: number, limit?: number, category?: string, search?: string }>({
      query: (params) => {
        let url = '/announcements?';
        if (params?.page) url += `page=${params.page}&`;
        if (params?.limit) url += `limit=${params.limit}&`;
        if (params?.category) url += `category=${encodeURIComponent(params.category)}&`;
        if (params?.search) url += `search=${encodeURIComponent(params.search)}`;
        return url;
      },
      providesTags: ['Announcements'],
    }),
    getAnnouncementById: builder.query<any, string>({
      query: (id) => `/announcements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Announcements', id }],
    }),
    createAnnouncement: builder.mutation<any, any>({
      query: (announcement) => ({
        url: '/announcements',
        method: 'POST',
        body: announcement,
      }),
      invalidatesTags: ['Announcements'],
    }),
    updateAnnouncement: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/announcements/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Announcements', id }, 'Announcements'],
    }),
    deleteAnnouncement: builder.mutation<any, string>({
      query: (id) => ({
        url: `/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcements'],
    }),
  }),
});

export const { 
  useGetUsersQuery,
  useGetCasesQuery,
  useGetCaseByIdQuery,
  useCreateCaseMutation,
  useUpdateCaseMutation,
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useCreateAlertMutation,
  useUpdateAlertStatusMutation,
  useGetAnnouncementsQuery, 
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation
} = apiService;
