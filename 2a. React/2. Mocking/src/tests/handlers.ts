import { http, HttpResponse } from 'msw';
import { API_URL, MOCKS } from './constants';

export const handlers = [
  http.get(API_URL, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search')?.toLowerCase();
    const projects = search
      ? MOCKS.filter((project) => project.label.toLowerCase().includes(search))
      : MOCKS;
    return HttpResponse.json({ projects });
  }),
];
