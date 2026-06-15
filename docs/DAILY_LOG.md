# Daily Log

## 2026-06-14 — Admin Panel QA and Polish

### Summary

Focused on final QA and visual polish for the Benny & Penny Payload admin panel. The admin panel is now largely functional and visually aligned with the Benny & Penny brand. Main work centered on dashboard layout, sidebar active states, collection page styling, Subscribers display, Media access, Orders detail access, Payload checkbox styling, and notification styling.

### Completed

- Confirmed the dashboard is working and visually close to approved.
- Updated sidebar active-state behavior so Dashboard is no longer always active.
- Added route-aware sidebar highlighting for Dashboard, Orders, Customers, Users, Books, Media, Subscribers, and Privacy Requests.
- Hid leftover native Payload sidebar/current-page labels so the custom Adventure Hub nav is the only visible sidebar state.
- Re-centered the sidebar branding block so the heart and Benny & Penny's Admin Panel title align with the rest of the sidebar.
- Split Customers and Users behavior:
  - Customers opens Users filtered by role = customer.
  - Users opens the full Users collection.
- Renamed the Users collection from Settings to Users.
- Fixed Media link 404 by exposing the hidden downloads collection as Media.
- Identified and resolved the Orders detail blank-page issue by diagnosing a Neon/Payload locked documents schema mismatch.
- Added Payload locked-document SQL repair documentation.
- Added a custom boolean cell component so Subscriber Marketing Opt In displays Yes/No instead of raw true/false.
- Softened Yes/No styling to match regular collection table typography.
- Tracked down Payload row checkbox styling regressions caused by broad select/button CSS selectors.
- Removed broad `[class*='select']` styling because Payload row checkboxes use select-row classes.
- Removed `opacity: revert !important` from row checkbox reset after it was identified as the cause of mismatched checkbox appearance.
- Added global dark Payload notification/toast overrides because the logout notification appears to render outside the login template.

### Key commits

```txt
604f098cd99516b1039c593a657cc6b199b38469 — Expose downloads collection as Media
36e0c62f4201043d9aca7fe643b3b54caa89d71f — Add Payload locked documents schema patch
dfc0fe6d2a1cce4246afb507e9debd02d70d6206 — Filter Customers link by role
19f5a5bf7d534866ba7c8604b5764e9e0588c90e — Rename Users collection labels
16d6858781f23f9d282e6e0af35ebe73cbca3f34 — Add active-aware sidebar link component
855b3c87ba93f4598f10633939a83c810a1d00d6 — Avoid search params suspense in admin sidebar links
cce326977e3e8160b2b7647cec7b98fb819b413b — Center sidebar branding with nav elements
3322b03d96706cefebe496cd4c6285f9beb72bc3 — Add yes no boolean admin cell
1b46d385dc7cf5b0651197174293bb8c296bf08d — Improve subscriber boolean cell display
e31ef395704fda8b80ad280bee49d9691b97e6a8 — Register boolean admin cell component
9ccd21c93b949f831d0db20c924688945b2ecf1e — Narrow admin control styling to avoid row checkboxes
37cc96c986f113b288407bc5c8e808319bad9a99 — Remove opacity reset from row checkbox controls
3bc4fc46108a71c9e90d742f56045ecfb8c4c88f — Apply global dark Payload notification style
```

### Verification checklist

- [ ] Dashboard still highlights only on `/admin`.
- [ ] Orders highlights on list and detail pages.
- [ ] Customers highlights only on the filtered customer URL.
- [ ] Users highlights on the unfiltered users URL.
- [ ] Books, Media, Subscribers, and Privacy Requests highlight correctly.
- [ ] Subscriber Marketing Opt In shows Yes/No with normal table font weight.
- [ ] Row checkboxes match the Select All checkbox.
- [ ] Logout notification uses dark teal background with white text.
- [ ] Media page loads at `/admin/collections/downloads`.
- [ ] Orders detail pages open after the Neon locked-documents SQL patch.

### Notes

The admin CSS is currently layered across several rapid-fix stylesheets. Once QA is fully approved, consolidate the admin CSS into fewer files to reduce future regressions.
