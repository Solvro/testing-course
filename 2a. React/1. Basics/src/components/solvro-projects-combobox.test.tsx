import { render, screen } from "@testing-library/react";
import { SolvroProjectsCombobox } from "./solvro-projects-combobox";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

describe("SolvroProjectsCombobox", () => {
  const renderComponent = async () => {
    render(<SolvroProjectsCombobox />);
    const combobox = screen.getByRole("combobox");
    const user = userEvent.setup();
    await user.click(combobox);

    return {
      combobox,
      searchBox: screen.getByPlaceholderText(/szukaj/i),
      group: screen.getByRole("group"),
      getOptions: () => screen.getAllByRole("option"),
      user,
    };
  };

  it("should render component with a proper initial text", () => {
    render(<SolvroProjectsCombobox />);

    const combobox = screen.getByRole("combobox");

    expect(combobox).toBeInTheDocument();
    expect(combobox).toHaveTextContent(/szukaj/i);
  });

  it("should display list of projects and search input after user clicks", async () => {
    const { searchBox: searchbox, group } = await renderComponent();

    expect(searchbox).toBeInTheDocument();
    expect(group).toBeInTheDocument();
  });

  it("should properly filter projects after typing into searchbox", async () => {
    const { searchBox: searchbox, getOptions, user } = await renderComponent();

    //let's assume the data used in component is mocked
    await user.type(searchbox, "ownik");

    expect(getOptions().length).toBe(2);
  });

  it("should display informative message when no projects were found", async () => {
    const { searchBox: searchbox, user } = await renderComponent();

    await user.type(searchbox, "asdf".repeat(10));

    expect(screen.getByText(/nie/i)).toBeInTheDocument();
  });

  it("should update combobox text after clicking an option", async () => {
    const { combobox, getOptions, user } = await renderComponent();

    const option = getOptions()[0];

    await user.click(option);

    expect(combobox.textContent).toContain(option.textContent);
  });

  it("should update combobox text to default after unclicking an option", async () => {
    const { combobox, getOptions, user } = await renderComponent();

    const option = getOptions()[0];

    await user.click(option);

    expect(combobox.textContent).toContain(option.textContent);

    await user.click(combobox);
    await user.click(getOptions()[0]);

    expect(combobox).toHaveTextContent(/szukaj/i);
  });

  it("should update combobox text after clicking different option", async () => {
    const { combobox, getOptions, user } = await renderComponent();

    const option1 = getOptions()[0];

    await user.click(option1);

    expect(combobox.textContent).toContain(option1.textContent);

    await user.click(combobox);

    const option2 = getOptions()[1];
    await user.click(option2);

    expect(combobox.textContent).toContain(option2.textContent);
  });
});
