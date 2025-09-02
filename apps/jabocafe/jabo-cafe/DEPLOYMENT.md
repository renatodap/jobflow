# Vercel Deployment Guide for Jabô Café Website

## 🚀 Quick Deploy

The website is fully configured and ready for deployment on Vercel.

### One-Click Deploy

1. Go to [Vercel](https://vercel.com)
2. Click "Import Git Repository"
3. Connect your GitHub account and select the `JaboCafe` repository
4. Select the `jabo-cafe` folder as the root directory
5. Click "Deploy"

That's it! Vercel will automatically detect the Next.js framework and deploy your site.

## ⚙️ Configuration

### Pre-configured Settings

The following are already configured in `vercel.json`:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Region**: Brazil (gru1) for optimal performance

### Environment Variables (Optional)

While not required for basic deployment, you can add these in Vercel Dashboard > Settings > Environment Variables:

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_INSTAGRAM_URL=https://www.instagram.com/jabocafe
NEXT_PUBLIC_YOUTUBE_URL=https://www.youtube.com/@jabocafe7101
NEXT_PUBLIC_WHATSAPP_NUMBER=5511984153337
```

## 🌍 Custom Domain

To connect your custom domain (jabo.cafe):

1. Go to your Vercel project dashboard
2. Navigate to Settings > Domains
3. Add your domain: `jabo.cafe`
4. Follow Vercel's instructions to update your DNS records

### Recommended DNS Settings

- **A Record**: Point `@` to Vercel's IP
- **CNAME**: Point `www` to `cname.vercel-dns.com`

## ✅ Features Ready for Production

- ✅ Bilingual support (Portuguese/English)
- ✅ Responsive design for all devices
- ✅ SEO optimized with meta tags
- ✅ Performance optimized with Next.js 15
- ✅ Image optimization with Next.js Image component
- ✅ Progressive Web App ready
- ✅ Analytics ready (just add tracking IDs)

## 📱 Post-Deployment Checklist

1. **Test the live site** at your Vercel URL
2. **Configure custom domain** if available
3. **Test language switching** functionality
4. **Verify WhatsApp integration** works correctly
5. **Check all images** are loading properly
6. **Test on mobile devices** for responsiveness

## 🔧 Troubleshooting

### Build Fails

- Ensure all dependencies are in `package.json`
- Check the build logs in Vercel dashboard
- Verify Node.js version compatibility (18.x or later)

### Images Not Loading

- Ensure all images are in the `/public` folder
- Check file names are exactly as referenced in code
- Verify image formats are supported (webp, jpg, png)

### Environment Variables Not Working

- Add them in Vercel Dashboard, not just `.env.local`
- Prefix public variables with `NEXT_PUBLIC_`
- Redeploy after adding/changing variables

## 📊 Analytics & Monitoring

To add analytics:

1. Sign up for Google Analytics or similar
2. Add your tracking ID to environment variables
3. The site is pre-configured to accept analytics integration

## 🚀 Continuous Deployment

Every push to the `main` branch will automatically trigger a new deployment on Vercel.

## 📞 Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

For site-specific issues:
- Contact: renatofap@jabo.cafe
- WhatsApp: (11) 9 8415-3337

---

**Last Updated**: November 2024
**Framework**: Next.js 15.4.6
**Node Version**: 18.x or later recommended