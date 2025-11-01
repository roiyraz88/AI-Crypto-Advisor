# ⚡ Quick Start: Refresh Token Setup

## 🚨 **CRITICAL: Add This Environment Variable**

Before running the server, you **MUST** add this to your `server/.env`:

```bash
REFRESH_TOKEN_SECRET=generate-a-random-secure-string-here
```

**Generate a secure secret:**

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 🎯 **What's Different Now?**

### Before (Old System):
- ❌ Single token, 7 days expiry
- ❌ User logs out after page refresh
- ❌ Manual token management needed

### After (New System):
- ✅ **Access Token** (15 min) for API requests
- ✅ **Refresh Token** (7 days) for getting new access tokens  
- ✅ **Auto-refresh** when access token expires
- ✅ **Session persists** across page refreshes
- ✅ **Secure** - tokens stored as hashes in DB

---

## 🧪 **Quick Test**

1. **Start your servers**:
   ```bash
   # Terminal 1
   cd server
   npm run dev
   
   # Terminal 2
   cd client  
   npm run dev
   ```

2. **Login** at `http://localhost:5173/login`

3. **Refresh the page** (F5)

4. **Result**: You should still be logged in! 🎉

---

## 📊 **How It Works**

```
User Login
    ↓
Server creates:
├─ Access Token (15 min) → sent as 'token' cookie
└─ Refresh Token (7 days) → sent as 'refreshToken' cookie
    ↓
On API Request:
├─ Access token still valid? → ✅ Return data
└─ Access token expired? → 🔄 Auto-refresh & retry
    ↓
Page Refresh:
├─ Check for refreshToken cookie
├─ Call /me (auto-refreshes if needed)
└─ User stays logged in!
```

---

## 🔍 **Verify It's Working**

### Check in Browser DevTools:

1. **Application → Cookies → localhost**
   - ✅ `token` - 15 min expiry
   - ✅ `refreshToken` - 7 day expiry
   - ✅ Both marked "HttpOnly"

2. **Network Tab → Filter: "XHR"**
   - Make API request
   - If token expired, you'll see:
     1. Original request (401)
     2. Auto `/auth/refresh` call
     3. Original request retry (200)

3. **No Manual Intervention!** All automatic.

---

## ✅ **Migration Complete!**

All files updated, tested, and working. Enjoy your secure authentication! 🚀

