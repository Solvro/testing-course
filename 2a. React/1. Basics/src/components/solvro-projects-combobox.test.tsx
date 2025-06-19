import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

describe("SolvroProjectCombobox", () => {
  const renderComponent = async () => {
    render(<SolvroProjectsCombobox />);

    const trigger = screen.getByRole("combobox");
    const getOption = (label: RegExp) =>
      screen.findByRole("option", { name: label });
    const getAllOptions = () => screen.getAllByRole("option");

    const user = userEvent.setup();
    await user.click(trigger);

    const searchBar = screen.getByPlaceholderText(/szukaj/i);

    return {
      trigger,
      user,
      searchBar,
      getOption,
      getAllOptions,
    };
  };

  it("should render a projects combobox with correct placeholder", () => {
    render(<SolvroProjectsCombobox />);

    const comboBox = screen.getByRole("combobox");
    expect(comboBox).toHaveTextContent(/szukaj/i);
  });

  it("should display a search box and a list of options after clicking the trigger", async () => {
    const { searchBar, getAllOptions } = await renderComponent();

    expect(searchBar).toBeInTheDocument();
    const options = getAllOptions();
    expect(options.length).toBeGreaterThan(0);
  });

  it("should show currently selected project", async () => {
    const { trigger, user, getAllOptions } = await renderComponent();

    const firstOption = getAllOptions()[0];
    await user.click(firstOption);

    expect(trigger).toHaveTextContent(firstOption.textContent as string);
  });

  it("should show default placeholder after de-selecting a project", async () => {
    const { trigger, user, getAllOptions } = await renderComponent();

    await user.click(getAllOptions()[0]);

    await user.click(trigger);
    await user.click(getAllOptions()[0]);

    expect(trigger).toHaveTextContent(/szukaj/i);
  });

  it("should change trigger label after selecting a different project", async () => {
    const { trigger, user, getAllOptions } = await renderComponent();

    await user.click(getAllOptions()[0]);

    await user.click(trigger);
    const secondOption = getAllOptions()[1];
    await user.click(secondOption);

    expect(trigger).toHaveTextContent(secondOption.textContent as string);
  });

  it("should correctly filter search results", async () => {
    const { user, searchBar, getAllOptions } = await renderComponent();

    await user.type(searchBar, "chator");

    expect(getAllOptions().length).toBe(1);
  });

  it("should display a message if no search results were found", async () => {
    const { user, searchBar } = await renderComponent();

    await user.type(searchBar, "a".repeat(10));

    expect(screen.getByText(/nie/i)).toBeInTheDocument();
  });
});
