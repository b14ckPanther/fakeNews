# Admin Setup Instructions

To set up admin authentication for the Fake News Seminar Game, you need to create an admin user in Firebase.

## Steps to Create an Admin User

1. **Enable Email/Password Authentication in Firebase:**
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable "Email/Password" provider

2. **Create an Admin User:**
   - Go to Authentication → Users
   - Click "Add user"
   - Enter an email and password
   - Copy the User UID

3. **Add Admin Role in Firestore:**
   - Go to Firestore Database
   - Create a collection called `admins`
   - Create a document with the User UID as the document ID
   - Add a field: `isAdmin` = `true` (boolean)

   Example document structure:
   ```
   Collection: admins
   Document ID: [User UID]
   Fields:
     - isAdmin: true (boolean)
   ```

4. **Test Login:**
   - Go to `/admin/login`
   - Enter the email and password you created
   - You should be redirected to `/admin/dashboard`

## Creating Admin Users Programmatically (Optional)

You can also create admin users using the Firebase Admin SDK in a server-side script:

```javascript
const admin = require('firebase-admin');
const firebase = require('firebase');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Create user
const userRecord = await admin.auth().createUser({
  email: 'admin@example.com',
  password: 'secure-password',
});

// Add admin role
await admin.firestore().collection('admins').doc(userRecord.uid).set({
  isAdmin: true,
});
```

## Security Notes

- Only users with `isAdmin: true` in the `admins` collection can access admin routes
- The admin login uses Firebase Authentication with email/password
- All admin routes are protected and will redirect to `/admin/login` if not authenticated
- Make sure to use strong passwords for admin accounts

