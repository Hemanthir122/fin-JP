# Ad Integration Summary

## Complete Ad Setup for JobConnects Platform

### Ad Types Integrated

#### 1. Native Ads (Primary Revenue)
**Desktop:**
- Placement: After every 3 job cards in grid
- Component: `NativeAdCard.jsx`
- Styling: Matches job card design with "Sponsored" label
- Visibility: Desktop only (>768px)

**Mobile:**
- Placement: After every 2 walkin cards (walkins section only)
- Component: `MobileNativeAd.jsx`
- Styling: Compact card design with "Sponsored" label
- Visibility: Mobile only (≤768px)

#### 2. Sticky Sidebar Banner (160x300)
- Placement: Right sidebar on job listing pages
- Component: `StickyBanner.jsx`
- Behavior: Sticky while scrolling
- Visibility: Desktop only (>1200px)

#### 3. Smartlink (Walk-in Section Only)
- Trigger: When user clicks to reveal contact info (email/phone/URL)
- URL: `https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085`
- Behavior: Opens in new tab, then reveals content after 500ms
- Visibility: All devices (mobile + desktop)
- Location: Only in WalkinCard component

#### 4. Popunder
- Trigger: Once per session on first page visit
- Component: `Popunder.jsx`
- Storage: Uses sessionStorage to prevent multiple triggers
- Visibility: All devices

#### 5. Social Bar
- Placement: Global across entire site
- Component: `SocialBar.jsx`
- Behavior: Renders automatically (bottom/side)
- Visibility: All devices

---

## File Structure

```
fin-JP/client/src/components/ads/
├── NativeAdCard.jsx          # Desktop native ads (every 3 cards)
├── NativeAdCard.css
├── MobileNativeAd.jsx        # Mobile native ads (every 2 walkin cards)
├── MobileNativeAd.css
├── StickyBanner.jsx          # Desktop sidebar banner
├── StickyBanner.css
├── SocialBar.jsx             # Global social bar
└── Popunder.jsx              # Session-based popunder
```

---

## Integration Points

### Pages with Ads:
1. **Home.jsx** - Native ads (desktop), Sticky banner, Social bar, Popunder
2. **Jobs.jsx** - Native ads (desktop + mobile for walkins), Sticky banner, Social bar, Popunder

### Components with Ads:
1. **WalkinCard.jsx** - Smartlink on contact reveal

---

## Ad Placement Logic

### Desktop (>768px):
```
Job 1  Job 2  Job 3  [Native Ad]
Job 4  Job 5  Job 6  [Native Ad]
Job 7  Job 8  Job 9  [Native Ad]
```
+ Sticky banner on right sidebar

### Mobile (≤768px) - Walkins Only:
```
Walkin 1
Walkin 2
[Mobile Native Ad]
Walkin 3
Walkin 4
[Mobile Native Ad]
```

---

## Revenue Optimization Features

✅ **Desktop-first strategy** - More ads on desktop where CPM is higher
✅ **Native ad integration** - Blends seamlessly with content
✅ **Strategic placement** - After every 3 cards (desktop) / 2 cards (mobile walkins)
✅ **Sticky sidebar** - Always visible while scrolling
✅ **Smartlink monetization** - Monetizes contact reveals in walkins
✅ **Session-based popunder** - Non-intrusive, once per session
✅ **Global social bar** - Persistent across all pages

---

## UX Considerations

✅ **Clean UI maintained** - Ads styled to match platform design
✅ **No spam behavior** - Popunder limited to once per session
✅ **Performance optimized** - Lazy loading, proper cleanup
✅ **Mobile-friendly** - Separate mobile ad strategy
✅ **Non-intrusive** - Ads don't block content or navigation
✅ **Clear labeling** - All ads marked as "Sponsored" or "Ad"

---

## Testing Checklist

- [ ] Desktop: Native ads appear after every 3 job cards
- [ ] Desktop: Sticky banner visible on right sidebar
- [ ] Mobile: Native ads appear after every 2 walkin cards (walkins section only)
- [ ] Mobile: No ads in regular jobs/internships section
- [ ] Walkins: Smartlink opens when clicking reveal contact
- [ ] Walkins: Contact info reveals after smartlink
- [ ] Popunder: Triggers only once per session
- [ ] Social bar: Visible across all pages
- [ ] Responsive: Layout adapts properly on all screen sizes
- [ ] Performance: No duplicate script loading

---

## Ad Scripts Reference

**Native Ads:**
```html
<script async="async" data-cfasync="false" src="https://breachuptown.com/f14d7f03dec7b319fea3f8af2bc57eb6/invoke.js"></script>
<div id="container-f14d7f03dec7b319fea3f8af2bc57eb6"></div>
```

**Social Bar:**
```html
<script src="https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js"></script>
```

**Smartlink:**
```
https://breachuptown.com/jnv7mma2?key=d47de908fdd389381c8131eaa2a36085
```

**Popunder:**
```html
<script src="https://breachuptown.com/31/2d/00/312d000878fa23ff92459a4fb1eac311.js"></script>
```

**160x300 Banner:**
```javascript
atOptions = {
  'key': 'f8c22b2c177bf4ce773ab0085a6c25e9',
  'format': 'iframe',
  'height': 300,
  'width': 160,
  'params': {}
};
```

---

## Notes

- All ad components include proper cleanup in useEffect
- Script loading is prevented from duplicating
- Mobile ads only show in walkins section as requested
- Desktop maintains 3-card pattern for all job types
- Smartlink only triggers in walkin contact reveals
- Session storage ensures popunder shows once only
