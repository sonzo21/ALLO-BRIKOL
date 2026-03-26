import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { CATEGORIES } from '../constants';

export async function seedDatabase() {
  try {
    // Seed Categories
    let catSnap;
    try {
      catSnap = await getDocs(query(collection(db, 'categories'), limit(1)));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'categories');
      return;
    }

    if (catSnap.empty) {
      for (const cat of CATEGORIES) {
        try {
          await setDoc(doc(db, 'categories', cat.id), cat);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `categories/${cat.id}`);
        }
      }
      console.log('Categories seeded!');
    }

    // Seed some sample artisans if empty
    let artSnap;
    try {
      artSnap = await getDocs(query(collection(db, 'artisans'), limit(1)));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'artisans');
      return;
    }

    if (artSnap.empty) {
      const sampleArtisans = [
        {
          uid: 'sample_1',
          firstName: 'Ahmed',
          lastName: 'Mansouri',
          phoneNumber: '0612345678',
          city: 'Casablanca',
          description: 'Plombier expert avec 10 ans d\'expérience. Spécialisé dans les fuites et installations sanitaires.',
          categories: ['plomberie'],
          hourlyRate: 150,
          isActive: true,
          rating: 4.8,
          reviewCount: 12,
        },
        {
          uid: 'sample_2',
          firstName: 'Yassine',
          lastName: 'Bennani',
          phoneNumber: '0687654321',
          city: 'Rabat',
          description: 'Électricien certifié. Installation, dépannage et mise aux normes électriques.',
          categories: ['electricite'],
          hourlyRate: 200,
          isActive: true,
          rating: 4.9,
          reviewCount: 25,
        }
      ];

      for (const art of sampleArtisans) {
        try {
          await setDoc(doc(db, 'artisans', art.uid), art);
          // Also create a user profile for them
          await setDoc(doc(db, 'users', art.uid), {
            uid: art.uid,
            email: `${art.firstName.toLowerCase()}@example.com`,
            displayName: `${art.firstName} ${art.lastName}`,
            role: 'artisan',
            city: art.city,
            createdAt: new Date(),
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `artisans/${art.uid} or users/${art.uid}`);
        }
      }
      console.log('Sample artisans seeded!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
