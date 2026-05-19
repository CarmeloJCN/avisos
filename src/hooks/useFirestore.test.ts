import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  addDocument,
  updateDocument,
  deleteDocument,
  getDocument,
  getLastNumAviso,
  getTecnicoId,
  useCollectionSnapshot
} from './useFirestore';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

vi.mock('firebase/firestore', () => {
  const MockTimestampClass = class {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    toDate() {
      return new Date(this.seconds * 1000);
    }
  };
  return {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    where: vi.fn(),
    onSnapshot: vi.fn(),
    Timestamp: MockTimestampClass
  };
});

vi.mock('../services/firebase', () => ({
  db: {}
}));

describe('useFirestore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addDocument', () => {
    it('calls addDoc with correct collection and data', async () => {
      const mockCollection = { id: 'col-1' };
      vi.mocked(collection).mockReturnValue(mockCollection as any);
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-doc-id' } as any);

      const result = await addDocument('clientes', { nombre: 'New' });

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'clientes');
      expect(addDoc).toHaveBeenCalledWith(mockCollection, { nombre: 'New' });
      expect(result.id).toBe('new-doc-id');
    });
  });

  describe('updateDocument', () => {
    it('calls updateDoc with correct doc reference and data', async () => {
      const mockDoc = { id: 'doc-1' };
      vi.mocked(doc).mockReturnValue(mockDoc as any);
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await updateDocument('clientes', '123', { nombre: 'Updated' });

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'clientes', '123');
      expect(updateDoc).toHaveBeenCalledWith(mockDoc, { nombre: 'Updated' });
    });
  });

  describe('deleteDocument', () => {
    it('calls deleteDoc with correct doc reference', async () => {
      const mockDoc = { id: 'doc-1' };
      vi.mocked(doc).mockReturnValue(mockDoc as any);
      vi.mocked(deleteDoc).mockResolvedValue(undefined as any);

      await deleteDocument('clientes', '123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'clientes', '123');
      expect(deleteDoc).toHaveBeenCalledWith(mockDoc);
    });
  });

  describe('getDocument', () => {
    it('returns document with parsed timestamps if exists', async () => {
      const mockDocRef = { id: 'doc-123' };
      const dateVal = new Date('2026-01-01T12:00:00.000Z');
      const mockTimestamp = new Timestamp(Math.floor(dateVal.getTime() / 1000), 0);

      vi.mocked(doc).mockReturnValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        id: 'doc-123',
        data: () => ({
          nombre: 'Doc Name',
          fechaCita: mockTimestamp
        })
      } as any);

      const result = await getDocument<any>('clientes', 'doc-123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'clientes', 'doc-123');
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual({
        id: 'doc-123',
        nombre: 'Doc Name',
        fechaCita: dateVal
      });
    });

    it('returns null if document does not exist', async () => {
      const mockDocRef = { id: 'doc-123' };
      vi.mocked(doc).mockReturnValue(mockDocRef as any);
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => false
      } as any);

      const result = await getDocument('clientes', 'doc-123');

      expect(result).toBeNull();
    });
  });

  describe('getLastNumAviso', () => {
    it('returns numAviso of the latest aviso if exists', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => ({ numAviso: 'AV-00100' })
          }
        ]
      } as any);

      const num = await getLastNumAviso();

      expect(num).toBe('AV-00100');
    });

    it('returns empty string if no avisos exist', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true
      } as any);

      const num = await getLastNumAviso();

      expect(num).toBe('');
    });
  });

  describe('getTecnicoId', () => {
    it('returns doc id of matched user', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: false,
        docs: [
          { id: 'tecnico-id-xyz' }
        ]
      } as any);

      const id = await getTecnicoId('uid-123');

      expect(id).toBe('tecnico-id-xyz');
    });

    it('returns null if no user matches', async () => {
      vi.mocked(getDocs).mockResolvedValue({
        empty: true
      } as any);

      const id = await getTecnicoId('uid-123');

      expect(id).toBeNull();
    });
  });

  describe('useCollectionSnapshot', () => {
    it('subscribes to onSnapshot and updates data state', async () => {
      const mockUnsubscribe = vi.fn();
      let onSnapshotCallback: any = null;

      vi.mocked(onSnapshot).mockImplementation((_q: any, cb: any) => {
        onSnapshotCallback = cb;
        return mockUnsubscribe;
      });

      const { result, unmount } = renderHook(() =>
        useCollectionSnapshot<any>('avisos', 'numAviso')
      );

      // Loading initially
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toEqual([]);

      // Fire snapshot callback
      const dateVal = new Date('2026-01-01T12:00:00.000Z');
      const mockTimestamp = new Timestamp(Math.floor(dateVal.getTime() / 1000), 0);
      
      act(() => {
        onSnapshotCallback({
          docs: [
            {
              id: 'a1',
              data: () => ({ numAviso: 'AV-001', fechaCita: mockTimestamp })
            }
          ]
        });
      });

      // Data is loaded
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual([
        { id: 'a1', numAviso: 'AV-001', fechaCita: dateVal }
      ]);

      // Unmount should trigger unsubscribe
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
