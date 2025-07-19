# 🔗 **API AUTOMATION SETUP WALKTHROUGH**

## 🎯 **Setup Overview**
**Total Time**: 30-45 minutes  
**Result**: Automated posting to Pinterest, Instagram, LinkedIn  
**One-time setup**: Never need to configure again  

---

## 📌 **STEP 1: PINTEREST API SETUP (10-15 minutes)**

### **A. Create Pinterest Developer Account**
1. **Go to**: https://developers.pinterest.com/
2. **Sign in** with your Pinterest account
3. **Click "Create app"** (top right)
4. **Fill out app details**:
   - **App name**: `Chudi's Healing Content Studio`
   - **Description**: `Automated content posting for trauma healing and professional development resources`
   - **Website URL**: `https://chudinnorukam.github.io/healing-studio-portfolio/`
   - **Select "I'm not a business"** (unless you have a business account)

### **B. Get Your Pinterest Credentials**
5. **After app creation**, you'll see:
   - **App ID**: Copy this (looks like: `1234567`)
   - **App Secret**: Copy this (looks like: `abc123def456...`)

6. **Generate Access Token**:
   - **Click "Generate token"** in your app dashboard
   - **Select scopes**: `pins:read`, `pins:write`, `boards:read`
   - **Copy the access token** (looks like: `pina_ABC123...`)

### **C. Find Your Board ID**
7. **Go to your Pinterest profile**
8. **Find your trauma healing board** (or create one)
9. **Click on the board**
10. **Copy the board ID from URL**: 
    - URL: `pinterest.com/username/board-name/`
    - Board ID: `board-name` (the part after the last slash)

### **D. Update Configuration**
```json
"pinterest": {
  "app_id": "YOUR_APP_ID_HERE",
  "app_secret": "YOUR_APP_SECRET_HERE", 
  "access_token": "YOUR_ACCESS_TOKEN_HERE",
  "board_id": "YOUR_BOARD_ID_HERE",
  "enabled": true
}
```

---

## 📱 **STEP 2: INSTAGRAM API SETUP (15-20 minutes)**

### **A. Convert to Business Account**
1. **Open Instagram app**
2. **Go to Settings → Account → Switch to professional account**
3. **Choose "Business"**
4. **Connect to Facebook Page** (create one if needed)

### **B. Create Facebook Developer App**
5. **Go to**: https://developers.facebook.com/
6. **Click "Create App"**
7. **Choose "Consumer"** as app type
8. **Fill out details**:
   - **App name**: `Chudi Content Automation`
   - **Contact email**: Your email
   - **Purpose**: `Personal project for social media automation`

### **C. Add Instagram Product**
9. **In your app dashboard**:
   - **Click "+ Add product"**
   - **Select "Instagram Basic Display"**
   - **Click "Set up"**

10. **Configure Instagram Basic Display**:
    - **Valid OAuth redirect URIs**: `https://localhost:3000/auth/callback`
    - **Deauthorize callback URL**: `https://localhost:3000/auth/deauthorize`
    - **Data deletion request URL**: `https://localhost:3000/auth/delete`

### **D. Get Instagram Credentials**
11. **Instagram App ID**: Copy from Basic Display settings
12. **Instagram App Secret**: Copy from Basic Display settings
13. **Generate Access Token**:
    - **Follow Instagram's token generation flow**
    - **Grant permissions**: `instagram_basic`, `instagram_content_publish`

### **E. Get Account IDs**
14. **Business Account ID**: 
    - Use Graph API Explorer: `https://developers.facebook.com/tools/explorer/`
    - Query: `me/accounts` to get your Facebook Page ID
    - Query: `{page-id}?fields=instagram_business_account` to get Instagram Business Account ID

### **F. Update Configuration**
```json
"instagram": {
  "access_token": "YOUR_INSTAGRAM_ACCESS_TOKEN",
  "instagram_business_account_id": "YOUR_IG_BUSINESS_ID",
  "facebook_page_id": "YOUR_FACEBOOK_PAGE_ID",
  "enabled": true
}
```

---

## 💼 **STEP 3: LINKEDIN API SETUP (10-15 minutes)**

### **A. Create LinkedIn Developer App**
1. **Go to**: https://www.linkedin.com/developers/
2. **Click "Create app"**
3. **Fill out application**:
   - **App name**: `Chudi Content Poster`
   - **LinkedIn Page**: Your personal LinkedIn profile
   - **Privacy policy URL**: `https://chudinnorukam.github.io/healing-studio-portfolio/privacy.html`
   - **App logo**: Upload a simple logo or use default

