export class ValidationService {
  static isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  static isValidJob(job) {
    return job.title && job.link && this.isValidUrl(job.link);
  }
}