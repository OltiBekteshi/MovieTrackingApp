import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import slides from "../../slides.json";
import { toast } from "sonner";

const Swipper = ({ watchlist, setWatchlist }) => {
  const swiperRef = useRef(null);

  const handleAddToWatchlist = (movie) => {
    if (!watchlist.find((m) => m.title === movie.title)) {
      setWatchlist([...watchlist, movie]);
      toast.success(`${movie.title} added to your watchlist!`);
    } else {
      toast(`${movie.title} is already in your watchlist.`);
    }
  };

  return (
    <section className="w-full max-w-full lg:max-w-6xl mx-auto pt-28 md:pt-24 bg-black ">
      <h3>
        <p className="font-oswald text-white flex justify-center font-bold text-4xl p-3">
          Top trending Movies
        </p>
      </h3>
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        navigation={{
          nextEl: ".customNext",
          prevEl: ".customPrev",
        }}
        pagination={{ dynamicBullets: true }}
        modules={[Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={1}
        className="pb-10"
      >
        {slides.map((movie, index) => (
          <SwiperSlide key={index}>
            <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-[60vh] bg-black text-white p-6 md:p-10">
              <div className="w-full md:w-1/2 flex justify-center">
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="rounded-xl object-fit w-[90%] md:w-[80%] max-h-[600px] shadow-lg mr-10"
                />
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-between mt-6 md:mt-0 md:ml-1 gap-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {movie.title}
                  </h1>
                  <p className="text-sm text-gray-300 mb-4 mr-10">
                    {movie.description}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.open(movie.trailer, "_blank")}
                      className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition w-fit sm:w-auto hover:cursor-pointer mr-0"
                    >
                      Watch Trailer
                    </button>

                    <button
                      onClick={() => handleAddToWatchlist(movie)}
                      className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-800 transition w-fit sm:w-auto hover:cursor-pointer mr-10"
                    >
                      Add to Watchlist
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-4">Cast:</h2>
                  <div className="text-sm text-gray-300 leading-relaxed">
                    {movie.cast.map((actor, i) => (
                      <span key={i} className="block mb-1">
                        <span className="font-semibold">{actor.name}</span> as{" "}
                        {actor.role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="flex justify-between items-center w-full max-w-md mx-auto mt-6 px-4">
        <button
          className="customPrev bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 hover:cursor-pointer"
          onClick={() => swiperRef.current?.slidePrev()}
        >
          Back
        </button>
        <button
          className="customNext bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 hover:cursor-pointer"
          onClick={() => swiperRef.current?.slideNext()}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default Swipper;
