export async function loadConfig() {
  const appRes = await fetch("config/app.json");
  if (!appRes.ok) throw new Error("No se pudo cargar config/app.json");
  const app = await appRes.json();

  const themeId = app.activeTheme || "greicy";
  const themeRes = await fetch(`config/theme.${themeId}.json`);
  if (!themeRes.ok) throw new Error(`No se pudo cargar theme.${themeId}.json`);
  const theme = await themeRes.json();

  const assignmentRes = await fetch("config/assignment.json");
  if (!assignmentRes.ok) throw new Error("No se pudo cargar assignment.json");
  const assignment = await assignmentRes.json();

  return { app, theme, assignment };
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme.fonts?.display) root.style.setProperty("--font-display", theme.fonts.display);
  if (theme.fonts?.body) root.style.setProperty("--font-body", theme.fonts.body);
  if (theme.fonts?.math) root.style.setProperty("--font-math", theme.fonts.math);

  const colors = theme.colors || {};
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  document.body.classList.remove("layout-split", "layout-focus-graph", "layout-focus-camera");
  document.body.classList.add(`layout-${theme.layout || "split"}`);
}
