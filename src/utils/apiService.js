// apiService.js
import apiClient from './apiClient';

export async function getPresignedUrl(imageKey) {
    console.log('Getting presigned URL for imageKey: ' + imageKey);
    try {
        const response = await apiClient.get(`/generate-presigned-url`, {
            params: { imageKey },
        });
        return response.data.url || '/default-avatar.jpg';
    } catch (error) {
        console.error('Error fetching presigned URL:', error);
        return '/default-avatar.jpg'; // Fallback to a default image in case of error
    }
}
