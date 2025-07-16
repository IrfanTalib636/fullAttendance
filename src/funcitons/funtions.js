const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "attendanceapp-78240.firebasestorage.app",
  });
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Middleware to verify admin
async function verifyAdmin(req, res, next) {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
  
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
    //   if (decodedToken.role !== 'admin') {
    //     return res.status(403).json({ error: 'Access denied. Admins only.' });
    //   }
      req.user = decodedToken;
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

// 🔹 Get All Users
// app.get('/users', verifyAdmin, async (req, res) => {
//   try {
//     const limit = parseInt(req.query.limit) || 10;
//     const page = parseInt(req.query.page) || 1;
//     const search = req.query.search?.toLowerCase().replace(/^\s+|\s+$/g, '');
//     const interiorFinish = req.query.interiorFinish === 'true';
//     const painting = req.query.painting === 'true';

//     let query = db.collection('users')
//       .where('role', '==', 'user')
//       .orderBy('fullName') // use only one orderBy
//       .limit(limit);

//     if (search) {
//       query = query
//         .where('fullName', '>=', search)
//         .where('fullName', '<=', search + '\uf8ff');
//     }

//     // Pagination
//     if (page > 1) {
//       const offset = (page - 1) * limit;

//       let baseQuery = db.collection('users')
//         .where('role', '==', 'user')
//         .orderBy('fullName');

//       if (search) {
//         baseQuery = baseQuery
//           .where('fullName', '>=', search)
//           .where('fullName', '<=', search + '\uf8ff');
//       }

//       const previousDocs = await baseQuery.limit(offset).get();
//       const lastVisible = previousDocs.docs[previousDocs.docs.length - 1];
//       if (lastVisible) {
//         query = query.startAfter(lastVisible);
//       }
//     }

//     const snapshot = await query.get();
//     const users = snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() }));

//     // Count query
//     let countQuery = db.collection('users').where('role', '==', 'user');
//     if (search) {
//       countQuery = countQuery
//         .where('fullName', '>=', search)
//         .where('fullName', '<=', search + '\uf8ff');
//     }
//     const countSnapshot = await countQuery.count().get();

//     res.json({
//       status: 'success',
//       users,
//       page,
//       limit,
//       totalRecords: countSnapshot.data().count,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.get('/users', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search?.toLowerCase().replace(/^\s+|\s+$/g, '');
    const interiorFinish = req.query.interiorFinish === 'true';
    const painting = req.query.painting === 'true';

    const companies = [];
    if (interiorFinish) companies.push("Clady Interior Finish, LLC");
    if (painting) companies.push("Clady Painting, LLC");

    // Base query
    let query = db.collection('users')
      .where('role', '==', 'user')
      .orderBy('createdAt', 'desc');

    if (companies.length === 1) {
      query = query.where('companyName', '==', companies[0]);
    } else if (companies.length > 1) {
      query = query.where('companyName', 'in', companies);
    } else {
      // No company selected, short-circuit to return nothing
      return res.json({
        status: 'success',
        users: [],
        page,
        limit,
        totalRecords: 0
      });
    }

    // Search filtering
    if (search) {
      query = query
        .where('fullName', '>=', search)
        .where('fullName', '<=', search + '\uf8ff');
    }

    // Pagination
    if (page > 1) {
      const offset = (page - 1) * limit;
      const prevSnapshot = await query.limit(offset).get();
      const lastVisible = prevSnapshot.docs[prevSnapshot.docs.length - 1];
      if (lastVisible) {
        query = query.startAfter(lastVisible);
      }
    }

    const snapshot = await query.limit(limit).get();
    const users = snapshot.docs.map(doc => ({ userId: doc.id, ...doc.data() }));

    // Count Query
    let countQuery = db.collection('users')
      .where('role', '==', 'user')

      if (companies.length === 1) {
        countQuery = countQuery.where('companyName', '==', companies[0]);
      } else if (companies.length > 1) {
        countQuery = countQuery.where('companyName', 'in', companies);
      }else {
        // No company selected, short-circuit to return nothing
        return res.json({
          status: 'success',
          users: [],
          page,
          limit,
          totalRecords: 0
        });
      }

    if (search) {
      countQuery = countQuery
        .orderBy('fullName')
        .where('fullName', '>=', search)
        .where('fullName', '<=', search + '\uf8ff');
    }

    const countSnapshot = await countQuery.count().get();

    res.json({
      status: 'success',
      users,
      page,
      limit,
      totalRecords: countSnapshot.data().count,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message); // Add this for debugging
    res.status(500).json({ error: error.message });
  }
});



