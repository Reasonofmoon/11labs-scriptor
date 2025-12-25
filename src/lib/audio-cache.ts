export class AudioCache {
  private urlCache: Map<number, string> = new Map();
  private blobCache: Map<number, Blob> = new Map();

  set(index: number, blob: Blob): string {
    this.blobCache.set(index, blob);
    const url = URL.createObjectURL(blob);
    this.urlCache.set(index, url);
    return url;
  }

  getUrl(index: number): string | undefined {
    return this.urlCache.get(index);
  }

  getBlob(index: number): Blob | undefined {
    return this.blobCache.get(index);
  }

  has(index: number): boolean {
    return this.urlCache.has(index) && this.blobCache.has(index);
  }

  clear(): void {
    this.urlCache.forEach(url => URL.revokeObjectURL(url));
    this.urlCache.clear();
    this.blobCache.clear();
  }

  getAllBlobs(): Map<number, Blob> {
    return new Map(this.blobCache);
  }
}
