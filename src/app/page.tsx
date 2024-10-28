"use client";

import {
  InstagramIcon,
  LichessIcon,
  WhatsAppIcon,
  YoutubeIcon,
} from "@/assets/icons";
import AnalysisBoard from "./components/AnalysisBoard";
import Card from "./components/ui/Card";
import Link from "next/link";
import Tab from "./components/ui/Tab";

import Fotograf from "@/assets/yusup.jpg";
import Image from "next/image";

import { Carousel } from "@trendyol-js/react-carousel";
import CarouselCard from "@/app/components/ui/CarouselCard";

// Ogrenciler
import Ogrenci1 from "@/assets/carousel/Resim1.jpeg";
import Ogrenci2 from "@/assets/carousel/Resim2.jpeg";
import Ogrenci3 from "@/assets/carousel/Resim3.jpeg";
import Ogrenci4 from "@/assets/carousel/Resim4.jpeg";
import Ogrenci5 from "@/assets/carousel/Resim5.jpeg";
import Ogrenci6 from "@/assets/carousel/Resim6.jpeg";
import Ogrenci7 from "@/assets/carousel/Resim7.jpeg";
import Ogrenci8 from "@/assets/carousel/Resim8.jpeg";

const Home = () => {
  return (
    <main className="flex md:flex-row flex-col md:h-[100vh] w-full p-4 gap-4 main">
      <div className="w-[100%] md:w-[50%] h-[100%] flex flex-col gap-4">
        <div className="w-[100%] h-[30%] flex gap-4">
          <div className="flex flex-col gap-4 w-[60%] h-[100%]">
            <Card className="w-[100%] h-[100%] flex items-center justify-center">
              <h1 className="text-white font-extrabold md:text-4xl text-lg text-center">
                Yusup Atabayev
              </h1>
            </Card>
            <Card className="w-[100%] flex items-center justify-center sm:gap-6 md:gap-8 gap-4">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.instagram.com/yusupatabayev/"
              >
                <InstagramIcon className="fill-white/60 transition-colors w-8 md:w-14 sm:w-12 duration-300 hover:fill-white" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://wa.me/+905526529575"
              >
                <WhatsAppIcon className="fill-white/60 transition-colors w-8 md:w-14 sm:w-12 duration-300 hover:fill-white" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://www.youtube.com/c/Satran%C3%A7Ailesi"
              >
                <YoutubeIcon className="fill-white/60 transition-colors w-8 md:w-14 sm:w-12 duration-300 hover:fill-white" />
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://lichess.org/@/Yusup_Atabayev"
              >
                <LichessIcon
                  className="
              fill-white/60 transition-colors w-8 h-8 md:w-14 md:h-14 sm:w-12 sm:h-12 duration-300 hover:fill-white
              "
                />
              </a>
            </Card>
          </div>
          <Card className="w-[40%] md:h-[100%] flex items-center justify-center">
            <Image
              src={Fotograf}
              alt="fotograf"
              className="object-cover md:w-[200px] md:h-[200px] w-[100px] h-[100px] rounded-full"
            />
          </Card>
        </div>
        <div className="flex gap-4 w-full md:h-[30%] h-max">
          <Card className="w-[100%] h-[100%] flex flex-col gap-4">
            <span className="flex justify-between w-full">
              <h1 className="font-extrabold md:text-3xl text-white/80">
                Hakkımda
              </h1>
            </span>
            <div className="w-full h-full">
              <p className="text-white/70 md:text-base text-sm">
                Merhabalar ben Muhammet Ali YURTSEVEN,24 yaşındayım 5 yaşımdan
                beri yarı aktif (son 4 sene tam aktif olmak üzere) satranç
                oynuyorum. 8-11 yaş arası il birinciliğim ve bir kaç kez de il
                derecelerim var. Bir çok oyuncunun yardımcı antrenörlüğüne
                başladım. Elde ettiğim deneyimlerim ve hazırlıklarımla 2021-2022
                seneleri arasında antrenörlük dersi ve staj görevi yaptım 2022
                yılından beri aktif olarak ders vermekteyim. 1000 -1500 arası
                öğrenciler ile çalışıyorum ve bu seviye arası ile çalışmaktan
                keyif alıyorum. Genelde ilk hedefim öğrencimi 1 sene içerisinde
                iyi bir seviyeye getirip üst kademe antrenörler yardımı ile
                Türkiye satrancına katmak.
              </p>
            </div>
          </Card>
        </div>
        <div className="flex md:h-[40%] h-[20%] gap-4">
          <Card className="w-[60%] h-full flex flex-row items-center justify-center ">
            <Carousel
              transition={0.5}
              show={1}
              slide={1}
              className="md:h-[100%] h-[10%] w-full"
              useArrowKeys
              hideArrows={false}
              infinite
              swiping
              autoSwipe={3000}
            >
              <CarouselCard source={Ogrenci1} />
              <CarouselCard source={Ogrenci2} />
              <CarouselCard source={Ogrenci3} />
              <CarouselCard source={Ogrenci4} />
              <CarouselCard source={Ogrenci5} />
              <CarouselCard source={Ogrenci6} />
              <CarouselCard source={Ogrenci7} />
              <CarouselCard source={Ogrenci8} />
            </Carousel>
          </Card>
          <Card className="w-[40%] h-full items-center justify-center  transition-colors duration-300 hover:bg-white/10">
            <Link
              href="/login"
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <h1 className="text-lg font-semibold text-white">Soru Çöz</h1>
            </Link>
          </Card>
        </div>
      </div>
      <div className="md:w-[50%] h-[100%] w-full flex-col gap-4 flex">
        <Card className="w-[100%] h-[10%] flex-col items-center justify-center px-4 py-0 md:flex hidden">
          <Tab />
        </Card>
        {/* {selectedTab == "AnalysisBoard" ? <AnalysisBoard /> : <About />} */}
        <AnalysisBoard />
      </div>
    </main>
  );
};

export default Home;
