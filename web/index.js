(function () {
  const MAX_RESULTS = 5;
  const input = document.getElementById("search");
  const results = document.getElementById("results");
  const count = document.getElementById("count");
  const lede = document.getElementById("lede");
  let clubs = [];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function terms(query) {
    return ClubData.fold(query.replace(/\byc\b/gi, "yacht club").replace(/\bsc\b/gi, "sailing club"))
      .split(" ").filter(Boolean);
  }

  /* Lower is better: name starts with the query, then a word does, then anywhere. */
  function rank(club, words) {
    const name = club.searchName;
    const parts = name.split(" ");
    if (!words.every((word) => name.includes(word))) return -1;
    const phrase = words.join(" ");
    if (name.startsWith(phrase)) return 0;
    if (name.includes(" " + phrase)) return 1;
    if (words.every((word) => parts.some((part) => part.startsWith(word)))) return 2;
    return 3;
  }

  function matches(query) {
    const words = terms(query);
    if (!words.length) return [];
    return clubs
      .map((club) => ({ club, score: rank(club, words) }))
      .filter((match) => match.score >= 0)
      .sort((a, b) => a.score - b.score || a.club.name.length - b.club.name.length ||
        a.club.name.localeCompare(b.club.name))
      .map((match) => match.club);
  }

  function fact(list, term, value) {
    list.append(el("dt", "", term));
    const dd = el("dd");
    dd.append(value);
    list.append(dd);
  }

  function externalLink(href, text) {
    const link = el("a", "", text);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function burgeePanel(club) {
    const panel = el("div", "card-burgee");
    if (!club.burgee) {
      panel.classList.add("is-empty");
      panel.textContent = "No burgee on file";
      return panel;
    }
    const image = el("img");
    image.src = club.burgee;
    image.alt = club.description || "Burgee of " + club.name;
    image.loading = "lazy";
    image.addEventListener("error", () => {
      panel.classList.add("is-empty");
      panel.textContent = "Burgee image missing";
    });
    panel.append(image);
    return panel;
  }

  function coordinatesFact(club) {
    if (!club.coordinates) return "Not known";
    const [lat, lng] = club.coordinates;
    const span = document.createElement("span");
    span.append(externalLink(
      "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lng + "#map=15/" + lat + "/" + lng,
      lat + ", " + lng));
    if (club.precision === "town") span.append(" (town-level)");
    return span;
  }

  function card(club) {
    const item = el("li", "card");
    item.append(burgeePanel(club));
    const body = el("div", "card-body");
    body.append(el("h2", "", club.name));
    const facts = el("dl", "facts");
    const region = [club.city, club.state].filter(Boolean).join(", ");
    fact(facts, "Location", region || "Not known");
    fact(facts, "Country", club.country || "Not known");
    fact(facts, "Founded", club.founded.label);
    fact(facts, "Coordinates", coordinatesFact(club));
    if (/^https?:\/\//i.test(club.website)) {
      fact(facts, "Website", externalLink(club.website, club.website.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")));
    }
    body.append(facts);
    if (club.description) body.append(el("p", "burgee-desc", club.description));
    item.append(body);
    return item;
  }

  function render() {
    const query = input.value;
    const found = matches(query);
    results.replaceChildren(...found.slice(0, MAX_RESULTS).map(card));
    if (!query.trim()) count.textContent = "";
    else if (!found.length) count.textContent = "No club names match “" + query.trim() + "”.";
    else if (found.length <= MAX_RESULTS) count.textContent = found.length === 1 ? "1 match" : found.length + " matches";
    else count.textContent = "First " + MAX_RESULTS + " of " + found.length.toLocaleString() + " matches";
    const url = new URL(location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    history.replaceState(null, "", url);
  }

  ClubData.load().then((loaded) => {
    clubs = loaded;
    lede.textContent = "Search " + clubs.length.toLocaleString() + " yacht and boat clubs by name.";
    input.value = new URLSearchParams(location.search).get("q") || "";
    input.addEventListener("input", render);
    render();
  }).catch((error) => ClubData.showLoadError(results.parentElement.querySelector("#count"), error));
})();
