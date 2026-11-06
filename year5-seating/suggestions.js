/* PAK21 seating suggestions for the existing Seating Studio.
   All positions are percentages of the classroom; one desk seats one pupil. */
(() => {
  'use strict';
  const W = 7.15, H = W * 1.25;
  const dialog = $('suggestionsDialog'), gallery = $('suggestionGallery');
  const seat = (x, y, group) => ({ x: +x.toFixed(2), y: +y.toFixed(2), s: W, group });
  function block(out, number, cx, cy, columns, group) {
    const rows = Math.ceil(number / columns), stepX = W + .95, stepY = H + 1.25;
    const width = columns * W + (columns - 1) * .95;
    const height = rows * H + (rows - 1) * 1.25;
    for (let i = 0; i < number; i++) {
      const countInRow = Math.min(columns, number - Math.floor(i / columns) * columns);
      const col = i % columns, row = Math.floor(i / columns);
      const rowWidth = countInRow * W + (countInRow - 1) * .95;
      out.push(seat(cx - width / 2 + (width - rowWidth) / 2 + col * stepX,
                    cy - height / 2 + row * stepY, group));
    }
  }
  function blocks(sizes, centers, columns) {
    const out = [];
    sizes.forEach((count, i) => block(out, count, centers[i][0], centers[i][1], count === 4 ? 2 : columns, i));
    return out;
  }
  function horseshoe() {
    const out = [];
    [18, 28, 38, 48, 58, 68, 78].forEach(y => out.push(seat(9, y, 0)));
    [20, 30, 40, 50, 60, 70, 80].forEach(x => out.push(seat(x, 84, 1)));
    [78, 68, 58, 48, 38, 28, 18].forEach(y => out.push(seat(88, y, 2)));
    block(out, 8, 50, 51, 4, 3);
    return out;
  }
  function doubleU() {
    const out = [];
    [17, 29, 41, 53, 65, 77].forEach(y => out.push(seat(8, y, 0)));
    [23, 35, 47, 59, 71, 83].forEach(x => out.push(seat(x, 86, 1)));
    [77, 67, 57, 47, 37, 27, 17].forEach(y => out.push(seat(88, y, 2)));
    [28, 40, 52, 64].forEach(y => out.push(seat(29, y, 3)));
    [42, 55, 68].forEach(x => out.push(seat(x, 71, 4)));
    [52, 40, 28].forEach(y => out.push(seat(72, y, 5)));
    return out;
  }
  function fishbowl() {
    const out = [];
    for (let i = 0; i < 21; i++) {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 21;
      out.push(seat(50 + 44 * Math.cos(a) - W / 2,
                    56 + 35 * Math.sin(a) - H / 2, Math.floor(i / 4)));
    }
    block(out, 8, 50, 55, 4, 6);
    return out;
  }
  function debate() {
    const out = [];
    [[8, 18, 28], [64, 74, 84]].forEach((columns, side) => {
      for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) {
        if (side === 1 && row === 4 && col === 2) continue;
        out.push(seat(columns[col], 17 + 16 * row, side * 3 + col));
      }
    });
    return out;
  }
  function pairs() {
    const out = [];
    const xs = [[8, 16], [40, 48], [72, 80]];
    for (let row = 0; row < 5; row++) for (let col = 0; col < 3; col++) {
      xs[col].forEach((x, index) => {
        if (row === 4 && col === 2 && index === 1) return;
        out.push(seat(x, 19 + row * 15, row * 3 + col));
      });
    }
    return out;
  }
  function arcs() {
    const out = [];
    [[7, 24, 77, 23], [9, 12, 84, 49], [13, 2, 90, 79]].forEach((line, group) => {
      const [count, start, end, y] = line;
      for (let i = 0; i < count; i++) {
        const fraction = count === 1 ? .5 : i / (count - 1);
        out.push(seat(start + (end - start) * fraction, y + 5 * Math.pow(2 * fraction - 1, 2), group));
      }
    });
    return out;
  }
  const options = [
    { name: 'Seven Balanced Pods', type: '7 cooperative groups', detail: 'One boy in each team, with 3–4 girls per team.', build: () => blocks([5,4,4,4,4,4,4], [[18,28],[50,28],[82,28],[24,53],[75,53],[24,78],[75,78]], 3) },
    { name: 'Six Collaboration Islands', type: '6 learning teams', detail: 'Teams of 4–5 for cooperative discussion.', build: () => blocks([5,5,5,5,5,4], [[19,36],[50,36],[81,36],[19,75],[50,75],[81,75]], 3) },
    { name: 'Five Jigsaw Teams', type: '5 expert groups', detail: 'Larger working teams for jigsaw and peer teaching.', build: () => blocks([6,6,6,6,5], [[18,34],[50,34],[82,34],[32,75],[68,75]], 3) },
    { name: 'Four Project Zones', type: '4 activity zones', detail: 'Spacious stations for hands-on collaborative projects.', build: () => blocks([8,7,7,7], [[26,34],[74,34],[26,73],[74,73]], 4) },
    { name: 'Horseshoe & Inner Hub', type: 'Discussion plus group work', detail: 'Open sightlines around a central collaboration team.', build: horseshoe },
    { name: 'Double Horseshoe', type: 'Whole-class dialogue', detail: 'Two nested U-shapes for discussion and presentations.', build: doubleU },
    { name: 'Fishbowl Discussion', type: 'Inner and outer circles', detail: 'Inner speakers and outer observers can swap roles.', build: fishbowl },
    { name: 'Debate Face-Off', type: 'Two discussion sides', detail: 'Opposing sides with a broad central presentation aisle.', build: debate },
    { name: 'Learning Pairs & Aisles', type: 'Pairs and peer tutoring', detail: 'Partner work with clear teacher circulation paths.', build: pairs },
    { name: 'Presentation Arcs', type: 'Whole-class showcase', detail: 'Curved tiers face the board for sharing and feedback.', build: arcs }
  ];
  const shuffleCopy = arr => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  function genderOf(name) {
    if (/\bBINTI\b/i.test(name)) return 'G';
    if (/\bBIN\b/i.test(name)) return 'B';
    return 'P';
  }
  function rosterProfile() {
    const pupils = cls().names;
    return {
      total: pupils.length,
      boys: pupils.filter(n => genderOf(n) === 'B').length,
      girls: pupils.filter(n => genderOf(n) === 'G').length,
      unknown: pupils.filter(n => genderOf(n) === 'P').length
    };
  }
  function prepareSeats(option) {
    const profile = rosterProfile();
    const all = option.build();
    // Keep each group represented if a class has fewer than 29 pupils.
    while (all.length > profile.total) {
      const sizes = new Map();
      all.forEach(t => sizes.set(t.group, (sizes.get(t.group) || 0) + 1));
      const largest = Math.max(...sizes.values());
      const target = [...sizes.entries()].find(([, size]) => size === largest)[0];
      all.splice(all.findLastIndex(t => t.group === target), 1);
    }
    const groups = [...new Set(all.map(t => t.group))];
    const selected = new Set();
    const distribute = (count, marker) => {
      for (let i = 0; i < count; i++) {
        if (!groups.length) break;
        const index = i < groups.length
          ? Math.floor((i + .5) * groups.length / Math.min(count, groups.length))
          : (i - groups.length) % groups.length;
        // If a small group is full, place the next pupil in another available group.
        for (let offset = 0; offset < groups.length; offset++) {
          const target = groups[(index + offset) % groups.length];
          const candidates = all.filter((t, n) => t.group === target && !selected.has(n));
          if (!candidates.length) continue;
          const t = candidates[Math.floor((candidates.length - 1) / 2)];
          const n = all.indexOf(t);
          selected.add(n);
          t.preferredGender = marker;
          break;
        }
      }
    };
    distribute(profile.boys, 'B');
    // Fill every other seat with girls, leaving any unspecified pupils unclassified.
    let girlsLeft = profile.girls;
    all.forEach(t => {
      if (!t.preferredGender) {
        t.preferredGender = girlsLeft > 0 ? 'G' : 'P';
        if (girlsLeft > 0) girlsLeft--;
      }
    });
    return all;
  }
  function assignNames(tables) {
    const pool = {
      B: shuffleCopy(cls().names.filter(n => genderOf(n) === 'B')),
      G: shuffleCopy(cls().names.filter(n => genderOf(n) === 'G')),
      P: shuffleCopy(cls().names.filter(n => genderOf(n) === 'P'))
    };
    tables.forEach(t => { t.name = pool[t.preferredGender]?.pop() || null; });
    // Safe fallback for partially unclassified or edited rosters.
    const remaining = shuffleCopy(Object.values(pool).flat());
    tables.filter(t => !t.name).forEach(t => { t.name = remaining.pop() || null; });
  }
  function buildPreview(option, index) {
    const article = document.createElement('article');
    article.className = 'suggestion';
    const preview = document.createElement('div');
    preview.className = 'suggestion-preview';
    preview.setAttribute('aria-hidden', 'true');
    const board = document.createElement('div');
    board.className = 'suggestion-board';
    preview.append(board);
    prepareSeats(option).forEach(t => {
      const el = document.createElement('span');
      el.className = 'suggestion-seat gender-' + t.preferredGender;
      el.textContent = t.preferredGender === 'P' ? '·' : t.preferredGender;
      Object.assign(el.style, {
        left: t.x + '%', top: t.y + '%', width: t.s + '%',
        height: (t.s * 1.25) + '%'
      });
      preview.append(el);
    });
    const title = document.createElement('h3');
    title.textContent = (index + 1) + '. ' + option.name;
    const type = document.createElement('strong');
    type.className = 'suggestion-type';
    type.textContent = option.type;
    const detail = document.createElement('p');
    detail.textContent = option.detail;
    const apply = document.createElement('button');
    apply.type = 'button';
    apply.className = 'primary suggestion-apply';
    apply.textContent = 'Use this arrangement';
    apply.onclick = () => useSuggestion(option);
    article.append(preview, title, type, detail, apply);
    return article;
  }
  function useSuggestion(option) {
    if (cls().names.length > 29) return toast('These arrangements currently support up to 29 pupils.');
    const tables = prepareSeats(option).map(t => ({ ...t, id: uid(), name: null }));
    if ($('suggestAutoNames').checked) assignNames(tables);
    const baseName = 'PAK21 - ' + option.name;
    let name = baseName, n = 2;
    while (cls().layouts.some(l => l.name === name)) name = baseName + ' (' + n++ + ')';
    cls().layouts.push({ name, tables });
    cls().active = cls().layouts.length - 1;
    selected = null;
    save();
    render();
    dialog.close();
    toast('Saved ' + name + ' with ' + tables.length + ' desks.');
  }
  function openSuggestions() {
    if (cls().names.length > 29 || !cls().names.length) {
      return toast('Suggested arrangements currently need between 1 and 29 pupils.');
    }
    const p = rosterProfile();
    const summary = p.total + ' pupils · ' + p.boys + ' boys · ' + p.girls + ' girls';
    $('suggestionSummary').textContent = summary + (p.unknown ? ' · ' + p.unknown + ' not identified' : '');
    gallery.replaceChildren(...options.map(buildPreview));
    dialog.showModal();
  }
  $('suggestions').onclick = openSuggestions;
  $('closeSuggestions').onclick = () => dialog.close();

  // Keep the suggested gender balance when the teacher randomises this plan.
  const originalRandomise = $('shuffle').onclick;
  $('shuffle').onclick = () => {
    const tables = plan().tables;
    if (!tables.length || !tables.every(t => t.preferredGender)) return originalRandomise();
    const lockedNames = new Set(tables.filter(t => t.locked && t.name).map(t => t.name));
    const availableSeats = tables.filter(t => !t.locked);
    const remaining = cls().names.filter(n => !lockedNames.has(n));
    const desired = ['B', 'G', 'P'];
    if (remaining.length > availableSeats.length ||
        desired.some(g => remaining.filter(n => genderOf(n) === g).length !==
          availableSeats.filter(t => t.preferredGender === g).length)) {
      return toast('The locked seats or roster no longer match the suggested balance. Unlock or correct those seats first.');
    }
    const pools = Object.fromEntries(desired.map(g => [g,
      shuffleCopy(remaining.filter(n => genderOf(n) === g))]));
    availableSeats.forEach(t => { t.name = pools[t.preferredGender].pop() || null; });
    save();
    render();
    toast('Names randomised with the group balance preserved.');
  };
})();
