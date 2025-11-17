import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import { slides } from "../utils/dummyData";

const OscarsWinners = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full bg-linear-to-r from-blue-500  to-green-900 shadow-md py-10">
      <h3 className="text-white pl-4 font-bold text-5xl pb-6 flex justify-center ">
        10 filmat me më shumë çmime Oscar
      </h3>
      <div className="max-w-6xl mx-auto px-4 ">
        <Swiper
          spaceBetween={50}
          autoplay={{
            delay: 3200,
            disableOnInteraction: false,
          }}
          effect="fade"
          pagination={{ clickable: true }}
          modules={[EffectFade, Pagination, Autoplay]}
          autoHeight={true}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col md:flex-row items-start gap-6 py-6 max-w-6xl w-full ">
                <div className="shrink-0 w-full md:w-1/3">
                  <img
                    src={slide.img}
                    alt={slide.title}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover rounded-xl shadow-lg "
                  />
                </div>

                {activeIndex === index && (
                  <div className="text-white w-full md:w-2/3 space-y-3">
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {slide.title}
                    </h2>
                    <p className="text-sm md:text-base ">{slide.text}</p>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default OscarsWinners;
