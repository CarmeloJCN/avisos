import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadPdf, deletePdf } from './storage';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

vi.mock('firebase/storage', () => ({
  ref: vi.fn(() => ({ id: 'mock-ref' } as any)),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}));

vi.mock('../services/firebase', () => ({
  storage: {}
}));

describe('storage lib', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadPdf', () => {
    it('uploads blob to firebase storage and returns the download url', async () => {
      const mockBlob = new Blob(['pdf data'], { type: 'application/pdf' });
      vi.mocked(uploadBytesResumable).mockResolvedValueOnce({} as any);
      vi.mocked(getDownloadURL).mockResolvedValueOnce('https://storage/pdf/av-123.pdf');

      const url = await uploadPdf('AV-123', mockBlob);

      expect(ref).toHaveBeenCalledWith(expect.anything(), '/pdfs/AV-123.pdf');
      expect(uploadBytesResumable).toHaveBeenCalledWith({ id: 'mock-ref' }, mockBlob);
      expect(getDownloadURL).toHaveBeenCalledWith({ id: 'mock-ref' });
      expect(url).toBe('https://storage/pdf/av-123.pdf');
    });
  });

  describe('deletePdf', () => {
    it('deletes the pdf from firebase storage', async () => {
      vi.mocked(deleteObject).mockResolvedValueOnce();

      await deletePdf('AV-123');

      expect(ref).toHaveBeenCalledWith(expect.anything(), '/pdfs/AV-123.pdf');
      expect(deleteObject).toHaveBeenCalledWith({ id: 'mock-ref' });
    });

    it('ignores error if file deletion fails (e.g. file does not exist)', async () => {
      vi.mocked(deleteObject).mockRejectedValueOnce(new Error('object-not-found'));

      // Should not throw
      await expect(deletePdf('AV-123')).resolves.not.toThrow();
      expect(deleteObject).toHaveBeenCalledTimes(1);
    });
  });
});
