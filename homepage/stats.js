(function () {
  let root;
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.hidden = true;
  document.body.append(tooltip);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const fmt = (n) => n.toLocaleString("en-US");
  const pct = (n, total) => {
    if (!total) return "0%";
    const value = (n / total) * 100;
    const nearEdge = (value > 0 && value < 1) || (value > 99 && value < 100);
    return (nearEdge ? value.toFixed(1) : Math.round(value)) + "%";
  };
  function tally(items, keyOf) {
    const counts = new Map();
    for (const item of items) {
      const key = keyOf(item);
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }

  function tip(node, text) {
    node.dataset.tip = text;
    node.setAttribute("aria-label", text);
    node.tabIndex = 0;
    return node;
  }
  function placeTip(x, y) {
    const box = tooltip.getBoundingClientRect();
    tooltip.style.left = Math.max(8, Math.min(innerWidth - box.width - 8, x + 12)) + "px";
    tooltip.style.top = Math.max(8, y - box.height - 10) + "px";
  }
  function showTip(target, x, y) {
    tooltip.textContent = target.dataset.tip;
    tooltip.hidden = false;
    placeTip(x, y);
  }
  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest("[data-tip]");
    if (target) showTip(target, event.clientX, event.clientY);
    else tooltip.hidden = true;
  });
  document.addEventListener("pointermove", (event) => { if (!tooltip.hidden) placeTip(event.clientX, event.clientY); });
  document.addEventListener("focusin", (event) => {
    const target = event.target.closest("[data-tip]");
    if (!target) return;
    const box = target.getBoundingClientRect();
    showTip(target, box.left, box.top);
  });
  document.addEventListener("focusout", () => { tooltip.hidden = true; });

  function section(title, note) {
    const box = el("section", "stat-section");
    box.append(el("h2", "", title));
    if (note) box.append(el("p", "note", note));
    root.append(box);
    return box;
  }
  function panel(parent, title) {
    const box = el("div", "panel");
    if (title) box.append(el("h3", "", title));
    parent.append(box);
    return box;
  }

  function table(headers, rows, numeric) {
    const wrap = el("div", "table-wrap");
    const tbl = el("table");
    const head = el("tr");
    headers.forEach((text, i) => head.append(Object.assign(el("th", numeric[i] ? "num" : "", text), { scope: "col" })));
    const thead = el("thead");
    thead.append(head);
    const body = el("tbody");
    for (const row of rows) {
      const tr = el("tr");
      row.forEach((cell, i) => {
        const td = el("td", numeric[i] ? "num" : "");
        td.append(cell);
        tr.append(td);
      });
      body.append(tr);
    }
    tbl.append(thead, body);
    wrap.append(tbl);
    return wrap;
  }

  /* One whole split into parts: blocks in the first three series colors, legend, then a table. */
  function segmented(parent, parts) {
    const total = parts.reduce((sum, part) => sum + part.count, 0);
    const bar = el("div", "seg");
    parts.filter((part) => part.count).forEach((part, index) => {
      const slot = parts.indexOf(part) + 1;
      const block = el("div", "seg-part");
      const share = part.count / total;
      block.style.flex = share + " 1 0";
      block.style.background = "var(--series-" + slot + ")";
      block.style.color = "var(--on-series-" + slot + ")";
      if (share >= 0.08) block.textContent = pct(part.count, total);
      tip(block, part.label + ": " + fmt(part.count) + " (" + pct(part.count, total) + ")");
      bar.append(block);
    });
    const legend = el("div", "legend");
    parts.forEach((part, index) => {
      const item = el("span", "legend-item");
      const swatch = el("span", "swatch");
      swatch.style.background = "var(--series-" + (index + 1) + ")";
      item.append(swatch, part.label);
      legend.append(item);
    });
    parent.append(bar, legend,
      table(["Level", "Clubs", "Share"], parts.map((p) => [p.detail || p.label, fmt(p.count), pct(p.count, total)]), [false, true, true]));
  }

  function hbars(parent, rows) {
    const max = Math.max(...rows.map((row) => row.count), 1);
    const list = el("div", "hbars");
    for (const row of rows) {
      const line = el("div", "hbar");
      line.append(Object.assign(el("div", "hbar-label", row.label), { title: row.label }));
      const track = el("div", "hbar-track");
      const fill = el("div", "hbar-fill");
      fill.style.width = "calc((100% - 56px) * " + row.count / max + ")";
      tip(fill, row.tip || row.label + ": " + fmt(row.count));
      track.append(fill, el("span", "hbar-value", fmt(row.count)));
      line.append(track);
      list.append(line);
    }
    parent.append(list);
  }

  function regionTable(clubs, keyOf) {
    const rows = tally(clubs, keyOf).map(([name, count]) => {
      const group = clubs.filter((club) => keyOf(club) === name);
      const burgees = group.filter((club) => club.burgee).length;
      return [name, fmt(count), fmt(burgees), pct(burgees, count)];
    });
    return table(["Name", "Clubs", "With burgee", "Burgee share"], rows, [false, true, true, true]);
  }

  function regionPanel(parent, title, clubs, keyOf, top) {
    const box = panel(parent, title);
    const all = tally(clubs, keyOf);
    hbars(box, all.slice(0, top).map(([label, count]) => {
      const burgees = clubs.filter((club) => keyOf(club) === label && club.burgee).length;
      return { label, count, tip: label + ": " + fmt(count) + " clubs, " + fmt(burgees) + " with a burgee" };
    }));
    const more = el("details");
    more.append(el("summary", "", "All " + fmt(all.length) + " with burgee coverage"), regionTable(clubs, keyOf));
    box.append(more);
  }

  function render(clubs, target) {
    root = target;
    root.replaceChildren();
    const total = clubs.length;
    const count = (test) => clubs.filter(test).length;
    const withBurgee = count((c) => c.burgee);
    const exactYear = count((c) => c.founded.kind === "exact");
    const aboutYear = count((c) => c.founded.kind === "about");
    const point = count((c) => c.precision === "point");
    const town = count((c) => c.precision === "town");
    const countries = tally(clubs, (c) => c.country);
    const usa = clubs.filter((c) => c.country === "USA");
    const usStates = tally(usa, (c) => c.state);

    const tiles = el("div", "tiles");
    [
      [fmt(total), "Clubs", ""],
      [fmt(withBurgee), "With a burgee image", pct(withBurgee, total) + " of clubs"],
      [fmt(point), "Located to a point", pct(point, total) + " of clubs"],
      [fmt(exactYear), "Exact founding year", pct(exactYear, total) + " of clubs"],
      [fmt(countries.length), "Countries", fmt(total - usa.length) + " clubs outside the USA"],
      [fmt(usStates.length), "US states and territories", fmt(usa.length) + " US clubs"],
    ].forEach(([value, label, sub]) => {
      const tile = el("div", "tile");
      tile.append(el("div", "value", value), el("div", "label", label));
      if (sub) tile.append(el("div", "sub", sub));
      tiles.append(tile);
    });
    root.append(tiles);

    const fields = section("Field completeness", "Only a name and a website are required, so other fields can be blank.");
    const fieldRows = [
      ["Name", count((c) => c.name)], ["Website", count((c) => c.website)], ["Country", count((c) => c.country)],
      ["State or region", count((c) => c.state)], ["City", count((c) => c.city)], ["Coordinates", count((c) => c.coordinates)],
      ["Founding date, exact or approximate", count((c) => c.founded.kind !== "unknown")],
      ["Burgee image", withBurgee], ["Burgee description", count((c) => c.description)],
    ];
    panel(fields).append(table(["Field", "Clubs", "Missing", "Complete"],
      fieldRows.map(([name, n]) => [name, fmt(n), fmt(total - n), pct(n, total)]), [false, true, true, true]));

    const precision = section("Location precision", "Based on how coordinates are recorded. A point is not proof of accuracy: some may be a mailing address.");
    const precisionGrid = el("div", "two-col");
    precision.append(precisionGrid);
    segmented(panel(precisionGrid, "Coordinates"), [
      { label: "Point", detail: "Point (3 or more decimals), about 100 m or better", count: point },
      { label: "Town-level", detail: "Town-level (2 decimals), about 1 km", count: town },
      { label: "None", detail: "No coordinates", count: total - point - town },
    ]);
    const fullPlace = count((c) => c.city && c.state && c.country);
    const noCity = count((c) => !c.city && c.state);
    segmented(panel(precisionGrid, "Written address"), [
      { label: "City and state", detail: "City, state or region, and country", count: fullPlace },
      { label: "State only", detail: "State or region, no city", count: noCity },
      { label: "Less", detail: "Country only, or city with no state", count: total - fullPlace - noCity },
    ]);

    const founded = section("Founding dates");
    const foundedGrid = el("div", "two-col");
    founded.append(foundedGrid);
    segmented(panel(foundedGrid, "How exact the date is"), [
      { label: "Exact year", count: exactYear },
      { label: "About", detail: "About a year", count: aboutYear },
      { label: "Unknown", count: total - exactYear - aboutYear },
    ]);
    const dated = clubs.filter((c) => c.founded.year);
    const decadesPanel = panel(foundedGrid, "Clubs founded by decade");
    const firstDecade = Math.floor(Math.min(...dated.map((c) => c.founded.year)) / 10) * 10;
    const lastDecade = Math.floor(Math.max(...dated.map((c) => c.founded.year)) / 10) * 10;
    const decadeRows = [];
    for (let decade = firstDecade; decade <= lastDecade; decade += 10) {
      decadeRows.push([decade, dated.filter((c) => Math.floor(c.founded.year / 10) * 10 === decade).length]);
    }
    const peak = Math.max(...decadeRows.map((row) => row[1]));
    const columns = el("div", "columns");
    for (const [decade, n] of decadeRows) {
      const col = el("div", "col" + (n ? "" : " is-empty"));
      const fill = el("div", "col-fill");
      fill.style.height = (n / peak) * 100 + "%";
      tip(col, decade + "s: " + fmt(n) + (n === 1 ? " club" : " clubs"));
      col.append(fill);
      columns.append(col);
    }
    const axis = el("div", "col-axis");
    axis.append(el("span", "", firstDecade + "s"), el("span", "", lastDecade + "s"));
    const decadeDetails = el("details");
    decadeDetails.append(el("summary", "", "Show as a table"),
      table(["Decade", "Clubs"], decadeRows.filter((row) => row[1]).map(([decade, n]) => [decade + "s", fmt(n)]), [false, true]));
    decadesPanel.append(columns, axis, el("p", "note", "Includes approximate years. Peak: " +
      decadeRows.find((row) => row[1] === peak)[0] + "s, " + fmt(peak) + " clubs."), decadeDetails);

    const oldest = [...dated].sort((a, b) => a.founded.year - b.founded.year || a.name.localeCompare(b.name)).slice(0, 10);
    panel(founded, "Oldest clubs").append(table(["Club", "Location", "Founded"],
      oldest.map((c) => [c.name, [c.city, c.state || c.country].filter(Boolean).join(", "), c.founded.label]), [false, false, true]));
    founded.lastChild.style.marginTop = "16px";

    const where = section("Where the clubs are");
    const whereGrid = el("div", "two-col");
    where.append(whereGrid);
    regionPanel(whereGrid, "Top countries", clubs, (c) => c.country, 10);
    regionPanel(whereGrid, "Top US states", usa, (c) => c.state, 10);

    const burgees = section("Burgees");
    const crest = count((c) => /\bcrest\b/i.test(c.description));
    segmented(panel(burgees), [
      { label: "With image", detail: "Burgee image on file", count: withBurgee },
      { label: "No image", detail: "No burgee found", count: total - withBurgee },
    ]);
    burgees.append(Object.assign(el("p", "note", fmt(crest) + " images are described as crests or include one, rather than being a plain burgee."), { style: "margin-top:12px" }));

    const sites = section("Websites");
    const host = (c) => { try { return new URL(c.website).hostname.replace(/^www\./, ""); } catch { return ""; } };
    const platforms = [["ClubExpress", /clubexpress\.com$/], ["Wild Apricot", /wildapricot\.org$/], ["Wix", /wixsite\.com$/],
      ["Google Sites", /^sites\.google\.com$/], ["Facebook", /facebook\.com$/], ["Own domain or other", /./]];
    const platformOf = (c) => { const name = host(c); return (platforms.find(([, test]) => test.test(name)) || [""])[0]; };
    const https = count((c) => /^https:/i.test(c.website));
    const sitesGrid = el("div", "two-col");
    sites.append(sitesGrid);
    segmented(panel(sitesGrid, "Connection"), [
      { label: "HTTPS", count: https },
      { label: "HTTP", detail: "Plain HTTP", count: total - https },
    ]);
    const hostBox = panel(sitesGrid, "Hosting platform");
    hostBox.append(table(["Platform", "Clubs", "Share"],
      tally(clubs, platformOf).map(([name, n]) => [name, fmt(n), pct(n, total)]), [false, true, true]));
  }

  window.ClubStats = { render };
})();