// 🔹 Get single user
app.get('/users/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({
      status: 'success',
      user: { userId: userDoc.id, ...userDoc.data() },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 🔹 Get Gmail by Username
app.get('/get-email/:username', verifyAdmin, async (req, res) => {
  const { username } = req.params;

  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('username', '==', username.toLowerCase().trim()).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    const { email } = userDoc.data();

    res.json({ status: 'success', email });
  } catch (error) {
    console.error('Error fetching user by username:', error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 🔹 Create User
app.post('/users', verifyAdmin, async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, companyName, role, username } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !phoneNumber || !companyName || !username) {
      return res.status(400).json({ status: 'error', error: 'Required fields are missing' });
    }

    const userRecord = await admin.auth().createUser({ email, password });

    await db.collection('users').doc(userRecord.uid).set({
      firstName,
      lastName,
      fullName: `${firstName.toLowerCase().trim()}${lastName.toLowerCase().trim()}`,
      email,
      phoneNumber,
      role,
      companyName,
      username: username.toLowerCase().trim(), // 🔹 Save the username
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'User created successfully', userId: userRecord.uid, status: 'success' });
  } catch (error) {
    res.status(500).json({ error: error.message, status: 'error' });
  }
});


// 🔹 Delete User and Their Attendance
app.delete('/users/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;

  try {
    // Delete Firebase Auth user
    await admin.auth().deleteUser(userId);

    // Delete user document
    await db.collection('users').doc(userId).delete();

    // Get and delete attendance records
    const attendanceSnapshot = await db
      .collection('attendance')
      .where('userId', '==', userId)
      .get();

    if (attendanceSnapshot.empty) {
      return res.json({ status:"success", message: 'User and their attendance deleted successfully' });
    }
    const batch = db.batch();
    attendanceSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    res.json({ status:"success", message: 'User and their attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message, status:'error' });
  }
});

// 🔹 Update User
app.put('/users/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  const { email, firstName, lastName, role, phoneNumber, companyName, password } = req.body;
  if (!firstName || !lastName || !email || !phoneNumber || !companyName) {
    return res.status(400).json({ status: 'error', error: 'Required fields are missing' });
  }

  try {
    // if (email) {
    //   await admin.auth().updateUser(userId, { ...(email && { email }) });
    // }
    const authUpdate = {};
    if (email) authUpdate.email = email;
    if (password) authUpdate.password = password;

    // Update user in Firebase Auth if needed
    if (Object.keys(authUpdate).length > 0) {
      await admin.auth().updateUser(userId, authUpdate);
    }
const fullName = `${firstName.toLowerCase().replace(/^\s+|\s+$/g, '')}${lastName.toLowerCase().replace(/^\s+|\s+$/g, '')}`
    await db.collection('users').doc(userId).update({
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(role && { role }),
      ...(fullName && { fullName }),
      ...(companyName && { companyName }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({status:'success', message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message, status:'error' });
  }
});

app.get('/all-users', verifyAdmin, async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'user')
      .get();

    const users = snapshot.docs.map(doc => ({
      value: doc.id,
      label: `${doc.data().firstName} ${doc.data().lastName}`,
    }));

    res.json({
      status: 'success',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

//Attendance

// 🔹 Get All Attendance
app.get('/attendance', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search?.toLowerCase().replace(/^\s+|\s+$/g, '');
    // const date = req.query.date; // format: "YYYY-MM-DD"
    const startDate = req.query.startDate; // format: "YYYY-MM-DD"
    const endDate = req.query.endDate;

    // Base attendance query
    let attendanceQuery = db.collection('attendance').orderBy('date', 'desc').limit(limit);

    // Pagination logic
    if (page > 1) {
      const offset = (page - 1) * limit;

      let baseQuery = db.collection('attendance').orderBy('date', 'desc');
      const previousDocs = await baseQuery.limit(offset).get();
      const lastVisible = previousDocs.docs[previousDocs.docs.length - 1];
      if (lastVisible) {
        attendanceQuery = attendanceQuery.startAfter(lastVisible);
      }
    }

    // // Date filtering
    // if (date) {
    //   attendanceQuery = attendanceQuery.where('date', '==', date);
    // }

        // Date range filtering
        if (startDate && endDate) {
          attendanceQuery = attendanceQuery.where('date', '>=', startDate)
                                         .where('date', '<=', endDate);
        }

    const attendanceSnapshot = await attendanceQuery.get();
    const attendanceData = [];

    for (const doc of attendanceSnapshot.docs) {
      const data = doc.data();
      const userId = data.userId;

      // Fetch corresponding user data
      const userDoc = await db.collection('users').doc(userId).get();
      const user = userDoc.exists ? userDoc.data() : null;

      // Check if user matches search query
      if (search && !user.fullName.includes(search)) continue;

      attendanceData.push({
        id: doc.id,
        ...data,
        user: {
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          id:userDoc.id,
        },
      });
    }

    // Count total matching records (for pagination info)
    let countQuery = db.collection('attendance');
    if (startDate && endDate) {
      countQuery = countQuery.where('date', '>=', startDate)
                            .where('date', '<=', endDate);
    }
    const countSnapshot = await countQuery.get();

    const filteredData = search
      ? attendanceData
      : countSnapshot.docs.map(doc => ({ attendanceId: doc.id, ...doc.data() }));

    res.json({
      status: 'success',
      data: attendanceData,
      page,
      limit,
      totalRecords: search ? attendanceData.length : filteredData.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Get single attendance
app.get('/attendance/:attendId', verifyAdmin, async (req, res) => {
  try {
    const { attendId } = req.params;

    const userDoc = await db.collection('attendance').doc(attendId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ status: 'error', message: 'Attendance not found' });
    }

    res.json({
      status: 'success',
      user: { id: userDoc.id, ...userDoc.data() },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// 🔹 Create Attendance
app.post('/attendance', verifyAdmin, async (req, res) => {
  const { userId, checkInTime, date } = req.body;

  try {
    if (!userId || !checkInTime || !date) {
      return res.status(400).json({ status: 'error', error: 'Required fields are missing' });
    }
        // Check if attendance already exists for the user on that date
        const existingSnapshot = await db
        .collection('attendance')
        .where('userId', '==', userId)
        .where('date', '==', date)
        .limit(1)
        .get();
  
      if (!existingSnapshot.empty) {
        return res.status(400).json({
          status: 'error',
          error: 'Attendance already exists for this user on the given date',
        });
      }
    const attendanceData = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('attendance').add(attendanceData);

    res.status(201).json({
      status: 'success',
      message: 'Attendance created',
      attendanceId: docRef.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message, status:'error' });
  }
});

// 🔹 Update Attendance
app.put('/attendance/:attendId', verifyAdmin, async (req, res) => {
  const { attendId } = req.params;
  const { userId, checkInTime, date } = req.body;
  if (!userId || !checkInTime || !date) {
    return res.status(400).json({ status: 'error', error: 'Required fields are missing' });
  }

  try {
    await db.collection('attendance').doc(attendId).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({status:'success', message: 'Attendance updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message, status:'error' });
  }
});

// 🔹 Delete Attendance
app.delete('/attendance/:attendId', verifyAdmin, async (req, res) => {
  const { attendId } = req.params;

  try {
    // Delete user document
    await db.collection('attendance').doc(attendId).delete();

    res.json({ status:"success", message: 'Attendance deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message, status:'error' });
  }
});


// Export the express app as Firebase Function
exports.api = functions.https.onRequest(app);