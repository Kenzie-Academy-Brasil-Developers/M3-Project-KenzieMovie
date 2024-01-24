import { createContext, useState, useEffect, useContext } from "react";
import { api } from "../../service/api";
import { Slide, toast } from "react-toastify";
import {
  IMoviesProviderProps,
  IMovie,
  IReview,
  IMoviesContext,
  IMovieDetails,
} from "./@types";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext/UserContext";

export const MoviesContext = createContext({} as IMoviesContext);

export const MoviesProvider = ({ children }: IMoviesProviderProps) => {
  const { user, isLoading, setIsLoading } = useContext(UserContext);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenUpDate, setIsOpenUpDate] = useState(false);
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [moviesDetails, setMoviesDetails] = useState<IMovieDetails[]>([]);


  

  const getMovies = async () => {
    try {
      setIsLoading(true)
      const response = await api.get("/movies");
      const movies = response.data;

      for (const movie of movies) {
        const { data } = await api.get(`/movies/${movie.id}?_embed=reviews`);
        movie.reviews = data.reviews;
      }
      setMovies(movies);
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      console.error("Error retrieving movies:", error);
      setMovies([]);
    }
  };
  useEffect(() => {
    getMovies();
  }, []);

  const handleMoviesDetails = async (moviesId: number) => {
    try {
      const token = localStorage
        .getItem("@kenzieMovies:token")
        ?.replace(/"/g, "");
      const { data } = await api.get(`/movies/${moviesId}?_embed=reviews`);
      const updatedReviews = await Promise.all(
        data.reviews.map(async (review: IReview) => {
          const userResponse = await api.get(`/users/${review.userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          let userName = userResponse.data.name;

          if (userName === "anomino") {
            userName = "Usuário Anônimo";
          }

          return { ...review, userName };
        })
      );

      const updatedMovie = { ...data, reviews: updatedReviews };

      setMoviesDetails([updatedMovie]);

      navigate(`/movies/${moviesId}`);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }finally {
      if (isLoading) {
        setIsLoading(false)
      }
    }
  };

  const createReview = async (formData: IReview) => {
    try {
      const token = localStorage
        .getItem("@kenzieMovies:token")
        ?.replace(/"/g, "");
      const body = {
        userId: user?.id,
        movieId: moviesDetails[0].id,
        score: formData.score,
        description: formData.description,
      };

      await api.post("/reviews", body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      handleMoviesDetails(body.movieId);

      setIsOpen(false);

      toast.success("Avaliação realizada com sucesso!", {
        transition: Slide,
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Ocorreu um erro ao tentar realizar a operação solicitada.", {
        transition: Slide,
        autoClose: 2000,
      });
    }finally {
      if (isLoading) {
        setIsLoading(false)
      }
    }
  };

  const handleUpdateReviews = async (
    reviewId: number,
    formData: { review: IReview }
  ) => {
    try {
      const token = localStorage
        .getItem("@kenzieMovies:token")
        ?.replace(/"/g, "");

      const body = {
        userId: user?.id,
        movieId: moviesDetails[0].id,
        score: formData.review.score,
        description: formData.review.description,
      };

      await api.put(`/reviews/${reviewId}`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReviews((prevReviews) =>
        prevReviews.map((review) => {
          if (review.id === reviewId) {
            return {
              ...review,
              status: formData.review,
            };
          }
          return review;
        })
      );

      await handleMoviesDetails(body.movieId);

      setIsOpenUpDate(false);

      toast.success("Status atualizado com sucesso!", {
        transition: Slide,
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Ocorreu um erro ao tentar realizar a operação solicitada.", {
        transition: Slide,
        autoClose: 2000,
      });
    }finally {
      if (isLoading) {
        setIsLoading(false)
      }
    }
  };

  const handleDelete = async (reviewId: number) => {
    const movieId = moviesDetails[0].id;

    const token = localStorage
      .getItem("@kenzieMovies:token")
      ?.replace(/"/g, "");
    try {
      await api.delete(`/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReviews((reviews) =>
        reviews.filter((review) => review.id !== reviewId)
      );
      handleMoviesDetails(movieId);
      toast.success("Exclusão realizada com Sucesso!", {
        transition: Slide,
        autoClose: 2000,
      });
    } catch (error) {
      toast.error("Ocorreu um erro ao tentar realizar a operação solicitada.", {
        transition: Slide,
        autoClose: 2000,
      });
    }finally {
      if (isLoading) {
        setIsLoading(false)
      }
    }
  };

  return (
    <MoviesContext.Provider
      value={{
        movies,
        reviews,
        setMovies,
        getMovies,
        handleDelete,
        createReview,
        handleUpdateReviews,
        handleMoviesDetails,
        moviesDetails,
        isOpen,
        setIsOpen,
        navigate,
        isOpenUpDate,
        setIsOpenUpDate,
      }}
    >
      {children}
    </MoviesContext.Provider>
  );
};
