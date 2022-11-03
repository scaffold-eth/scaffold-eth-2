import React, { FC } from "react";

// TODO Remove this in future
interface IErrorToast {
  errorMessage: string;
}

const ErrorToast: FC<IErrorToast> = ({ errorMessage }) => {
  return (
    <div className="toast toast-bottom toast-start max-w-sm">
      <div className="alert alert-error">
        <div>{errorMessage}</div>
      </div>
    </div>
  );
};

export default ErrorToast;
