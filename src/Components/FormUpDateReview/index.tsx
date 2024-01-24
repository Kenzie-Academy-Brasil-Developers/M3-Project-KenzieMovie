import { useContext, useState } from "react";
import { MoviesContext } from "../../providers/MoviesContext/MovieContext";
import { SubmitHandler, useForm } from "react-hook-form";
import blackstar from "../../assets/blackstar.svg";
import { IReview } from "../../providers/MoviesContext/@types";

export const FormUpdateReview = ({ reviewId }: { reviewId: number }) => {
  const { handleUpdateReviews } = useContext(MoviesContext);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IReview>();
  const submit: SubmitHandler<IReview> = async (formData) => {
    if (selectedReviewId !== null) {
      const updatedFormData = { review: formData };
      handleUpdateReviews(selectedReviewId, updatedFormData);
    }
  };
  

  const handleClick = (reviewId: number) => {
    setSelectedReviewId(reviewId);
  };

  return (
    <>
      <form className="flex flex-col" onSubmit={handleSubmit(submit)}>
        <select
          className="bg-neutral-700 h-14 mb-8"
          {...register("score")}
          aria-invalid={errors.score ? "true" : "false"}
        >
          <option value="">Selecione uma nota</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="6">6</option>
          <option value="7">7</option>
          <option value="8">8</option>
          <option value="9">9</option>
          <option value="10">10</option>
        </select>
        <textarea
          className="bg-neutral-700 mb-8 min-h-[12.5rem] max-h-[12.5rem] resize-none"
          placeholder="Deixe um comentário"
          {...register("description")}
          aria-invalid={errors.description ? "true" : "false"}
        ></textarea>
        <button
          className="flex w-40 bg-amber-400 rounded-4xl h-14 font-bold text-base justify-center items-center  text-black"
          type="submit"
          onClick={() => handleClick(reviewId)} // Certifique-se de substituir 'reviewId' pelo valor correto
        >
          <img src={blackstar} alt="ícone de avaliação" /> Avaliar
        </button>
      </form>
    </>
  );
};
