import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Pagination } from "swiper/modules";
import OscarsWinners from "../components/OscarsWinners";
import MovieFacts from "../components/MovieFacts";
import TopRated from "../components/TopRated";

const Home = ({ watchlist, setWatchlist }) => {
  const swiperRef = useRef(null);
  const slides = [
    {
      title: "Inception",
      description:
        "Inception (2010): A skilled thief who steals secrets through dream invasion is given a chance at redemption by performing the impossible: planting an idea in someone’s mind. A mind-bending thriller exploring dreams within dreams.",
      trailer: "https://www.youtube.com/watch?v=Qwe6qXFTdgc",
      image: "/images.jfif",
      cast: [
        { name: "Leonardo DiCaprio", role: "Cobb" },
        { name: "Cillian Murphy", role: "Fischer" },
        { name: "Tom Hardy", role: "Eames" },
        { name: "Elliot Page", role: "Ariadne" },
      ],
    },
    {
      title: "The Dark Knight",
      description:
        "The Dark Knight (2008): When a menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman, James Gordon and Harvey Dent must work together to put an end to the madness.",
      trailer: "https://www.youtube.com/watch?v=vbjYVETxZqM",
      image: "/darkknight.jfif",
      cast: [
        { name: "Christian Bale", role: "Bruce Wayne" },
        { name: "Heath Ledger", role: "Joker" },
        { name: "Aaron Eckhart", role: "Harvey Dent" },
        { name: "Michael Caine", role: "Alfred" },
      ],
    },
    {
      title: "Zodiac",
      description:
        "Zodiac (2007): Between 1968 and 1983, a San Francisco cartoonist becomes an amateur detective obsessed with tracking down the Zodiac Killer, an unidentified individual who terrorizes Northern California with a killing spree.",
      trailer: "https://www.youtube.com/watch?v=yNncHPl1UXg",
      image: "/zodiac.jfif",
      cast: [
        { name: "Jake Gyllenhaal", role: "Robert Graysmith" },
        { name: "Mark Ruffalo", role: "Inspector David Toschi" },
        { name: "Anthony Edwards", role: "Inspector William Armstrong" },
        { name: "Robert Downey Jr.", role: "Paul Avery" },
      ],
    },
    {
      title: "The Invisible Guest",
      description:
        "The Invisible Guest (2016): A young businessman wakes up in a hotel room locked from the inside with the dead body of his lover next to him. He hires a prestigious lawyer, and over one night they work together to clarify what happened in a frenetic race against time.",
      trailer: "https://www.youtube.com/watch?v=epCg2RbyF80",
      image: "/invisible.jfif",
      cast: [
        { name: "Mario Casas", role: "Adrian Doria" },
        { name: "Ana Wagener", role: "Virginia Goodman" },
        { name: "Jose Coronado", role: "Tomas Garrido" },
        { name: "Barbara Lennie", role: "Laura Vidal" },
      ],
    },
    {
      title: "Interstellar",
      description:
        "Interstellar (2014): In a dystopian future where Earth is dying, a group of explorers travels through a wormhole to find a new home for humanity. A visually stunning tale of love, sacrifice, and the vastness of space.",
      trailer: "https://www.youtube.com/watch?v=2LqzF5WauAw",
      image: "/interstellar.jfif",
      cast: [
        { name: "Matthew McConaughey", role: "Cooper" },
        { name: "Timothee Chalamet", role: "Tom" },
        { name: "Anne Hathaway", role: "Brand" },
        { name: "Matt Damon", role: "Mann" },
      ],
    },
    {
      title: "Se7en",
      description:
        "Se7en (1995): Two detectives hunt a serial killer who uses the seven deadly sins as his modus operandi. A dark, gripping thriller that delves into the depths of human depravity.",
      trailer: "https://www.youtube.com/watch?v=KPOuJGkpblk",
      image: "/seven.jfif",
      cast: [
        { name: "Brad Pitt", role: "David Mills" },
        { name: "Morgan Freeman", role: "Detective Lt. William Somerset" },
        { name: "Kevin Spacey", role: "John Doe" },
        { name: "Gwyneth Paltrow", role: "Tracy Mills" },
      ],
    },
  ];
  const handleAddToWatchlist = (movie) => {
    if (!watchlist.find((m) => m.title === movie.title)) {
      setWatchlist([...watchlist, movie]);
      alert(`${movie.title} added to your watchlist!`);
    } else {
      alert(`${movie.title} is already in your watchlist.`);
    }
  };

  return (
    <>
      <section className="w-full max-w-full lg:max-w-6xl mx-auto space-y-4 flex justify-center pt-28 md:pt-24">
        <div className="flex w-full justify-between">
          <button
            className="customPrev text-white "
            onClick={() => swiperRef.current?.slideNext(-1)}
          >
            Back
          </button>
          <button
            className="customNext text-white"
            onClick={() => swiperRef.current?.slideNext()}
          >
            Next
          </button>
        </div>
        <Swiper
          navigation={{
            nextEl: ".customNext",
            prevEl: ".customPrev",
          }}
          pagination={{ dynamicBullets: true }}
          modules={[Navigation, Pagination]}
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
                    className="rounded-xl object-fit w-[90%] md:w-[80%] max-h-[600px] shadow-lg "
                  />
                </div>

                <div className="w-full md:w-1/2 flex flex-col md:flex-row justify-between mt-6 md:mt-0 md:ml-10 gap-8">
                  <div className="md:w-1/2 justify-between">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-wrap">
                      {movie.title}
                    </h1>
                    <p className="text-sm text-gray-300 mb-4">
                      {movie.description}
                    </p>

                    <div className="grid grid-cols-1 sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => window.open(movie.trailer, "_blank")}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{
                          duration: 0.4,
                          scale: {
                            type: "spring",
                            visualDuration: 0.4,
                            bounce: 0,
                          },
                        }}
                        className="bg-red-600 px-4 py-2 text-nowrap w-full rounded-lg hover:bg-red-700 transition hover:cursor-pointer"
                      >
                        Watch Trailer
                      </button>

                      <button
                        onClick={() => handleAddToWatchlist(movie)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{
                          duration: 0.4,
                          scale: {
                            type: "spring",
                            visualDuration: 0.4,
                            bounce: 0,
                          },
                        }}
                        className="bg-gray-700 text-nowrap px-4 py-2 w-full rounded-lg hover:bg-gray-800 transition hover:cursor-pointer"
                      >
                        Add to Watchlist
                      </button>
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">
                      Cast:
                    </h2>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {movie.cast.map((actor, i) => (
                        <span key={i} className="block mb-1">
                          <span className="font-semibold">{actor.name}</span> as{" "}
                          {actor.role}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <TopRated />
      <OscarsWinners />
      <MovieFacts />
    </>
  );
};

export default Home;
