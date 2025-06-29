import { it, expect, describe } from 'vitest';
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { SolvroProjectsComboboxApi } from './solvro-projects-combobox-api';
import '@testing-library/jest-dom/vitest';
import { userEvent } from '@testing-library/user-event';
import { server } from '../tests/server';
import { delay, http, HttpResponse } from 'msw';
import { Providers } from './providers';
import { API_URL, MOCKS } from '@/tests/constants';

function getCombobox() {
  render(
    <Providers>
      <SolvroProjectsComboboxApi />
    </Providers>
  );
  return screen.getByRole('combobox');
}

async function clickCombobox() {
  const user = userEvent.setup();
  const combobox = getCombobox();
  expect(combobox).toBeInTheDocument();
  await user.click(combobox);
  return user;
}

const getLoader = () => screen.queryByText(/Ładowanie projektów.../i);

describe('SolvroProjectsComboboxApi', () => {
  it('should render an error message when the API fails', async () => {
    server.use(http.get(API_URL, () => HttpResponse.json({}, { status: 500 })));
    await clickCombobox();
    const list = screen.getByRole('listbox');
    expect(list).toHaveTextContent('Błąd podczas ładowania projektów');
  });

  it('should show a loading state while fetching projects', async () => {
    server.use(
      http.get(API_URL, async () => {
        await delay(1000);
        return HttpResponse.json({ projects: MOCKS });
      })
    );
    await clickCombobox();
    expect(screen.getByRole('listbox')).toHaveTextContent(
      'Ładowanie projektów...'
    );
    expect(getLoader()).toBeInTheDocument();
  });

  it('should remove loading state after projects are loaded', async () => {
    await clickCombobox();
    await waitForElementToBeRemoved(getLoader);
  });

  it('should render a select prompt', () => {
    const combobox = getCombobox();
    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/^wyszukaj projekt/i);
  });

  it('should show mocked options when clicked', async () => {
    await clickCombobox();
    const list = screen.getByRole('group');
    expect(list.children).toHaveLength(MOCKS.length);
    list.childNodes.forEach((option, index) => {
      expect(option).toHaveTextContent(MOCKS[index].label);
    });
  });

  it('should show error message on no matches', async () => {
    const user = await clickCombobox();
    const input = screen.getByPlaceholderText('Wyszukaj projekt...');
    expect(input).toBeInTheDocument();
    await user.type(input, 'klklcklcxzlcxkl;');
    const message = screen.getByRole('presentation');
    expect(message).toBeInTheDocument();
    expect(message).toHaveTextContent('Nie znaleziono projektu.');
  });

  it('should close dialog when project clicked', async () => {
    const user = await clickCombobox();
    const list = screen.getByRole('group');
    const firstOption = list.firstElementChild;
    expect(firstOption).toHaveTextContent(MOCKS[0].label);
    await user.click(firstOption!);
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    await user.click(screen.getByRole('combobox'));
    expect(screen.queryByRole('group')).toBeInTheDocument();
    await user.click(screen.getByRole('group').firstElementChild!);
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });

  it('opens dropdown when pressing Enter key on combobox', async () => {
    const user = userEvent.setup();
    const combobox = getCombobox();
    expect(combobox).toBeInTheDocument();

    combobox.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('group')).toBeInTheDocument();
    expect(screen.getByRole('group').children).toHaveLength(MOCKS.length);
  });
});