### **B. Configure OAuth Settings**
4. **In "Auth" tab**:
   - **Authorized redirect URLs**: `http://localhost:3000/auth/linkedin/callback`
   - **Select OAuth 2.0 scopes**: `w_member_social`, `r_liteprofile`

### **C. Get LinkedIn Credentials**
5. **Client ID**: Copy from Auth tab
6. **Client Secret**: Copy from Auth tab (click "Show")

### **D. Generate Access Token**
7. **Request access to "Share on LinkedIn" product**
8. **Once approved**, use OAuth flow to get access token
9. **Alternative**: Use LinkedIn's OAuth 2.0 tools to generate token manually

### **E. Get Person ID**
10. **Use LinkedIn API**:
    - **Endpoint**: `https://api.linkedin.com/v2/people/(id~)`
    - **With your access token**, call this endpoint
    - **Copy the person ID** from response

### **F. Update Configuration**
```json
"linkedin": {
  "client_id": "YOUR_LINKEDIN_CLIENT_ID",
  "client_secret": "YOUR_LINKEDIN_CLIENT_SECRET",
  "access_token": "YOUR_LINKEDIN_ACCESS_TOKEN",
  "person_id": "YOUR_LINKEDIN_PERSON_ID",
  "enabled": true
}
```

---

## 🔧 **STEP 4: TESTING & ACTIVATION**

### **A. Update Configuration File**
1. **Open**: `configuration/social-media/api-config.json`
2. **Replace all placeholders** with your actual credentials
3. **Set `"enabled": true`** for each platform
4. **Save the file**

### **B. Test Connections**
```bash
# Test all API connections
node automation/social-media-poster.js --test
```

**Expected output**:
```
✅ Pinterest API: Connected
✅ Instagram API: Connected  
✅ LinkedIn API: Connected
```

### **C. Post Day 1 Carousel**
```bash
# Automatically post to all platforms
node automation/social-media-poster.js --post-day1
```

**Expected output**:
```
🚀 POSTING DAY 1 CAROUSEL TO ALL PLATFORMS
📌 Posting to Pinterest... ✅
📱 Posting to Instagram... ✅  
💼 Posting to LinkedIn... ✅
🎉 POSTING COMPLETE! ✅ Successful: 3/3
```

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Pinterest Issues:**
- **"Invalid app_id"**: Double-check App ID matches exactly
- **"Access token expired"**: Generate new access token
- **"Board not found"**: Verify board ID is correct format

### **Instagram Issues:**
- **"Not business account"**: Ensure Instagram is converted to business
- **"Invalid access token"**: Check token permissions include publishing
- **"Account ID mismatch"**: Verify Business Account ID is correct

### **LinkedIn Issues:**
- **"Insufficient permissions"**: Request "Share on LinkedIn" product access
- **"Person ID not found"**: Use correct API endpoint to get person ID
- **"OAuth error"**: Check redirect URLs match exactly

---

## 📞 **ALTERNATIVE: QUICK SETUP ASSISTANCE**

If any step is confusing, I can help you:

1. **Screen share guidance**: Walk through each platform together
2. **Generate specific API calls**: Create exact requests for your tokens
3. **Debug connection issues**: Troubleshoot any API problems
4. **Test posting**: Verify everything works before Day 1

---

## ✅ **COMPLETION CHECKLIST**

### **Pinterest Setup**:
- [ ] Developer account created
- [ ] App created with correct details
- [ ] App ID, App Secret, Access Token copied
- [ ] Board ID identified
- [ ] Configuration updated

### **Instagram Setup**:
- [ ] Business account converted
- [ ] Facebook app created
- [ ] Instagram Basic Display added
- [ ] Access token generated
- [ ] Account IDs retrieved
- [ ] Configuration updated

### **LinkedIn Setup**:
- [ ] Developer app created
- [ ] OAuth settings configured
- [ ] Client credentials copied
- [ ] Access token generated
- [ ] Person ID retrieved
- [ ] Configuration updated

### **Testing**:
- [ ] API connections tested
- [ ] Day 1 test post successful
- [ ] All platforms responding correctly

---

## 🎯 **READY TO START?**

**Next step**: Let's begin with Pinterest (easiest setup). 

**Would you like me to:**
1. **Walk you through Pinterest setup first** (10 minutes)
2. **Generate specific API test calls** for your tokens
3. **Help troubleshoot any issues** you encounter
4. **Start with manual posting** while we set up APIs

**Choose your preference and let's get your automation system running!** 🚀 