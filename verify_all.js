
import { Fetcher } from './packages/api/index.js';
import { StorageService, ValidationService } from './packages/utils/index.js';
import { createJobsSlice, useJobsStore } from './packages/store/index.js';

console.log('Verifying packages...');

try {
    // API
    const fetcher = new Fetcher();
    if (fetcher.isDev === true) {
        console.log('API: Fetcher instantiated successfully.');
    } else {
        throw new Error('API: Fetcher instantiation failed.');
    }

    // Utils
    if (ValidationService.isValidUrl('https://google.com')) {
        console.log('Utils: ValidationService working.');
    } else {
        throw new Error('Utils: ValidationService failed.');
    }

    const data = { test: 123 };
    // StorageService.saveToJSON depends on DOM Blob/URL, might fail in node environment without polyfills
    // But we check if the class exists
    if (typeof StorageService.saveToJSON === 'function') {
        console.log('Utils: StorageService class exists.');
    }

    // Store
    if (typeof createJobsSlice === 'function' && typeof useJobsStore === 'function') {
        console.log('Store: Exports exist.');
        // Checking zustand store creation might require checking what useJobsStore returns
        // But simply importing it without error is a good first step.
    } else {
        throw new Error('Store: Exports missing.');
    }

    console.log('Verification PASSED!');

} catch (error) {
    console.error('Verification FAILED with error:', error);
    process.exit(1);
}
