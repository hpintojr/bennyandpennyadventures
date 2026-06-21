"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const replacements: Array<[RegExp, string]> = [
  [/Benny\s*&\s*Penny[’']s\s+Adventures/g, "Benny & Penny Adventures"],
  [/Benny\s*&\s*Penny[’']s/g, "Benny & Penny"],
  [/Benny\s+and\s+Penny[’']s\s+Adventures/g, "Benny and Penny Adventures"],
  [/Benny\s+and\s+Penny[’']s/g, "Benny and Penny"]
];

function normalize(value: string) {
  return replacements.reduce((next, [pattern, replacement]) => next.replace(pattern, replacement), value);
}

function normalizeText(root: ParentNode) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const parent = node.parentElement;
    if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "OPTION"].includes(parent.tagName) || parent.isContentEditable) continue;
    nodes.push(node as Text);
  }
  for (const textNode of nodes) {
    const next = normalize(textNode.nodeValue || "");
    if (next !== textNode.nodeValue) textNode.nodeValue = next;
  }

  const elements = root.querySelectorAll<HTMLElement>("[aria-label],[alt],[title],[placeholder]");
  for (const element of elements) {
    for (const attribute of ["aria-label", "alt", "title", "placeholder"]) {
      const value = element.getAttribute(attribute);
      if (!value) continue;
      const next = normalize(value);
      if (next !== value) element.setAttribute(attribute, next);
    }
  }
}

export default function BrandNameNormalizer() {
  const pathname = usePathname();

  useEffect(() => {
    normalizeText(document.body);
    document.title = normalize(document.title);
    const observer = new MutationObserver(() => normalizeText(document.body));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
