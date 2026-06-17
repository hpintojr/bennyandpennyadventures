"use client";

import { useEffect } from "react";

const OPEN_CLASS = "bp-admin-toggle-open";
const CLOSE_CLASS = "bp-admin-toggle-close";

function isVisibleButton(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  return (
    rect.width >= 18 &&
    rect.height >= 18 &&
    rect.left > -24 &&
    rect.top > -24 &&
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    Number(style.opacity || "1") > 0
  );
}

function looksLikePayloadToggle(element: HTMLElement) {
  const label = `${element.getAttribute("aria-label") || ""} ${element.getAttribute("title") || ""}`.toLowerCase();
  const text = (element.textContent || "").trim();

  return (
    label.includes("nav") ||
    label.includes("menu") ||
    label.includes("sidebar") ||
    label.includes("collapse") ||
    label.includes("open") ||
    label.includes("close") ||
    element.className.toString().toLowerCase().includes("nav") ||
    element.className.toString().toLowerCase().includes("hamburger") ||
    Boolean(element.querySelector("svg, .hamburger, [class*='hamburger'], [class*='chevron'], [class*='toggler'], [class*='toggle']")) ||
    text === "<" ||
    text === "‹" ||
    text === "≡" ||
    text.length === 0
  );
}

function markAdminNavToggles() {
  const previous = document.querySelectorAll(`.${OPEN_CLASS}, .${CLOSE_CLASS}`);
  previous.forEach((element) => {
    element.classList.remove(OPEN_CLASS, CLOSE_CLASS);
  });

  if (window.innerWidth < 901) return;

  const buttons = Array.from(document.querySelectorAll("button, [role='button']"))
    .filter(isVisibleButton)
    .filter((element) => !element.closest(".bp-admin-nav-extra"))
    .filter((element) => !element.closest(".bp-dashboard"))
    .filter((element) => looksLikePayloadToggle(element));

  const sidebarButtons = buttons
    .filter((element) => Boolean(element.closest(".template-default .nav, .template-default aside")))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left < 96 && rect.top < 190;
    })
    .sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return aRect.top + aRect.left - (bRect.top + bRect.left);
    });

  const collapsedButtons = buttons
    .filter((element) => !element.closest(".template-default .nav, .template-default aside"))
    .filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.left < 96 && rect.top < 190;
    })
    .sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      return aRect.top + aRect.left - (bRect.top + bRect.left);
    });

  sidebarButtons[0]?.classList.add(CLOSE_CLASS);
  collapsedButtons[0]?.classList.add(OPEN_CLASS);
}

export function AdminNavToggleStyler() {
  useEffect(() => {
    const schedule = () => window.requestAnimationFrame(markAdminNavToggles);

    schedule();

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true
    });

    window.addEventListener("resize", schedule);
    window.addEventListener("click", schedule, true);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      window.removeEventListener("click", schedule, true);
    };
  }, []);

  return null;
}

export default AdminNavToggleStyler;
