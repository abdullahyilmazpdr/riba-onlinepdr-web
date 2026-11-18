import { db } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

export interface SchoolRecord {
  schoolKey: string;
  spreadsheetId: string;
  schoolName?: string;
  district?: string;
  academicYear?: string;
  adminEmail?: string;
  adminUid?: string;
  accessToken?: string;
  serviceAccountKey?: string;
  updatedAt?: string;
  createdAt?: string;
}

const schoolLookupCache = new Map<string, { data: SchoolRecord | null; expiresAt: number }>();
const SCHOOL_CACHE_TTL_MS = 5 * 60 * 1000;

export function invalidateSchoolCache(schoolKey?: string) {
  if (schoolKey) schoolLookupCache.delete(schoolKey.trim());
  else schoolLookupCache.clear();
}

export async function saveSchoolData(
  adminUid: string,
  data: Omit<SchoolRecord, 'updatedAt' | 'adminUid'>
) {
  try {
    const now = new Date().toISOString();
    const record: Record<string, any> = {
      schoolKey: data.schoolKey.trim(),
      spreadsheetId: data.spreadsheetId,
      schoolName: data.schoolName || '',
      district: data.district || '',
      academicYear: data.academicYear || '2026-2027',
      adminEmail: data.adminEmail || '',
      adminUid,
      updatedAt: now,
    };

    if (data.serviceAccountKey !== undefined) {
      record.serviceAccountKey = data.serviceAccountKey;
    }

    const adminSchoolRef = doc(db, 'users', adminUid, 'schools', record.schoolKey);
    const existingSnap = await getDoc(adminSchoolRef);
    if (!existingSnap.exists()) {
      record.createdAt = now;
    }

    await setDoc(adminSchoolRef, record, { merge: true });

    const { accessToken: _ignoreToken, ...publicRecord } = record;
    await setDoc(doc(db, 'schools_by_key', record.schoolKey), publicRecord, { merge: true });

    invalidateSchoolCache(record.schoolKey);
    return true;
  } catch (error) {
    console.error('Firestore kaydetme hatası:', error);
    return false;
  }
}

export async function getSchoolsByAdmin(adminUid: string): Promise<SchoolRecord[]> {
  try {
    const schoolsCol = collection(db, 'users', adminUid, 'schools');
    const qSnap = await getDocs(schoolsCol);
    const list: SchoolRecord[] = [];
    qSnap.forEach((docSnap) => {
      list.push(docSnap.data() as SchoolRecord);
    });
    return list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  } catch (error) {
    console.error('Okulları getirme hatası:', error);
    return [];
  }
}

export async function getSchoolByKey(schoolKey: string): Promise<SchoolRecord | null> {
  try {
    const docRef = doc(db, 'schools_by_key', schoolKey.trim());
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as SchoolRecord) : null;
  } catch (error) {
    console.error('Okul anahtarıyla veri çekme hatası:', error);
    return null;
  }
}

export async function getLatestSchoolData(schoolKey?: string): Promise<SchoolRecord | null> {
  const cleanKey = schoolKey?.trim() || '';
  if (cleanKey) {
    const cached = schoolLookupCache.get(cleanKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
  }

  try {
    if (cleanKey) {
      const byKey = await getSchoolByKey(cleanKey);
      if (byKey) {
        schoolLookupCache.set(cleanKey, {
          data: byKey,
          expiresAt: Date.now() + SCHOOL_CACHE_TTL_MS,
        });
        return byKey;
      }

      const q = query(collection(db, 'schools'), where('schoolKey', '==', cleanKey), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const res = querySnapshot.docs[0].data() as SchoolRecord;
        schoolLookupCache.set(cleanKey, {
          data: res,
          expiresAt: Date.now() + SCHOOL_CACHE_TTL_MS,
        });
        return res;
      }

      schoolLookupCache.set(cleanKey, {
        data: null,
        expiresAt: Date.now() + 60 * 1000,
      });
      return null;
    }

    const q = query(collection(db, 'schools_by_key'), orderBy('updatedAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as SchoolRecord;
    }
    return null;
  } catch (error) {
    console.error('Okul verisi çekme hatası:', error);
    return null;
  }
}

export async function checkSchoolKeyOwnership(
  schoolKey: string,
  currentUid: string
): Promise<{
  exists: boolean;
  isOwner: boolean;
  existingSchool?: SchoolRecord;
}> {
  try {
    const cleanKey = schoolKey.trim();
    if (!cleanKey) return { exists: false, isOwner: false };
    const existing = await getSchoolByKey(cleanKey);
    if (existing) {
      return {
        exists: true,
        isOwner: existing.adminUid === currentUid,
        existingSchool: existing,
      };
    }
    return { exists: false, isOwner: false };
  } catch {
    return { exists: false, isOwner: false };
  }
}
