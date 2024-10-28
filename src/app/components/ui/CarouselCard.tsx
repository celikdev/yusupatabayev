"use client";

import Image from "next/image";

interface CarouselCardProps {
  source: any;
}

const CarouselCard = ({ source }: CarouselCardProps) => {
  return (
    <div className="w-full md:h-[100%] flex justify-center ">
      <Image
        src={source}
        alt="fotograf"
        className="md:h-full md:w-full h-96 object-contain"
      />
    </div>
  );
};

export default CarouselCard;
