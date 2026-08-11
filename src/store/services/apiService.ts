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
    getAnnouncements: builder.query<any[], void>({
      query: () => '/announcements',
      providesTags: ['Announcements'],
    }),
    createAnnouncement: builder.mutation<any, Partial<any>>({
      query: (body) => ({
        url: '/announcements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Announcements'],
    }),
  }),
});

export const { useGetAnnouncementsQuery, useCreateAnnouncementMutation } = apiService;
