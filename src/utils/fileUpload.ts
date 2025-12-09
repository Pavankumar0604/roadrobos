import { supabase } from '../supabaseClient';

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucketName - The name of the storage bucket
 * @param folder - Optional folder path in the bucket
 * @returns The public URL of the uploaded file
 */
export const uploadFileToStorage = async (
    file: File,
    bucketName: string = 'booking-documents',
    folder: string = ''
): Promise<{ url: string; path: string }> => {
    try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder ? folder + '/' : ''}${timestamp}_${randomString}.${fileExt}`;

        // Upload file
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            throw new Error(`Failed to upload file: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

        return {
            url: publicUrl,
            path: data.path
        };
    } catch (error: any) {
        console.error('File upload error:', error);
        throw error;
    }
};

/**
 * Upload multiple booking documents
 * @param documents - Object containing the document files
 * @returns Object with URLs for each document
 */
export const uploadBookingDocuments = async (documents: {
    aadhaar?: File;
    pan?: File;
    license?: File;
}): Promise<{
    aadhaarUrl?: string;
    panUrl?: string;
    licenseUrl?: string;
}> => {
    const results: any = {};

    try {
        // Upload Aadhaar if provided
        if (documents.aadhaar) {
            const { url } = await uploadFileToStorage(documents.aadhaar, 'booking-documents', 'aadhaar');
            results.aadhaarUrl = url;
        }

        // Upload PAN if provided
        if (documents.pan) {
            const { url } = await uploadFileToStorage(documents.pan, 'booking-documents', 'pan');
            results.panUrl = url;
        }

        // Upload License if provided
        if (documents.license) {
            const { url } = await uploadFileToStorage(documents.license, 'booking-documents', 'license');
            results.licenseUrl = url;
        }

        return results;
    } catch (error: any) {
        console.error('Document upload error:', error);
        throw new Error(`Failed to upload documents: ${error.message}`);
    }
};

/**
 * Delete a file from Supabase Storage
 * @param filePath - The path of the file in storage
 * @param bucketName - The name of the storage bucket
 */
export const deleteFileFromStorage = async (
    filePath: string,
    bucketName: string = 'booking-documents'
): Promise<void> => {
    try {
        const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

        if (error) {
            console.error('Delete error:', error);
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    } catch (error: any) {
        console.error('File delete error:', error);
        throw error;
    }
};
