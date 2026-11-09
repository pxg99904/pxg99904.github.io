const accordionQuery = window.matchMedia("(max-width: 767px)");

document.querySelectorAll("[data-tabs]").forEach((root, rootIndex) => {
    const triggers = [...root.querySelectorAll(".tabs__trigger")];
    const panels = [...root.querySelectorAll(".tabs__panel")];
    const headings = [...root.querySelectorAll(".tabs__heading")];

    function indexFromHash() {
        const targetId = decodeURIComponent(location.hash.slice(1));
        const target = document.getElementById(targetId);
        return headings.findIndex((heading, i) =>
            heading.id === targetId || (target && panels[i].contains(target)),
        );
    }

    let active = Math.max(indexFromHash(), 0);
    let collapsed = false;

    const list = document.createElement("div");
    list.className = "tabs__list";
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", root.dataset.tabsLabel || "Sections");

    const tabs = triggers.map((trigger, i) => {
        const baseId = `tabs-${rootIndex}-${i}`;
        const tab = document.createElement("button");
        tab.className = "tabs__tab";
        tab.type = "button";
        tab.id = `${baseId}-tab`;
        tab.textContent = trigger.textContent.trim();
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", `${baseId}-panel`);
        tab.addEventListener("click", () => {
            select(i);
            updateUrl(hashFor(i));
        });

        trigger.id = `${baseId}-trigger`;
        trigger.setAttribute("aria-controls", `${baseId}-panel`);
        trigger.addEventListener("click", () => toggle(i));

        panels[i].id = `${baseId}-panel`;
        list.append(tab);
        return tab;
    });

    function select(i) {
        active = i;
        collapsed = false;
        render();
    }

    function toggle(i) {
        if (i === active) {
            collapsed = !collapsed;
            render();
            updateUrl(collapsed ? "" : hashFor(i), { replace: true });
            return;
        }
        const closing = panels[active];
        select(i);
        updateUrl(hashFor(i));
        revealAfter(closing, i);
    }

    function hashFor(i) {
        return `#${headings[i].id}`;
    }

    function updateUrl(hash, { replace = false } = {}) {
        if (hash === location.hash) return;
        const url = hash || location.pathname + location.search;
        history[replace ? "replaceState" : "pushState"](null, "", url);
    }

    function revealAfter(closing, i) {
        const animations = closing.getAnimations();
        Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
            if (active !== i || collapsed) return;
            const hashTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            const target = hashTarget && panels[i].contains(hashTarget)
                ? hashTarget
                : accordionQuery.matches ? triggers[i] : list;
            const { top, bottom } = target.getBoundingClientRect();
            if (top >= 0 && bottom <= window.innerHeight) return;
            target.scrollIntoView({
                block: "start",
                behavior: animations.length ? "smooth" : "auto",
            });
        });
    }

    function render() {
        const isAccordion = accordionQuery.matches;

        panels.forEach((panel, i) => {
            const selected = i === active;
            panel.hidden = !selected || (isAccordion && collapsed);
            panel.inert = panel.hidden;
            panel.setAttribute("role", isAccordion ? "region" : "tabpanel");
            panel.setAttribute(
                "aria-labelledby",
                isAccordion ? triggers[i].id : tabs[i].id,
            );
            if (isAccordion) panel.removeAttribute("tabindex");
            else panel.tabIndex = 0;

            tabs[i].setAttribute("aria-selected", String(selected));
            tabs[i].tabIndex = selected ? 0 : -1;
            triggers[i].setAttribute(
                "aria-expanded",
                String(selected && !collapsed),
            );
        });
    }

    list.addEventListener("keydown", (event) => {
        const last = tabs.length - 1;
        const next = {
            ArrowRight: active === last ? 0 : active + 1,
            ArrowLeft: active === 0 ? last : active - 1,
            Home: 0,
            End: last,
        }[event.key];
        if (next === undefined) return;

        event.preventDefault();
        select(next);
        updateUrl(hashFor(next), { replace: true });
        tabs[next].focus();
    });

    accordionQuery.addEventListener("change", render);

    window.addEventListener("hashchange", () => {
        const i = indexFromHash();
        if (i < 0 && location.hash) return;
        const closing = panels[active];
        select(Math.max(i, 0));
        if (i >= 0) revealAfter(closing, i);
    });

    root.prepend(list);
    root.classList.add("is-ready");

    const linked = indexFromHash();
    select(Math.max(linked, 0));
    if (linked >= 0) revealAfter(panels[linked], linked);
});
