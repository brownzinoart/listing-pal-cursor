import React, { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { ListingImage } from '../../types';
import { PlusIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface ImageUploaderProps {
  maxImages: number;
  initialImages?: Omit<ListingImage, 'id'>[];
  onImagesChange: (images: Omit<ListingImage, 'id'>[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ maxImages, initialImages = [], onImagesChange }) => {
  const [images, setImages] = useState<Omit<ListingImage, 'id'>[]>(initialImages);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sync with initialImages prop if it changes externally (e.g., when editing a form)
    setImages(initialImages);
  }, [initialImages]);


  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = event.target.files;
    if (!files) return;

    const newImagesPromises: Promise<Omit<ListingImage, 'id'>>[] = [];
    let currentImageCount = images.length;

    for (let i = 0; i < files.length; i++) {
      if (currentImageCount >= maxImages) {
        setError(`Maximum ${maxImages} images allowed.`);
        break;
      }
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setError(`File "${file.name}" is not a valid image type.`);
        continue;
      }
      // Max file size (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
          setError(`File "${file.name}" is too large (max 5MB).`);
          continue;
      }

      newImagesPromises.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ url: reader.result as string, name: file.name });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
      currentImageCount++;
    }
    
    Promise.all(newImagesPromises)
      .then(resolvedImages => {
        const updatedImages = [...images, ...resolvedImages].slice(0, maxImages);
        setImages(updatedImages);
        onImagesChange(updatedImages);
      })
      .catch(err => {
        console.error("Error reading files:", err);
        setError("Error processing images. Please try again.");
      });
    
    // Clear the file input value so the same file can be selected again if removed and re-added
    event.target.value = '';

  }, [images, maxImages, onImagesChange]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const updatedImages = images.filter((_, index) => index !== indexToRemove);
    setImages(updatedImages);
    onImagesChange(updatedImages);
    setError(null); // Clear error if user is fixing it
  }, [images, onImagesChange]);

  return (
    <div className="space-y-4 overflow-hidden">
      <div className="overflow-hidden">
        <label htmlFor="image-upload" className="block text-sm font-medium text-slate-300 mb-1 break-words">
          Listing Images (up to {maxImages})
        </label>
        <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md overflow-hidden ${images.length >= maxImages ? 'cursor-not-allowed opacity-50' : 'hover:border-brand-primary'}`}>
          <div className="space-y-1 text-center overflow-hidden">
            <PhotoIcon className="mx-auto h-12 w-12 text-brand-primary flex-shrink-0" />
            <div className="flex text-sm text-slate-400 overflow-hidden">
              <label
                htmlFor="image-upload-input"
                className={`relative cursor-pointer bg-slate-800 rounded-md font-medium text-brand-primary hover:text-brand-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-brand-primary break-words ${images.length >= maxImages ? 'pointer-events-none' : ''}`}
              >
                <span>Upload files</span>
                <input 
                    id="image-upload-input" 
                    name="image-upload" 
                    type="file" 
                    className="sr-only" 
                    multiple 
                    accept="image/*" 
                    onChange={handleFileChange}
                    disabled={images.length >= maxImages}
                />
              </label>
              <p className="pl-1 break-words">or drag and drop</p>
            </div>
            <p className="text-xs text-slate-500 break-words">PNG, JPG, GIF up to 5MB each</p>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-red-400 break-words">{error}</p>}
      </div>

      {images.length > 0 && (
        <div className="overflow-hidden">
          <h4 className="text-sm font-medium text-slate-300 mb-2 break-words">Image Previews:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-hidden">
            {images.map((image, index) => (
              <div key={image.url.slice(-20) + index} className="relative group aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={image.name || `Listing image ${index + 1}`}
                  className="w-full h-full object-cover rounded-md shadow-md border border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 flex-shrink-0"
                  aria-label="Remove image"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;