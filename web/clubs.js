/* Loads clublist.yml and normalizes each club for the search and statistics pages. */
(function () {
  const LIST_URL = "../clublist.yml";
  const IMAGE_DIR = "../images/";

  function parseFounded(value) {
    if (typeof value === "number") return { kind: "exact", year: value, label: String(value) };
    const text = String(value ?? "").trim();
    const about = text.match(/^about\s+(\d{4})$/i);
    if (about) return { kind: "about", year: Number(about[1]), label: "about " + about[1] };
    if (/^\d{4}$/.test(text)) return { kind: "exact", year: Number(text), label: text };
    return { kind: "unknown", year: null, label: "Unknown" };
  }

  function decimals(number) {
    const part = String(number).split(".")[1];
    return part ? part.length : 0;
  }

  /* Town-level coordinates are stored with 2 decimals; points have up to 5. */
  function coordinatePrecision(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) return "none";
    return Math.max(decimals(coordinates[0]), decimals(coordinates[1])) >= 3 ? "point" : "town";
  }

  function fold(text) {
    return String(text).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
  }

  function normalize(entry) {
    const coordinates = Array.isArray(entry.coordinates) ? entry.coordinates : null;
    return {
      name: entry.name,
      city: entry.city || "",
      state: entry.state || "",
      country: entry.country || "",
      founded: parseFounded(entry.founded),
      website: entry.website || "",
      coordinates,
      precision: coordinatePrecision(coordinates),
      burgee: entry.burgee ? IMAGE_DIR + entry.burgee : "",
      description: entry.description || "",
      searchName: fold(entry.name),
    };
  }

  async function load() {
    const response = await fetch(LIST_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error("Could not load clublist.yml (" + response.status + ")");
    const data = jsyaml.load(await response.text());
    return data.filter((entry) => entry && entry.name).map(normalize);
  }

  function showLoadError(target, error) {
    const box = document.createElement("div");
    box.className = "notice";
    box.append("The club list could not be loaded. These pages need a local web server: run ");
    const code = document.createElement("code");
    code.textContent = "make serve";
    box.append(code, " from the repository, then open http://localhost:8000/web/. (" + error.message + ")");
    target.replaceChildren(box);
  }

  window.ClubData = { load, fold, showLoadError };
})();
