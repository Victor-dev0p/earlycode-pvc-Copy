// lib/algorithms/pairingAlgorithm.js
export const assignTutorToEnrollment = async (enrollmentId, courseId) => {
  try {
    // 1. Query all tutors teaching this course
    const tutorsQuery = query(
      collection(db, 'tutors'),
      where('coursesTaught', 'array-contains', courseId)
    );
    
    const tutorDocs = await getDocs(tutorsQuery);
    
    if (tutorDocs.empty) {
      throw new Error('No tutors available for this course');
    }
    
    // 2. Sort by current student count (ascending) - load balancing
    const tutors = tutorDocs.docs
      .map(doc => ({
        id: doc.id,
        currentStudents: doc.data().currentStudents || 0,
        ...doc.data()
      }))
      .sort((a, b) => a.currentStudents - b.currentStudents);
    
    // 3. Create pairing for tutor with lowest load
    const selectedTutor = tutors[0];
    
    const pairingRef = await addDoc(collection(db, 'pairings'), {
      enrollmentId,
      tutorId: selectedTutor.id,
      status: 'pending',
      assignedDate: new Date(),
      assignmentAttempt: 1,
    });
    
    // 4. Send notification to tutor (optional - can use push/email)
    // await notifyTutor(selectedTutor.id, enrollmentId);
    
    return {
      pairingId: pairingRef.id,
      tutorId: selectedTutor.id,
      status: 'pending'
    };
    
  } catch (error) {
    console.error('Pairing assignment failed:', error);
    throw error;
  }
};

export const handleTutorDecline = async (pairingId, enrollmentId, courseId) => {
  const db = getFirestore();
  
  // 1. Mark current pairing as declined
  await updateDoc(doc(db, 'pairings', pairingId), {
    status: 'declined',
  });
  
  // 2. Get current tutor to exclude
  const pairingDoc = await getDoc(doc(db, 'pairings', pairingId));
  const declinedTutorId = pairingDoc.data().tutorId;
  
  // 3. Get next available tutor (similar to initial assignment)
  const tutorsQuery = query(
    collection(db, 'tutors'),
    where('coursesTaught', 'array-contains', courseId)
  );
  
  const tutorDocs = await getDocs(tutorsQuery);
  
  const tutors = tutorDocs.docs
    .map(doc => ({
      id: doc.id,
      currentStudents: doc.data().currentStudents || 0,
    }))
    .filter(t => t.id !== declinedTutorId) // Exclude declined tutor
    .sort((a, b) => a.currentStudents - b.currentStudents);
  
  if (tutors.length === 0) {
    throw new Error('No more tutors available for reassignment');
  }
  
  // 4. Create new pairing
  const nextTutor = tutors[0];
  const newPairingRef = await addDoc(collection(db, 'pairings'), {
    enrollmentId,
    tutorId: nextTutor.id,
    status: 'pending',
    assignedDate: new Date(),
    assignmentAttempt: 2, // Increment attempt count
  });
  
  return {
    pairingId: newPairingRef.id,
    tutorId: nextTutor.id,
    status: 'pending'
  };
};