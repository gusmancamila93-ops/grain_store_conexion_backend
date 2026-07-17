import { render } from "@testing-library/react";

export async function renderAppAt(path) {
  window.history.pushState({}, "", path);

  const { AuthProvider } = await import("@/contexts/AuthProvider");
  const { default: App } = await import("@/App");

  return render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
}
