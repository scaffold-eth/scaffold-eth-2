"use client";

import { SubmitHandler, useForm } from "react-hook-form";
import { useAccount } from "wagmi";

type IReportFields = {
  hateSpeech: string;
  ignReporter: string;
  ignOffender: string;
  gameName: string;
};

const Report = () => {
  const { isConnected } = useAccount();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IReportFields>();
  const onSubmit: SubmitHandler<IReportFields> = data => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex items-center justify-center min-h-dvh ">
        <div className="card glass w-1/3 h-3/4">
          <div className="card-body h-full flex space-between">
            <h2 className="card-title justify-center">Report Hate Speech!</h2>
            <div className="flex-1">
              <label className="form-control">
                <div className="label">
                  <span className="label-text text-base">Please input the hate speech faced</span>
                </div>
                <textarea
                  className="textarea textarea-accent rounded-md min-h-24 w-auto textarea-lg"
                  placeholder="Report the hate speech you encountered"
                  {...register("hateSpeech", { required: true, maxLength: 150, minLength: 10 })}
                  aria-invalid={errors.hateSpeech ? "true" : "false"}
                ></textarea>
                {errors.hateSpeech?.type === "required" && <p role="alert">This field is required</p>}
                {errors.hateSpeech?.type === "maxLength" && (
                  <p role="alert">Please keep the length less than 150 characters</p>
                )}
                {errors.hateSpeech?.type === "minLength" && <p role="alert">Please enter at lease 10 characters</p>}
              </label>
              <label className="form-control w-auto">
                <div className="label">
                  <span className="label-text">What is your in game name?</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered rounded-md w-full"
                  {...register("ignReporter", { required: true, maxLength: 30, minLength: 5 })}
                  aria-invalid={errors.ignReporter ? "true" : "false"}
                />
                {errors.ignReporter?.type === "required" && <p role="alert">This field is required</p>}
                {errors.ignReporter?.type === "maxLength" && (
                  <p role="alert">Please keep the length less than 30 characters</p>
                )}
                {errors.ignReporter?.type === "minLength" && <p role="alert">Please enter at least 5 characters</p>}
              </label>
              <label className="form-control w-auto">
                <div className="label">
                  <span className="label-text">What is the in game name of the offender?</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered rounded-md w-full"
                  {...register("ignOffender", { required: true, maxLength: 30, minLength: 5 })}
                  aria-invalid={errors.ignOffender ? "true" : "false"}
                />
                {errors.ignOffender?.type === "required" && <p role="alert">This field is required</p>}
                {errors.ignOffender?.type === "maxLength" && (
                  <p role="alert">Please keep the length less than 30 characters</p>
                )}
                {errors.ignOffender?.type === "minLength" && <p role="alert">Please enter at least 5 characters</p>}
              </label>
              <label className="form-control w-auto">
                <div className="label">
                  <span className="label-text">Name of the game</span>
                </div>
                <input
                  type="text"
                  placeholder="Type here"
                  className="input input-bordered rounded-md w-full"
                  {...register("gameName", { required: true, maxLength: 30, minLength: 5 })}
                  aria-invalid={errors.gameName ? "true" : "false"}
                />
                {errors.gameName?.type === "required" && <p role="alert">This field is required</p>}
                {errors.gameName?.type === "maxLength" && (
                  <p role="alert">Please keep the length less than 30 characters</p>
                )}
                {errors.gameName?.type === "minLength" && <p role="alert">Please enter at least 5 characters</p>}
              </label>
            </div>
            <div className="card-actions justify-center items p-2">
              <button type="submit" className="btn dark:btn-primary btn-accent" disabled={!isConnected}>
                {isConnected ? "Report now!" : "Connect your wallet to report"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Report;
