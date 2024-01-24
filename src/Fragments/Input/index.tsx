import { forwardRef, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ label, error, ...rest }, ref) => {
    return (
      <div className="mb-2">
        {label ? <label htmlFor={rest.name}>{label}</label> : null}
        <input
          className="bg-zinc-700 appearance-none block w-full px-4 py-3 leading-tight
             text-gray-400 focus:bg-transparent hover:border-yellow-500
              placeholder:text-gray-400 font-bold text-base rounded-[5px]"
          id={rest.name}
          name={rest.name}
          ref={ref}
          type="text"
          {...rest}
        />
        {error ? (
          <p className="text-red-500 text-sm mt-2 font-normal">
            {error.message}
          </p>
        ) : null}
      </div>
    );
  }
);
