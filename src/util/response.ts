import { globals } from "./const";

export const successResponse = (
  res: any,
  status_code: number,
  message: string,
  data: any
) => {
  res
    .status(status_code)
    .json({ message: message, data: data, status: globals.Success });
};

export const errorResponse = (
  res: any,
  status_code: number,
  message: string,
  data: any
) => {
  res
    .status(status_code)
    .json({ message: message, data: data, status: globals.Failed });
};
