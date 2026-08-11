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
  tagTypes: ['Announcements', 'User'],
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
  useGetAnnouncementsQuery, 
  useGetAnnouncementByIdQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation
} = apiService;
