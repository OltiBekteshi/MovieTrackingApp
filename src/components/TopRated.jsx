import React from "react";
import { FaStar } from "react-icons/fa";

const topRatedMovies = [
    {
    title: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    image:
      "/shawshank.jfif",
  },
  {
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    image:
      "/Godfather.jfif",
  },
  {
    title: "The Godfather: Part II",
    year: 1974,
    rating: 9.0,
    image:
      "godfather2.jfif",
  },
  {
    title: "The Lord of the Rings: The Return of the King",
    year: 2003,
    rating: 9.0,
    image:
      "lor2.jfif",
  },
  {
    title: "12 angry Men",
    year: 1957,
    rating: 9.0,
    image:
      "12.jfif",
  },
  
  {
    title: "Schindler's List",
    year: 1993,
    rating: 8.9,
    image:
      "sch.jfif",
  },
  {
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    image:
      "pulp.jfif",
  },
   {
    title: "The Dark Knight",
    year: 2008,
    rating: 8.4,
    image:
      "darkknight.jfif",
  },
   
   
   
];

const TopRated = () => {
  return (
    <section className="bg-black py-12 px-6">
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-lg">
         Top Rated Movies
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {topRatedMovies.map((movie, index) => (
          <div
            key={index}
            className="bg-red-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl "
          >
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-72 object-cover "
            />
            <div className="p-4">
              <h3 className="text-white text-lg font-semibold">{movie.title}</h3>
              <p className=" text-white">{movie.year}</p>
              <div className="flex items-center mt-2">
              
              ⭐  <span className="text-gray-200 font-medium">{movie.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopRated;
