import { GalleryCarousel } from '@/components/organisms';
import { HttpTypes } from '@medusajs/types';

export const ProductGallery = ({
  images,
}: {
  images: HttpTypes.StoreProduct['images'];
}) => {
  if (!images || images.length === 0) return null;

  if(images.length===1)return <img className="product-visual" src={images[0].url} alt="" width="800" height="800" data-testid="product-gallery"/>;
  return (
    <div data-testid="product-gallery">
      <GalleryCarousel images={images} />
    </div>
  );
};
