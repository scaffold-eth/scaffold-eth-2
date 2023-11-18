// components/Carousel.tsx
import { useEffect, useState } from "react";
import { Box, Image } from "@chakra-ui/react";

export default function Carousel({ images }: { images: string[] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((currentImageIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [currentImageIndex, images.length]);

  return (
    <Box>
      <Image boxSize="500px" objectFit="cover" src={images[currentImageIndex]} alt={`Slide ${currentImageIndex}`} />
    </Box>
  );
}
