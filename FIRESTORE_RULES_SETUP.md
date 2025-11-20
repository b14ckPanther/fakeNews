# Firestore Security Rules Setup

## Problem
If you're seeing "Missing or insufficient permissions" when trying to log in as admin, your Firestore security rules are likely blocking all access.

## Solution

### Step 1: Update Firestore Security Rules

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (`fakenews-c9a3c`)
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the rules from `firestore.rules` file in this repository
5. Click **Publish**

### Step 2: Rules Explained

The security rules allow:

1. **Admin Status Check:**
   - Authenticated users can read their own admin status from `/admins/{userId}`
   - Only admins can read other admin documents

2. **Games Collection:**
   - **Read:** Anyone can read games (needed for players to join by PIN)
   - **Create:** Only admins can create games
   - **Update:** 
     - Admins can update any game data
     - Players can only update their own player data within a game

3. **Default:**
   - All other collections are denied by default

### Alternative: Simpler Rules (Development Only)

For development/testing, you can use these simpler rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admins to check their own admin status
    match /admins/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Only via Admin SDK
    }
    
    // Games - allow reads for joining, writes for admins and players
    match /games/{gameId} {
      allow read: if true; // Anyone can read (for PIN joining)
      allow create: if request.auth != null; // Authenticated users can create
      allow update: if request.auth != null; // Authenticated users can update
    }
    
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**⚠️ Warning:** These simpler rules are less secure and should only be used during development.

### Step 3: Test the Rules

After updating the rules:

1. Try logging in as admin again
2. The error "Missing or insufficient permissions" should be resolved
3. If you still see errors, check the browser console for specific permission errors

### Troubleshooting

**Error: "Missing or insufficient permissions"**
- ✅ Make sure you've updated the Firestore rules
- ✅ Make sure the rules are published (clicked "Publish" button)
- ✅ Verify the admin document exists at `/admins/{userId}` with `isAdmin: true`
- ✅ Check that you're logged in with the correct user

**Error: "Access denied. Admin privileges required."**
- This is expected if the user is not an admin
- Make sure the user exists in the `admins` collection with `isAdmin: true`

**Still having issues?**
1. Check the browser console for detailed error messages
2. Verify the Firestore rules are correctly formatted (no syntax errors)
3. Make sure you're using the correct user UID in the `admins` collection

