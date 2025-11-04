import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';

const Home = () => {
  return (
    <section className="" >
      <div className="my-10">
        <Swiper
          className="text-red-500"
          navigation={true}
          pagination={{ dynamicBullets: true }}
          modules={[Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
        >

          <SwiperSlide>
            <div
              className="relative flex flex-col md:flex-row justify-between w-full min-h-[60vh] md:min-h-[49vh] items-center text-white 
                         bg-black bg-center bg-contain bg-no-repeat"
              style={{ backgroundImage: "url('/images.jfif')" }}
            >
              <div className="absolute inset-0 "></div>
              <div className="relative z-10 p-6 sm:p-8 md:p-10 rounded-lg max-w-xl md:ml-10">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Inception</h1>
                <p className="text-xs sm:text-sm text-gray-200 mb-4">
                  Inception (2010): A skilled thief who steals secrets through dream invasion is given a chance at redemption 
                  by performing the impossible: planting an idea in someone’s mind. 
                  A mind-bending thriller exploring dreams within dreams.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="bg-red-600 px-4 py-2 rounded-lg hover:cursor-pointer">
                    Watch Trailer
                  </button>
                  <button className="bg-gray-700 px-4 py-2 rounded-lg hover:cursor-pointer">
                    Add to Watchlist 
                  </button>
                </div>
              </div>

              <div className="relative z-10 p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Cast:</h2>
                <p className="text-xs sm:text-sm text-gray-200">
                  <span className="font-semibold">Leonardo DiCaprio played as: Cobb</span><br />
                  <span className="font-semibold">Cillian Murphy played as: Fischer</span><br />
                  <span className="font-semibold">Tom Hardy played as: Eames</span><br />
                  <span className="font-semibold">Elliot Page played as: Ariadne</span><br />
                </p>
              </div>
            </div>
          </SwiperSlide>

          
          <SwiperSlide>
            <div
              className="relative flex flex-col md:flex-row justify-between w-full min-h-[60vh] md:min-h-[49vh] items-center text-white 
                         bg-black bg-center bg-contain bg-no-repeat"
              style={{ backgroundImage: "url('/interstellar.jfif')" }}
            >
              <div className="absolute inset-0 "></div>
              <div className="relative z-10 p-6 sm:p-8 md:p-10 rounded-lg max-w-xl md:ml-10">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Interstellar</h1>
                <p className="text-xs sm:text-sm text-gray-200 mb-4">
                  Interstellar (2014): In a dystopian future where Earth is dying, a group of explorers travels
                  through a wormhole to find a new home for humanity. 
                  A visually stunning tale of love, sacrifice, and the vastness of space.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="bg-red-600 px-4 py-2 rounded-lg hover:cursor-pointer">
                    Watch Trailer
                  </button>
                  <button className="bg-gray-700 px-4 py-2 rounded-lg hover:cursor-pointer">
                    Add to Watchlist
                  </button>
                </div>
              </div>

              <div className="relative z-10 p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Cast:</h2>
                <p className="text-xs sm:text-sm text-gray-200">
                  <span className="font-semibold">Matthew McConaughey played as: Cooper</span><br />
                  <span className="font-semibold">Timothee Chalamet played as: Tom</span><br />
                  <span className="font-semibold">Anne Hathaway played as: Brand</span><br />
                  <span className="font-semibold">Matt Damon played as: Mann</span><br />
                </p>
              </div>
            </div>
          </SwiperSlide>

          
          <SwiperSlide>
            <div
              className="relative flex flex-col md:flex-row justify-between w-full min-h-[60vh] md:min-h-[49vh] items-center text-white 
                         bg-black bg-center bg-contain bg-no-repeat"
              style={{ backgroundImage: "url('/seven.jfif')" }}
            >
              <div className="absolute inset-0 "></div>
              <div className="relative z-10 p-6 sm:p-8 md:p-10 rounded-lg max-w-xl md:ml-10">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">Se7en</h1>
                <p className="text-xs sm:text-sm text-gray-200 mb-4">
                  Se7en (1995): Two detectives hunt a serial killer who uses the seven deadly sins as his modus operandi. 
                  A dark, gripping thriller that delves into the depths of human depravity.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="bg-red-600 px-4 py-2 rounded-lg hover:cursor-pointer">
                    Watch Trailer
                  </button>
                  <button className="bg-gray-700 px-4 py-2 rounded-lg hover:cursor-pointer">
                    Add to Watchlist
                  </button>
                </div>
              </div>

              <div className="relative z-10 p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Cast:</h2>
                <p className="text-xs sm:text-sm text-gray-200">
                  <span className="font-semibold">Brad Pitt played as: David Mills</span><br />
                  <span className="font-semibold">Cillian Murphy played as: Detective Lt. William Somerset</span><br />
                  <span className="font-semibold">Kevin Spacey played as: John Doe</span><br />
                  <span className="font-semibold">Gwyneth Paltrow played as: Tracy Mills</span><br />
                </p>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
};

export default Home;
