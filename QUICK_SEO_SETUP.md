# Quick SEO Setup - Post-Deployment Checklist

## Immediate Actions (Day 1 - After Site Goes Live)

### 1. Verify Files Are Accessible
Open these URLs in your browser:
- ✅ https://freemikvahcal.com/sitemap.xml
- ✅ https://freemikvahcal.com/robots.txt

Both should load without errors.

---

### 2. Set Up Google Search Console (15 minutes)

1. **Go to**: https://search.google.com/search-console
2. **Click**: "Add Property"
3. **Choose**: Domain property
4. **Enter**: `freemikvahcal.com`
5. **Verify ownership** using one of these methods:

   **Easiest: DNS Verification**
   - Copy the TXT record Google provides
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add the TXT record to your DNS settings
   - Wait 5-10 minutes
   - Click "Verify" in Google Search Console

6. **Submit Sitemap**:
   - In Search Console sidebar: Click "Sitemaps"
   - Enter: `sitemap.xml`
   - Click "Submit"

---

### 3. Request Manual Indexing (5 minutes)

Use the URL Inspection Tool (top search bar) to request indexing for these pages:

```
https://freemikvahcal.com/
https://freemikvahcal.com/about
https://freemikvahcal.com/information
```

For each URL:
1. Paste the URL
2. Wait for Google to check it
3. Click "Request Indexing"
4. Wait ~2 minutes between requests

---

## Week 1 Follow-Up

### Check Indexing Status
1. Go to Search Console → Index → Pages
2. See how many pages are indexed
3. Fix any errors shown

### Check if Pages Are Indexed
Search on Google:
```
site:freemikvahcal.com
```

You should see your pages appear in results.

---

## Optional Enhancements

### Add Google Analytics
1. Create account at https://analytics.google.com
2. Get tracking ID
3. Add to your website using Google Analytics 4

### Add Structured Data
Consider adding JSON-LD structured data for:
- Organization info
- WebSite schema
- SoftwareApplication schema

### Monitor Performance
- Check Search Console weekly
- Review "Performance" tab for search queries
- Monitor "Coverage" for indexing issues

---

## Support Resources

- **Full Documentation**: See `SEO_GUIDE.md`
- **Google Search Console**: https://search.google.com/search-console
- **Google Help**: https://support.google.com/webmasters

---

## Expected Timeline

- **Day 1-3**: Google discovers your sitemap
- **Week 1**: First pages indexed (2-4 pages)
- **Week 2-4**: All pages indexed (8 pages)
- **Month 2+**: Start seeing organic search traffic

---

**Questions?** Check the full SEO_GUIDE.md for detailed troubleshooting.
