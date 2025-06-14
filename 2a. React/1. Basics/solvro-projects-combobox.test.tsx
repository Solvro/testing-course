import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { SolvroProjectsCombobox } from "../src/components/solvro-projects-combobox";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "node:test";

// needed for Radix UI components
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserver;

Element.prototype.scrollIntoView = vi.fn();

describe("SolvroProjectsCombobox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    const user = userEvent.setup();
    render(<SolvroProjectsCombobox />);

    const getComboboxButton = () => screen.getByRole("combobox");
    const getPopover = () => document.querySelector('[data-state="open"]');
    const getOptions = () => screen.queryAllByRole("option");
    const getSearchInput = () => screen.getByPlaceholderText(/projekt/i);
    const getEmptyMessage = () => screen.queryByText(/znaleziono projekt/i);

    const openCombobox = async () => {
      await user.click(getComboboxButton());
    };

    const searchFor = async (text: string) => {
      const input = getSearchInput();
      await user.clear(input);
      await user.type(input, text);
      return getOptions();
    };

    const selectOption = async (index: number) => {
      const options = getOptions();
      if (options[index]) {
        await user.click(options[index]);
      }
    };

    return {
      user,
      getComboboxButton,
      getPopover,
      getOptions,
      getSearchInput,
      getEmptyMessage,
      openCombobox,
      searchFor,
      selectOption,
    };
  };

  it("should render", () => {
    const { getComboboxButton } = setup();
    expect(getComboboxButton()).toBeInTheDocument();
  });

  it("should open popover when clicked", async () => {
    const { openCombobox, getOptions } = setup();
    await openCombobox();
    expect(getOptions()).toHaveLength(5);
  });

  it("should filter options when searching", async () => {
    const { openCombobox, searchFor } = setup();
    await openCombobox();

    const options = await searchFor("topwr");

    expect(options).toHaveLength(1);
    expect(within(options[0]).getByText(/topwr/i)).toBeInTheDocument();
  });

  it("should show empty options when no matches are found", async () => {
    const { openCombobox, searchFor, getEmptyMessage } = setup();
    await openCombobox();

    await searchFor("xyz");

    expect(getEmptyMessage()).toBeInTheDocument();
  });

  it("should select an option and update button text", async () => {
    const { openCombobox, selectOption, getComboboxButton } = setup();
    await openCombobox();

    await selectOption(1);
    expect(getComboboxButton()).toHaveTextContent(/topwr/i);
  });

  it("should clear the selection when clicking the same option again", async () => {
    const { openCombobox, selectOption, getComboboxButton } = setup();
    await openCombobox();
    await selectOption(1);

    await openCombobox();
    await selectOption(1);

    expect(getComboboxButton()).toHaveTextContent(/projekt/i);
  });

  it("should close popover after selection", async () => {
    const { openCombobox, selectOption, getPopover } = setup();
    const popover = await openCombobox();
    expect(popover).toBeInTheDocument();

    await selectOption(1);

    expect(getPopover()).not.toBeInTheDocument();
  });
});
