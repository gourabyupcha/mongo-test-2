import { firestore } from "./firebase";

export const addDataToFirestore = async (bookingData) => {
  try {
    const bid = bookingData._id.toString();

    const minimalData = {
      bookingId: bid,
      consumerId: bookingData.consumerId,
      consumerEmail: bookingData.consumerEmail,
      sellerId: bookingData.sellerId,
      status: bookingData.status,
      createdAt: new Date(), // or bookingData.createdAt
    };

    await firestore.collection('bookings').doc(bid).set(minimalData);
    console.log("✅ Synced minimal booking to Firestore");
  } catch (firebaseError) {
    console.error("❌ Failed to sync booking to Firestore:", firebaseError);
  }
};

