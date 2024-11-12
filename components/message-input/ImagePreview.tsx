import Image from 'next/image';

interface ImagePreviewProps {
  previewUrl: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ previewUrl }) => (
  <div className="mb-2">
    <Image
      src={previewUrl}
      alt="Selected image"
      width={100}
      height={100}
      className="rounded-lg object-cover"
      style={{ 
        width: '100px',
        height: '100px',
        maxWidth: '100px',
        maxHeight: '100px',
        objectFit: 'cover'
      }}
    />
  </div>
); 