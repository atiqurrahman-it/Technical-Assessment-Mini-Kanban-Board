import { z } from "zod";

const passwordValidation = z
  .string()
  .min(1, {
    message: "Password is required.",
  })
  .min(8, {
    message: "Password must be at least 8 characters.",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((val) => /\d/.test(val), {
    message: "Password must contain at least one number.",
  })
  .refine((val) => /[!@#$%^&*(),.?\":{}|<>_\-+=~`\[\]\\\\;/]/.test(val), {
    message: "Password must contain at least one special character.",
  })
  .refine((val) => !/012|123|234|345|456|567|678|789/.test(val), {
    message: "Password cannot contain sequential numbers.",
  })
  .refine(
    (val) =>
      !/321|432|543|654|765|876|987|876|765|654|543|432|321|210/.test(val),
    {
      message: "Password cannot contain reverse sequential numbers.",
    },
  )
  .refine(
    (val) =>
      !/abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(
        val,
      ),
    {
      message: "Password cannot contain sequential letters.",
    },
  )
  .refine(
    (val) =>
      !/cba|dcb|edc|fed|gfe|hgf|ihg|jih|kji|lkj|mlk|nml|onm|pon|qpo|rqp|srq|tsr|uts|vut|wvu|xwv|yxw|zyx/i.test(
        val,
      ),
    {
      message: "Password cannot contain reverse sequential letters.",
    },
  );

export default passwordValidation;
